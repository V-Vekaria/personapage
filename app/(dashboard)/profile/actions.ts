'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) redirect('/login')

  // Parse skills from comma-separated string into array
  const skills = (formData.get('skills') as string)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  // Parse projects — each project sends 3 parallel arrays by field name
  const projectTitles = formData.getAll('project_title') as string[]
  const projectDescriptions = formData.getAll('project_description') as string[]
  const projectTechs = formData.getAll('project_tech') as string[]

  const projects = projectTitles
    .map((title, i) => ({
      title: title.trim(),
      description: projectDescriptions[i]?.trim() ?? '',
      tech: projectTechs[i]?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
    }))
    .filter(p => p.title) // Drop any empty project slots

  // Save everything to Supabase
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name') as string,   // Display name on public page
      contact: formData.get('contact') as string,        // LinkedIn or email for CTA
      headline: formData.get('headline') as string,      // Short role description
      bio: formData.get('bio') as string,                // Longer about text
      skills,                                            // Array of skill strings
      tone: formData.get('tone') as string,              // AI generation tone
      projects,                                          // Array of project objects
      updated_at: new Date().toISOString(),
    })
    .eq('id', user!.id)

  if (error) redirect('/profile?error=' + error.message)

  // Revalidate cached pages so changes appear immediately
  revalidatePath('/profile')
  revalidatePath('/dashboard')
  redirect('/profile?success=true')
}