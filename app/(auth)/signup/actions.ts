'use server'

import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import {
  emailSchema,
  passwordSchema,
  RESERVED_USERNAMES,
  storedDraftSchema,
  usernameSchema,
} from '@/lib/validation'

function bail(message: string): never {
  redirect(`/signup?error=${encodeURIComponent(message)}`)
}

function csv(value: string, max: number): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max)
}

/**
 * Turns the /try draft into profile columns.
 *
 * The draft comes from the browser, so it is parsed and capped like any other
 * untrusted input. A draft that fails to parse is dropped silently — losing a
 * prefill is a far better outcome than failing the signup over it.
 */
function profileFromDraft(raw: FormDataEntryValue | null): Record<string, unknown> {
  if (typeof raw !== 'string' || !raw || raw.length > 8000) return {}

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {}
  }

  const draft = storedDraftSchema.safeParse(parsed)
  if (!draft.success) return {}

  const { full_name, headline, bio, skills, tone, project } = draft.data
  const projects = project.title
    ? [{ title: project.title, description: project.description, tech: csv(project.tech, 10) }]
    : []

  return {
    ...(full_name ? { full_name } : {}),
    ...(headline ? { headline } : {}),
    ...(bio ? { bio } : {}),
    ...(skills ? { skills: csv(skills, 30) } : {}),
    ...(projects.length ? { projects } : {}),
    tone,
  }
}

export async function signup(formData: FormData) {
  const username = usernameSchema.safeParse(formData.get('username'))
  if (!username.success) bail(username.error.issues[0]?.message ?? 'Invalid username')

  if (RESERVED_USERNAMES.has(username.data)) {
    bail('That username is reserved — pick another.')
  }

  const email = emailSchema.safeParse(formData.get('email'))
  if (!email.success) bail(email.error.issues[0]?.message ?? 'Invalid email')

  const password = passwordSchema.safeParse(formData.get('password'))
  if (!password.success) bail(password.error.issues[0]?.message ?? 'Invalid password')

  // Checked with the admin client on purpose: the signed-out anon client is
  // subject to RLS, so a policy change could silently turn this check into a
  // no-op and surface a raw constraint violation instead. The unique index on
  // lower(username) is still the real guarantee.
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('profiles')
    .select('username')
    .ilike('username', username.data)
    .maybeSingle()

  if (existing) bail('That username is already taken.')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
  })

  if (error) bail(error.message)
  if (!data.user) bail('Could not create that account.')

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    username: username.data,
    ...profileFromDraft(formData.get('draft')),
  })

  if (profileError) {
    // 23505 means someone claimed the username between the check and the insert.
    bail(
      profileError.code === '23505'
        ? 'That username was just taken — try another.'
        : 'Account created, but your profile could not be set up. Try signing in.'
    )
  }

  // signUp does not set cookies in every Supabase configuration, so sign in
  // explicitly to guarantee the browser leaves with a session.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  })

  // Email confirmation being required is a success, not a failure.
  if (signInError) redirect('/login?error=Account created — sign in to continue')

  redirect('/dashboard')
}
