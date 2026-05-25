'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Basic validation
  if (username.length < 3) {
    redirect('/signup?error=Username must be at least 3 characters')
  }

  if (password.length < 8) {
    redirect('/signup?error=Password must be at least 8 characters')
  }

  // Check username taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existing) {
    redirect('/signup?error=Username already taken')
  }

  // Create auth user
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/signup?error=' + error.message)
  }

  // Create profile row
  if (data.user) {
    await supabase.from('profiles').insert({
      user_id: data.user.id,
      username,
      email,
    })
  }

  redirect('/dashboard')
}