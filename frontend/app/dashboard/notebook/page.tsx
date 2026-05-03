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
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-[#FFF5F7] via-rose-gold/10 to-blush-pink/30 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/20 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/30 rounded-full blur-[100px] opacity-40 pointer-events-none" />

      <NotebookClient userId={user.id} />
      
      <SanctuaryDock />
    </main>
  );
}
