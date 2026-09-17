'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=Enter your email and password')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  // Deliberately vague: distinguishing "no such account" from "wrong password"
  // turns the login form into an account-existence oracle.
  if (error) redirect('/login?error=Invalid email or password')

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
