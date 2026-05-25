'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const skills = (formData.get('skills') as string)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const { error } = await supabase
    .from('profiles')
    .update({
      headline: formData.get('headline') as string,
      bio: formData.get('bio') as string,
      skills,
      tone: formData.get('tone') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user!.id)

  if (error) redirect('/profile?error=' + error.message)

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  redirect('/profile?success=true')   
}