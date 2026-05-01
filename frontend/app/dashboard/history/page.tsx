import React from 'react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = new Date().toISOString().split('T')[0];

  // Note: Using delivery_date based on our earlier dashboard schema pattern.
  // We'll safely fallback to 'scheduled_for' if it exists.
  const { data: letters } = await supabase
    .from('letters')
    .select('*')
    .eq('user_id', user.id)
    .lt('delivery_date', today)
    .order('delivery_date', { ascending: false });

  // Helper to format date into a short, stamped look
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'UNKNOWN';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(d);
  };

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-silk-white to-blush-pink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/40 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        <header className="text-center mb-12 w-full relative">
          <Link
            href="/dashboard"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-[#a57070] hover:text-deep-velvet transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4">
            Past Letters
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
        </header>

        {(!letters || letters.length === 0) ? (
          <div className="w-full max-w-md text-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-glass-sm mt-8">
            <p className="text-deep-velvet/60 font-serif italic text-lg">
              No past letters found.
            </p>
            <p className="text-[#a57070] text-xs uppercase tracking-widest mt-4">
              Your story is just beginning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 w-full">
            {letters.map((letter) => {
              const dateStr = letter.delivery_date || letter.scheduled_for;
              return (
                <div
                  key={letter.id}
                  className="group relative aspect-[3/4] cursor-pointer hover:-translate-y-2 transition-all duration-300 ease-out"
                >
                  {/* Folded Note Body using clip-path to physically cut the top-right corner */}
                  <div
                    className="absolute inset-0 bg-white shadow-md transition-shadow group-hover:shadow-glass-sm"
                    style={{
                      clipPath:
                        'polygon(0 0, calc(100% - 36px) 0, 100% 36px, 100% 100%, 0 100%)',
                    }}
                  >
                    {/* Inner border to give it a "paper" look */}
                    <div className="absolute inset-2 border border-rose-gold/20 rounded-sm" />

                    {/* Central Date Stamp */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 rounded-full border-[3px] border-[#a57070]/30 flex flex-col items-center justify-center transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 opacity-60 group-hover:opacity-100 group-hover:border-[#a57070]/60">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#a57070] mb-1">
                          Opened
                        </span>
                        <span className="text-sm font-serif font-bold text-deep-velvet text-center px-2 leading-tight">
                          {dateStr ? formatDate(dateStr) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* The Physical "Fold" Flap */}
                  <div
                    className="absolute top-0 right-0 w-[36px] h-[36px] bg-[#f0e4e1] shadow-[-3px_3px_6px_rgba(0,0,0,0.08)] rounded-bl-lg transform origin-top-right transition-transform group-hover:scale-105"
                  />
                  
                  {/* Subtle Title Overlay at bottom inside the note */}
                  <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                    <span className="text-xs font-serif text-deep-velvet/50 truncate block px-2">
                       {letter.title || 'A Letter for You'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}