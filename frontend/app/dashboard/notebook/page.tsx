import React from 'react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import SanctuaryDock from '../../../components/SanctuaryDock';
import NotebookClient from './NotebookClient';

export default async function NotebookPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-background relative overflow-hidden font-vt323">

      <NotebookClient userId={user.id} />
      
      <SanctuaryDock />
    </main>
  );
}
