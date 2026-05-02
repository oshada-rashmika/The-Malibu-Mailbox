'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { API_BASE_URL } from '../../utils/api';


// Dynamically import react-quill-new to prevent SSR window reference errors and React 19 findDOMNode issues
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-white/5 animate-pulse rounded-2xl border border-white/10" />
});

export default function AdminForms() {
  const [activeTab, setActiveTab] = useState<'letters' | 'vouchers' | 'flowers'>('letters');

  // Letter State
  const [letterTitle, setLetterTitle] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterDate, setLetterDate] = useState('');
  const [letterUserId, setLetterUserId] = useState('');
  const [letterStatus, setLetterStatus] = useState({ loading: false, message: '', isError: false });

  // Voucher State
  const [voucherTitle, setVoucherTitle] = useState('');
  const [voucherDesc, setVoucherDesc] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherUserId, setVoucherUserId] = useState('');
  const [voucherStatus, setVoucherStatus] = useState({ loading: false, message: '', isError: false });

  // Flower State
  const [flowerType, setFlowerType] = useState('Rose');
  const [flowerMeaning, setFlowerMeaning] = useState('');
  const [flowerColor, setFlowerColor] = useState('#e11d48');
  const [flowerUserId, setFlowerUserId] = useState('');
  const [flowerStatus, setFlowerStatus] = useState({ loading: false, message: '', isError: false });

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterContent || !letterDate) {
      setLetterStatus({ loading: false, message: 'Content and Date are required.', isError: true });
      return;
    }
    setLetterStatus({ loading: true, message: 'Scheduling...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/letters`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: letterTitle,
          content: letterContent,
          date: letterDate,
          user_id: letterUserId || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to schedule letter');
      }
      setLetterStatus({ loading: false, message: data.message, isError: false });
      setLetterTitle('');
      setLetterContent('');
      setLetterDate('');
      // Keep UserID filled to make batch adding easier
      
      // Clear success message after 3 seconds
      setTimeout(() => setLetterStatus({ loading: false, message: '', isError: false }), 3000);
    } catch (err: any) {
      setLetterStatus({ loading: false, message: err.message, isError: true });
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherTitle || !voucherDesc) {
      setVoucherStatus({ loading: false, message: 'Title and Description are required.', isError: true });
      return;
    }
    setVoucherStatus({ loading: true, message: 'Minting...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: voucherTitle,
          description: voucherDesc,
          code: voucherCode || null,
          user_id: voucherUserId || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to mint voucher');
      }
      setVoucherStatus({ loading: false, message: data.message, isError: false });
      setVoucherTitle('');
      setVoucherDesc('');
      setVoucherCode('');
      
      setTimeout(() => setVoucherStatus({ loading: false, message: '', isError: false }), 3000);
    } catch (err: any) {
      setVoucherStatus({ loading: false, message: err.message, isError: true });
    }
  };

  const handleFlowerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowerType || !flowerMeaning || !flowerColor || !flowerUserId) {
      setFlowerStatus({ loading: false, message: 'All flower fields and recipient ID are required.', isError: true });
      return;
    }
    setFlowerStatus({ loading: true, message: 'Minting seed...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/flowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flower_type: flowerType,
          meaning: flowerMeaning,
          color_hex: flowerColor,
          recipient_id: flowerUserId.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to mint flower');
      }
      setFlowerStatus({ loading: false, message: data.message, isError: false });
      setFlowerMeaning('');
      // flowerType and color remain to make batch adding easier
      
      setTimeout(() => setFlowerStatus({ loading: false, message: '', isError: false }), 3000);
    } catch (err: any) {
      setFlowerStatus({ loading: false, message: err.message, isError: true });
    }
  };

  return (
    <div className="w-full">
      {/* Module Switcher using the Noir palette */}
      <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-sm mb-12 relative w-full sm:w-auto overflow-hidden">
        <button
          onClick={() => setActiveTab('letters')}
          className={`flex-1 sm:flex-none px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all z-10 ${
            activeTab === 'letters' ? 'bg-rose-gold text-deep-velvet' : 'text-silk-white/60 hover:text-silk-white'
          }`}
        >
          Letter Studio
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex-1 sm:flex-none px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all z-10 ${
            activeTab === 'vouchers' ? 'bg-rose-gold text-deep-velvet' : 'text-silk-white/60 hover:text-silk-white'
          }`}
        >
          Voucher Mint
        </button>
        <button
          onClick={() => setActiveTab('flowers')}
          className={`flex-1 sm:flex-none px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all z-10 ${
            activeTab === 'flowers' ? 'bg-rose-gold text-deep-velvet' : 'text-silk-white/60 hover:text-silk-white'
          }`}
        >
          Florist Boutique
        </button>
      </div>

      {/* ----------- LETTER FORM ----------- */}
      {activeTab === 'letters' && (
        <form onSubmit={handleLetterSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-4">
              <span className="text-rose-gold font-serif text-xl">L</span>
            </div>
            <h2 className="text-2xl font-serif text-silk-white">Schedule A Letter</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Title</label>
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  placeholder="e.g. My Dearest..."
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Delivery Date *</label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  required
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Letter Body *</label>
              {/* Wrapping Quill in a specific div to hijack the light theme of standard Quill snow into Noir */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0a0a0a]/50 quill-noir text-silk-white">
                <ReactQuill 
                  theme="snow" 
                  value={letterContent} 
                  onChange={setLetterContent}
                  placeholder="Write your story here..."
                  className="h-64 mb-10" // added mb-10 because quill puts toolbar on top and container extends
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Recipient User ID (Optional)</label>
              <input
                type="text"
                value={letterUserId}
                onChange={(e) => setLetterUserId(e.target.value)}
                placeholder="UUID to restrict access..."
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                {letterStatus.message && (
                  <span className={`text-sm font-sans px-4 py-2 rounded-lg ${letterStatus.isError ? 'bg-red-500/20 text-red-300' : 'bg-rose-gold/20 text-rose-gold'}`}>
                    {letterStatus.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={letterStatus.loading}
                className="px-8 py-4 bg-rose-gold text-deep-velvet rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-lg shadow-rose-gold/10 hover:scale-[1.02] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:scale-100"
              >
                {letterStatus.loading ? 'Awaiting System...' : 'Dispatch Letter'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ----------- VOUCHER FORM ----------- */}
      {activeTab === 'vouchers' && (
        <form onSubmit={handleVoucherSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-4">
              <span className="text-rose-gold font-serif text-xl">V</span>
            </div>
            <h2 className="text-2xl font-serif text-silk-white">Mint a New Voucher</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Title *</label>
              <input
                type="text"
                value={voucherTitle}
                onChange={(e) => setVoucherTitle(e.target.value)}
                placeholder="e.g. Dinner at Moss & Mocha"
                required
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Description *</label>
              <textarea
                value={voucherDesc}
                onChange={(e) => setVoucherDesc(e.target.value)}
                placeholder="The details of the memory..."
                required
                rows={4}
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Secret Code (Optional)</label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. LUV-05-EX"
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-rose-gold font-mono placeholder:text-silk-white/20 placeholder:font-sans"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Recipient User ID (Optional)</label>
                <input
                  type="text"
                  value={voucherUserId}
                  onChange={(e) => setVoucherUserId(e.target.value)}
                  placeholder="UUID to restrict access..."
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                {voucherStatus.message && (
                  <span className={`text-sm font-sans px-4 py-2 rounded-lg ${voucherStatus.isError ? 'bg-red-500/20 text-red-300' : 'bg-rose-gold/20 text-rose-gold'}`}>
                    {voucherStatus.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={voucherStatus.loading}
                className="px-8 py-4 bg-transparent border border-rose-gold/40 text-rose-gold rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-lg hover:scale-[1.02] hover:bg-rose-gold hover:text-deep-velvet transition-all duration-300 disabled:opacity-50 disabled:scale-100"
              >
                {voucherStatus.loading ? 'Encrypting...' : 'Mint Voucher'}
              </button>
            </div>
          </div>
        </form>
      )}
      {/* ----------- FLOWER FORM ----------- */}
      {activeTab === 'flowers' && (
        <form onSubmit={handleFlowerSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-4">
              <span className="text-rose-gold font-serif text-xl">❀</span>
            </div>
            <h2 className="text-2xl font-serif text-silk-white">Mint a Flower</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Flower Type *</label>
                <select
                  value={flowerType}
                  onChange={(e) => setFlowerType(e.target.value)}
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white"
                >
                  <option value="Rose">Rose</option>
                  <option value="Tulip">Tulip</option>
                  <option value="Lily">Lily</option>
                  <option value="Sunflower">Sunflower</option>
                  <option value="Orchid">Orchid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Color Palette (Hex) *</label>
                <div className="flex bg-[#0a0a0a]/50 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-rose-gold/50 focus-within:border-rose-gold transition-colors h-[50px]">
                  <input
                    type="color"
                    value={flowerColor}
                    onChange={(e) => setFlowerColor(e.target.value)}
                    className="h-full w-14 border-0 p-0 m-0 bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text"
                    value={flowerColor}
                    onChange={(e) => setFlowerColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none text-silk-white placeholder:text-silk-white/20 font-mono tracking-widest text-sm uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Meaning (Tooltip) *</label>
              <textarea
                value={flowerMeaning}
                onChange={(e) => setFlowerMeaning(e.target.value)}
                placeholder="e.g. Perfect Happiness"
                rows={3}
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20 resize-none font-serif italic"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Recipient User ID *</label>
              <input
                type="text"
                value={flowerUserId}
                onChange={(e) => setFlowerUserId(e.target.value)}
                placeholder="UUID of the recipient..."
                required
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                {flowerStatus.message && (
                  <span className={`text-sm font-sans px-4 py-2 rounded-lg ${flowerStatus.isError ? 'bg-red-500/20 text-red-300' : 'bg-rose-gold/20 text-rose-gold'}`}>
                    {flowerStatus.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={flowerStatus.loading}
                className="px-8 py-4 bg-rose-gold text-deep-velvet rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-lg shadow-rose-gold/10 hover:scale-[1.02] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:scale-100"
              >
                {flowerStatus.loading ? 'Minting...' : 'Mint Flower'}
              </button>
            </div>
          </div>
        </form>
      )}    </div>
  );
}