import React from 'react';
import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Envelope from '../../components/Envelope';
import CountdownTimer from '../../components/CountdownTimer';
import DashboardNav from '../../components/DashboardNav';

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
  // Assuming a 'letters' table exists with a user_id and delivery_date column.
  // We query for a letter that is scheduled for today or earlier, ordered by the most recent.
  const today = new Date().toISOString().split('T')[0];
  
  const { data: letter } = await supabase
    .from('letters')
    .select('*')
    .eq('user_id', user.id)
    .lte('delivery_date', today)
    .order('delivery_date', { ascending: false })
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

          {/* Today's Envelope section */}
          {letter ? (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Envelope>
                <div className="flex flex-col items-center text-center px-2 py-4 h-full max-h-[140px] overflow-y-auto">
                  <h2 className="text-xl font-serif text-deep-velvet mb-3">
                    {letter.title || 'A Letter for You'}
                  </h2>
                  <p className="text-xs font-sans text-deep-velvet/80 leading-relaxed whitespace-pre-wrap">
                    {letter.content || "Dearest...\n\nYour love story unfolds here."}
                  </p>
                </div>
              </Envelope>
            </div>
          ) : (
            <div className="w-full text-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-glass-sm mt-8">
              <p className="text-deep-velvet/60 font-serif italic text-lg">
                The mailbox is currently empty.
              </p>
              <p className="text-[#a57070] text-xs uppercase tracking-widest mt-4">
                Patience, my love.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}