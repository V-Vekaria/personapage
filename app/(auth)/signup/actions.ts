'use server'

import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import {
  emailSchema,
  passwordSchema,
  RESERVED_USERNAMES,
  usernameSchema,
} from '@/lib/validation'

function bail(message: string): never {
  redirect(`/signup?error=${encodeURIComponent(message)}`)
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
