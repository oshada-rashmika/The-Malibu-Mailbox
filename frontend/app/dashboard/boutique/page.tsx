import React from 'react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import SanctuaryDock from '../../../components/SanctuaryDock'; // Assuming you use this globally
import BoutiqueClient from '../../../components/BoutiqueClient';

export default async function BoutiquePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-silk-white via-rose-gold/30 to-blush-pink/60 relative overflow-hidden">
      {/* Branded Background Motif */}
      <div className="fixed bottom-[-5%] right-[-5%] w-[400px] md:w-[600px] h-auto opacity-[0.05] pointer-events-none select-none z-0">
        <img src="/logo.png" alt="Malibu Logo" className="w-full h-full grayscale brightness-50" />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/30 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

      <BoutiqueClient userId={user.id} />
      <SanctuaryDock />
    </main>
  );
}