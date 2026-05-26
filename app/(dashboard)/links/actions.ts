'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateSlug(username: string, context: string): string {
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${username}-${context.replace('_', '-')}-${suffix}`
}

export async function createLink(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile?.username) {
    redirect('/links?error=Complete your profile first')
  }

  const context = formData.get('context_type') as string
  const label = formData.get('label') as string
  const slug = generateSlug(profile.username, context)

  const { error } = await supabase.from('links').insert({
    user_id: user.id,
    context,
    label: label || '',
    slug,
  })

  if (error) redirect('/links?error=' + error.message)

  revalidatePath('/links')
  redirect('/links?success=true')
}