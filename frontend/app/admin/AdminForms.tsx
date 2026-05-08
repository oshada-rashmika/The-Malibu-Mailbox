'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { API_BASE_URL } from '../../utils/api';
import type { CanvasElement } from '../../types/canvas';

// LetterCanvas is client-only (uses ResizeObserver + react-rnd)
const LetterCanvas = dynamic(() => import('../../components/LetterCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-white/5 animate-pulse rounded-3xl border border-white/10 flex items-center justify-center">
      <span className="text-silk-white/20 text-xs uppercase tracking-widest">Loading canvas…</span>
    </div>
  ),
});

const FLOWER_OPTIONS = [
  'blue',
  'cornflower',
  'flower',
  'Hibiscus',
  'lily',
  'poppy',
  'purple',
  'rose',
  'sunflower',
  'tulip'
] as const;

const FLOWER_CHUNK_SIZE = 10;

type FlowerOption = (typeof FLOWER_OPTIONS)[number];

const createEmptyFlowerCounts = (): Record<FlowerOption, number> => {
  const counts = {} as Record<FlowerOption, number>;
  FLOWER_OPTIONS.forEach((flower) => {
    counts[flower] = 0;
  });
  return counts;
};

const formatFlowerLabel = (flower: FlowerOption) =>
  flower === 'Hibiscus' ? 'Hibiscus' : `${flower[0].toUpperCase()}${flower.slice(1)}`;

export default function AdminForms() {
  const [activeTab, setActiveTab] = useState<'letters' | 'vouchers' | 'flowers' | 'notebook'>('letters');

  // Letter State
  const [letterTitle, setLetterTitle] = useState('');
  const [letterElements, setLetterElements] = useState<CanvasElement[]>([]);
  const [letterDate, setLetterDate] = useState('');
  const [letterUserId, setLetterUserId] = useState('');
  const [letterStatus, setLetterStatus] = useState({ loading: false, message: '', isError: false });

  // Voucher State
  const [voucherTitle, setVoucherTitle] = useState('');
  const [voucherDesc, setVoucherDesc] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherUserId, setVoucherUserId] = useState('');
  const [voucherStatus, setVoucherStatus] = useState({ loading: false, message: '', isError: false });

  // Bouquet State
  const [noteTo, setNoteTo] = useState('');
  const [noteFrom, setNoteFrom] = useState('');
  const [romanticMessage, setRomanticMessage] = useState('');
  const [bouquetUserId, setBouquetUserId] = useState('');
  const [flowerCounts, setFlowerCounts] = useState<Record<FlowerOption, number>>(createEmptyFlowerCounts);
  const [flowerStatus, setFlowerStatus] = useState({ loading: false, message: '', isError: false });

  // Notebook State
  const [receivedNotes, setReceivedNotes] = useState<any[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notebookStatus, setNotebookStatus] = useState({ loading: false, message: '', isError: false });
  const [toast, setToast] = useState({ show: false, message: '' });

  const ADMIN_ID = '4245ce5a-0f2a-4716-a2ff-d3993d5a5700';
  const SENURI_ID = '6cbc990d-8540-4df5-b73c-9662e4e341d1';

  const totalFlowers = FLOWER_OPTIONS.reduce((sum, flower) => sum + flowerCounts[flower], 0);
  const bouquetCount = totalFlowers > 0 ? Math.ceil(totalFlowers / FLOWER_CHUNK_SIZE) : 0;

  const adjustFlowerCount = (flower: FlowerOption, delta: number) => {
    setFlowerCounts((prev) => {
      const next = { ...prev };
      next[flower] = Math.max(0, (next[flower] || 0) + delta);
      return next;
    });
  };

  const resetFlowerSelection = () => {
    setFlowerCounts(createEmptyFlowerCounts());
  };

  const resetBouquetForm = () => {
    setNoteTo('');
    setNoteFrom('');
    setRomanticMessage('');
    setFlowerCounts(createEmptyFlowerCounts());
  };

  React.useEffect(() => {
    if (activeTab === 'notebook') {
      fetchNotes();
    }
  }, [activeTab]);

  const fetchNotes = async () => {
    setNotebookStatus({ loading: true, message: 'Retrieving notes...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/notebook?user_id=${ADMIN_ID}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch notes');
      
      // Filter notes where Senuri is the sender
      const senuriNotes = data.data.filter((note: any) => note.sender_id === SENURI_ID);
      setReceivedNotes(senuriNotes);
      setNotebookStatus({ loading: false, message: '', isError: false });
    } catch (err: any) {
      setNotebookStatus({ loading: false, message: err.message, isError: true });
    }
  };

  const handleKiss = async (noteId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notebook/${noteId}/kiss`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send kiss');
      
      setToast({ show: true, message: 'Kiss Sent 💋' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
      
      // Update local state
      setReceivedNotes(prev => prev.map(n => n.id === noteId ? { ...n, kisses: (n.kisses || 0) + 1 } : n));
    } catch (err: any) {
      console.error('Kiss error:', err.message);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    
    setNotebookStatus({ loading: true, message: 'Sharing note...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/notebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: ADMIN_ID,
          recipient_id: SENURI_ID,
          content: newNoteContent
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to share note');
      
      setNotebookStatus({ loading: false, message: 'Note Shared ✨', isError: false });
      setNewNoteContent('');
      setTimeout(() => setNotebookStatus({ loading: false, message: '', isError: false }), 3000);
    } catch (err: any) {
      setNotebookStatus({ loading: false, message: err.message, isError: true });
    }
  };

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterDate) {
      setLetterStatus({ loading: false, message: 'Delivery date is required.', isError: true });
      return;
    }
    if (letterElements.length === 0) {
      setLetterStatus({ loading: false, message: 'Add at least one canvas element.', isError: true });
      return;
    }
    setLetterStatus({ loading: true, message: 'Scheduling...', isError: false });
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/letters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: letterTitle,
          // JSONB column: send the array directly (not stringified)
          content: letterElements,
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
      setLetterElements([]);
      setLetterDate('');
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
    const trimmedNoteTo = noteTo.trim();
    const trimmedNoteFrom = noteFrom.trim();
    const trimmedMessage = romanticMessage.trim();
    const trimmedUserId = bouquetUserId.trim();
    const flowers = FLOWER_OPTIONS.flatMap((flower) =>
      Array.from({ length: flowerCounts[flower] }, () => flower)
    );

    if (!trimmedNoteTo || !trimmedNoteFrom || !trimmedMessage) {
      setFlowerStatus({
        loading: false,
        message: 'Note to, note from, and message are required.',
        isError: true
      });
      return;
    }

    if (!trimmedUserId) {
      setFlowerStatus({
        loading: false,
        message: 'Recipient user ID is required.',
        isError: true
      });
      return;
    }

    if (flowers.length === 0) {
      setFlowerStatus({
        loading: false,
        message: 'Select at least one flower for the bouquet.',
        isError: true
      });
      return;
    }

    setFlowerStatus({ loading: true, message: 'Arranging bouquet(s)...', isError: false });
    try {
      const chunks: FlowerOption[][] = [];
      for (let i = 0; i < flowers.length; i += FLOWER_CHUNK_SIZE) {
        chunks.push(flowers.slice(i, i + FLOWER_CHUNK_SIZE) as FlowerOption[]);
      }

      for (const chunk of chunks) {
        const res = await fetch(`${API_BASE_URL}/api/admin/bouquets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note_to: trimmedNoteTo,
            note_from: trimmedNoteFrom,
            message: trimmedMessage,
            recipient_id: trimmedUserId,
            flowers: chunk
          })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to create bouquet');
        }
      }

      const suffix = chunks.length === 1 ? '' : 's';
      setFlowerStatus({
        loading: false,
        message: `Bouquet${suffix} created (${chunks.length}).`,
        isError: false
      });
      resetBouquetForm();

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
        <button
          onClick={() => setActiveTab('notebook')}
          className={`flex-1 sm:flex-none px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all z-10 ${
            activeTab === 'notebook' ? 'bg-rose-gold text-deep-velvet' : 'text-silk-white/60 hover:text-silk-white'
          }`}
        >
          Notebook Manager
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

            {/* ── Canvas Letter Editor ── */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Letter Canvas *</label>
              <p className="text-[10px] text-silk-white/30 uppercase tracking-widest ml-1 mb-3">
                9:16 · Drag to move · Resize handles · Select then edit properties above
              </p>
              <LetterCanvas
                elements={letterElements}
                onChange={setLetterElements}
              />
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
            <h2 className="text-2xl font-serif text-silk-white">Compose a Bouquet</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Note To *</label>
                <input
                  type="text"
                  value={noteTo}
                  onChange={(e) => setNoteTo(e.target.value)}
                  placeholder="e.g. For Senuri"
                  required
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Note From *</label>
                <input
                  type="text"
                  value={noteFrom}
                  onChange={(e) => setNoteFrom(e.target.value)}
                  placeholder="e.g. With all my heart"
                  required
                  className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Romantic Card Message *</label>
              <textarea
                value={romanticMessage}
                onChange={(e) => setRomanticMessage(e.target.value)}
                placeholder="Write the romantic card that sits with the bouquet..."
                rows={4}
                required
                className="w-full px-5 py-4 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Recipient User ID *</label>
              <input
                type="text"
                value={bouquetUserId}
                onChange={(e) => setBouquetUserId(e.target.value)}
                placeholder="UUID of the recipient..."
                required
                className="w-full px-5 py-3 bg-[#0a0a0a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Watercolor Flower Selector *</label>
                <span className="text-[10px] uppercase tracking-[0.2em] text-silk-white/40">
                  Leaf base auto-included
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {FLOWER_OPTIONS.map((flower) => {
                  const count = flowerCounts[flower];
                  return (
                    <button
                      key={flower}
                      type="button"
                      onClick={() => adjustFlowerCount(flower, 1)}
                      className="relative bg-[#0a0a0a]/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-rose-gold/40 hover:bg-white/5 transition-all"
                    >
                      <img
                        src={`/flowers/${flower}.webp`}
                        alt={`${formatFlowerLabel(flower)} watercolor`}
                        className="w-14 h-14 object-contain"
                      />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-silk-white/70">
                        {formatFlowerLabel(flower)}
                      </span>
                      {count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-rose-gold text-deep-velvet text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {totalFlowers > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {FLOWER_OPTIONS.filter((flower) => flowerCounts[flower] > 0).map((flower) => (
                    <div
                      key={flower}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-silk-white/70">
                        {formatFlowerLabel(flower)}
                      </span>
                      <span className="text-[10px] font-bold text-rose-gold">{flowerCounts[flower]}</span>
                      <button
                        type="button"
                        onClick={() => adjustFlowerCount(flower, -1)}
                        className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-rose-gold/80 hover:text-rose-gold"
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-silk-white/30 italic">
                  Select the watercolor flowers to build the bouquet.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[10px] uppercase tracking-[0.2em] text-silk-white/40">
                <span>
                  Selected: {totalFlowers} | Bouquets: {bouquetCount || 0} | Max 10 per bouquet
                </span>
                <button
                  type="button"
                  onClick={resetFlowerSelection}
                  className="px-3 py-1 border border-rose-gold/30 rounded-full text-rose-gold/70 hover:text-rose-gold hover:border-rose-gold transition-colors"
                >
                  Clear
                </button>
              </div>
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
                {flowerStatus.loading ? 'Arranging...' : 'Create Bouquet'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ----------- NOTEBOOK MANAGER ----------- */}
      {activeTab === 'notebook' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Left: Received Notes */}
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-3">
                <span className="text-rose-gold font-serif text-lg">✎</span>
              </div>
              <h2 className="text-xl font-serif text-silk-white">Notes from Senuri</h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {notebookStatus.loading && receivedNotes.length === 0 ? (
                <div className="p-8 text-center text-silk-white/20 italic font-serif">
                  Scanning the archives...
                </div>
              ) : receivedNotes.length === 0 ? (
                <div className="p-8 text-center text-silk-white/20 italic font-serif bg-white/5 border border-white/10 rounded-2xl">
                  "Silence is a canvas, waiting for her words..."
                </div>
              ) : (
                receivedNotes.map((note) => (
                  <div key={note.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl relative group hover:border-rose-gold/30 transition-colors">
                    <p className="text-silk-white/90 font-sans leading-relaxed mb-4">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-silk-white/30 font-bold">
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-4">
                        {note.kisses > 0 && (
                          <span className="text-rose-gold/60">
                            {note.kisses} 💋
                          </span>
                        )}
                        <button
                          onClick={() => handleKiss(note.id)}
                          className="px-4 py-1.5 bg-rose-gold/10 border border-rose-gold/30 text-rose-gold rounded-full hover:bg-rose-gold hover:text-deep-velvet transition-all font-bold text-[9px] uppercase tracking-tighter shadow-sm active:scale-95"
                        >
                          Send Kiss 💋
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Write Note */}
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-3">
                <span className="text-rose-gold font-serif text-lg">✍</span>
              </div>
              <h2 className="text-xl font-serif text-silk-white">Share a Thought</h2>
            </div>

            <form onSubmit={handleNoteSubmit} className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">Your Message</label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  className="w-full px-5 py-4 bg-[#0a0a0a]/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 focus:border-rose-gold transition-colors text-silk-white placeholder:text-silk-white/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="h-6">
                  {notebookStatus.message && (
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${notebookStatus.isError ? 'text-red-400' : 'text-rose-gold/60'}`}>
                      {notebookStatus.message}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={notebookStatus.loading || !newNoteContent.trim()}
                  className="px-8 py-4 bg-rose-gold text-deep-velvet rounded-xl font-bold tracking-[0.2em] uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Share Note
                </button>
              </div>
            </form>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-silk-white/20 mb-2">Target Recipient</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-gold/10 flex items-center justify-center text-rose-gold font-bold text-xs">S</div>
                <span className="text-sm text-silk-white/60 font-serif italic">Senuri Rukshani</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast.show && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="px-6 py-3 bg-rose-gold text-deep-velvet rounded-full font-bold uppercase tracking-widest text-[10px] shadow-[0_10px_30px_rgba(224,191,184,0.4)] border border-white/20">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}