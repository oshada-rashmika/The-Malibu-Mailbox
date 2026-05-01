'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to sign in.' };
  }

  // Check their role immediately after logging in
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    // Immediate sign out if not admin
    await supabase.auth.signOut();
    return { error: 'Unauthorized: Admins only' };
  }

  // Use the requested redirect to admin dashboard, or to the root admin path
  redirect('/admin');
}