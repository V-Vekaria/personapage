'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { RESERVED_USERNAMES, toneSchema, usernameSchema } from '@/lib/validation'
import type { Project } from '@/types/database'

function bail(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, key: string, max = 2000): string {
  return String(formData.get(key) ?? '').trim().slice(0, max)
}

function csv(value: string, max = 40): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max)
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: current } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // Projects arrive as three parallel arrays, one entry per row in the editor.
  const titles = formData.getAll('project_title').map(String)
  const descriptions = formData.getAll('project_description').map(String)
  const techs = formData.getAll('project_tech').map(String)

  const projects: Project[] = titles
    .map((title, i) => ({
      title: title.trim().slice(0, 120),
      description: (descriptions[i] ?? '').trim().slice(0, 600),
      tech: csv(techs[i] ?? '', 15),
    }))
    .filter((project) => project.title)
    .slice(0, 20)

  const tone = toneSchema.safeParse(formData.get('tone'))

  const update: Record<string, unknown> = {
    full_name: text(formData, 'full_name', 120),
    contact: text(formData, 'contact', 300),
    headline: text(formData, 'headline', 200),
    bio: text(formData, 'bio', 2000),
    skills: csv(text(formData, 'skills', 1000), 30),
    tone: tone.success ? tone.data : 'neutral',
    projects,
  }

  // The username is the public URL, so changing it breaks every link already
  // shared. Only touch it when it actually changed, and validate it as strictly
  // as signup does.
  const requested = formData.get('username')
  if (requested !== null) {
    const parsed = usernameSchema.safeParse(requested)
    if (!parsed.success) bail(parsed.error.issues[0]?.message ?? 'Invalid username')

    if (parsed.data !== current?.username) {
      if (RESERVED_USERNAMES.has(parsed.data)) bail('That username is reserved — pick another.')

      const { data: taken } = await createAdminClient()
        .from('profiles')
        .select('id')
        .ilike('username', parsed.data)
        .maybeSingle()

      if (taken) bail('That username is already taken.')
      update.username = parsed.data
    }
  }

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id)

  if (error) {
    bail(error.code === '23505' ? 'That username is already taken.' : error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  revalidatePath('/links')
  redirect('/profile?success=Profile saved')
}
