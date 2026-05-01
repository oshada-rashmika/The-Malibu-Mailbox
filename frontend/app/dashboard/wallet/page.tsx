import React from 'react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import WalletClient from './WalletClient';
import SanctuaryDock from '../../../components/SanctuaryDock';
import { API_BASE_URL } from '../../../utils/api';

export default async function WalletPage() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's vouchers directly using Supabase
  const { data: supabaseVouchers, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vouchers:', error);
  }

  const apiVouchers = supabaseVouchers || [];

  // Map backend scheme (is_redeemed) to our frontend expectation (is_used)
  const vouchers = apiVouchers.map((v: any) => ({
    ...v,
    is_used: v.is_redeemed,
  }));

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-silk-white to-blush-pink relative overflow-hidden">
      {/* Branded Background Motif */}
      <div className="fixed bottom-[-5%] right-[-5%] w-[400px] md:w-[600px] h-auto opacity-[0.05] pointer-events-none select-none z-0">
        <img src="/logo.png" alt="Malibu Logo" className="w-full h-full grayscale brightness-50" />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/40 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <WalletClient vouchers={vouchers} />
      <SanctuaryDock />
    </main>
  );
}
