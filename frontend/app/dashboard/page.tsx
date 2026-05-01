import React from 'react';
import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '../../components/DashboardNav';
import CountdownTimer from '../../components/CountdownTimer';
import LetterClient from '../../components/LetterClient';


export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Verify user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch today's letter. 
  const today = new Date().toISOString().split('T')[0];
  
  const { data: letter } = await supabase
    .from('letters')
    .select('*')
    .eq('user_id', user.id)
    .lte('scheduled_for', today)
    .order('scheduled_for', { ascending: false })
    .limit(1)
    .single();

  return (
    <main className="min-h-screen w-full flex flex-col items-center py-20 px-4 bg-gradient-to-br from-silk-white to-blush-pink relative overflow-hidden">
      {/* Ambient glowing embellishments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-gold/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blush-pink/40 rounded-full blur-[100px] opacity-70 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        <DashboardNav />

        <header className="text-center mb-16 max-w-2xl w-full">
          <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4">
            Your Sanctuary
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
        </header>

        <section className="w-full max-w-2xl flex flex-col items-center space-y-16">
          {/* Global Countdown Timer */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2.5rem] shadow-glass-sm w-full">
            <CountdownTimer />
          </div>

          <LetterClient letter={letter} />
        </section>
      </div>
    </main>
  );
}