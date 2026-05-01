import React from 'react';
import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import WalletClient from './WalletClient';

export default async function WalletPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's vouchers via API
  const res = await fetch('http://localhost:5000/api/vouchers', {
    cache: 'no-store', // Optional: disable caching so the UI stays fresh
  });

  const body = await res.json();
  const apiVouchers = body?.data || [];

  // Map backend scheme (is_redeemed) to our frontend expectation (is_used)
  const vouchers = apiVouchers.map((v: any) => ({
    ...v,
    is_used: v.is_redeemed,
  }));

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-silk-white to-blush-pink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/40 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <WalletClient vouchers={vouchers} />
    </main>
  );
}