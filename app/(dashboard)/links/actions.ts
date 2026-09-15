'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/slug'
import { contextSchema, generatedContentSchema } from '@/lib/validation'
import type { Context } from '@/types/database'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

function encodeMessage(path: string, key: 'error' | 'success', value: string): string {
  return `${path}?${key}=${encodeURIComponent(value)}`
}

export async function createLink(formData: FormData) {
  const { supabase, user } = await requireUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    redirect(encodeMessage('/links', 'error', 'Add a username on your profile first.'))
  }

  const context = contextSchema.safeParse(formData.get('context_type'))
  if (!context.success) {
    redirect(encodeMessage('/links', 'error', 'Pick a valid context.'))
  }

  const label = ((formData.get('label') as string) ?? '').trim().slice(0, 120)

  // The slug has a random suffix, so a clash is rare but not impossible.
  // Retry a few times rather than showing the user a constraint violation.
  let lastError = 'Could not create that link.'
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug(profile.username, context.data)
    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      context: context.data,
      label,
      slug,
    })

    if (!error) {
      revalidatePath('/links')
      revalidatePath('/dashboard')
      redirect('/links?success=Link created')
    }

    // 23505 is unique_violation — only that is worth retrying.
    if (error.code !== '23505') {
      lastError = error.message
      break
    }
  }

  redirect(encodeMessage('/links', 'error', lastError))
}

export async function updateLinkDetails(formData: FormData) {
  const { supabase, user } = await requireUser()

  const id = formData.get('link_id') as string
  const context = contextSchema.safeParse(formData.get('context'))
  if (!id || !context.success) {
    redirect(encodeMessage('/links', 'error', 'Could not update that link.'))
  }

  const label = ((formData.get('label') as string) ?? '').trim().slice(0, 120)

  const { error } = await supabase
    .from('links')
    .update({ label, context: context.data as Context })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) redirect(encodeMessage(`/links/${id}`, 'error', error.message))

  revalidatePath(`/links/${id}`)
  revalidatePath('/links')
  redirect(`/links/${id}?success=Details saved`)
}

/**
 * Saves hand-edited profile content. Editing is the point: the model gets you
 * 90% of the way and you fix the last 10% yourself rather than regenerating and
 * hoping.
 */
export async function saveGeneratedContent(formData: FormData) {
  const { supabase, user } = await requireUser()

  const id = formData.get('link_id') as string
  if (!id) redirect(encodeMessage('/links', 'error', 'Could not save that content.'))

  const parsed = generatedContentSchema.safeParse({
    headline: formData.get('headline'),
    summary: formData.get('summary'),
    skills: ((formData.get('skills') as string) ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    cta_text: formData.get('cta_text'),
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]
    redirect(
      encodeMessage(`/links/${id}`, 'error', `${first?.path.join('.') || 'Content'}: ${first?.message ?? 'invalid'}`)
    )
  }

  const { error } = await supabase
    .from('links')
    .update({ generated_content: parsed.data })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) redirect(encodeMessage(`/links/${id}`, 'error', error.message))

  revalidatePath(`/links/${id}`)
  revalidatePath('/links')
  redirect(`/links/${id}?success=Content saved`)
}

export async function toggleLinkActive(formData: FormData) {
  const { supabase, user } = await requireUser()

  const id = formData.get('link_id') as string
  const nextActive = formData.get('is_active') === 'true'
  if (!id) redirect(encodeMessage('/links', 'error', 'Could not update that link.'))

  const { error } = await supabase
    .from('links')
    .update({ is_active: nextActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) redirect(encodeMessage(`/links/${id}`, 'error', error.message))

  revalidatePath(`/links/${id}`)
  revalidatePath('/links')
  redirect(`/links/${id}?success=${nextActive ? 'Link is live' : 'Link paused'}`)
}

export async function deleteLink(formData: FormData) {
  const { supabase, user } = await requireUser()

  const id = formData.get('link_id') as string
  if (!id) redirect(encodeMessage('/links', 'error', 'Could not delete that link.'))

  const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', user.id)

  if (error) redirect(encodeMessage(`/links/${id}`, 'error', error.message))

  revalidatePath('/links')
  revalidatePath('/dashboard')
  redirect('/links?success=Link deleted')
}
