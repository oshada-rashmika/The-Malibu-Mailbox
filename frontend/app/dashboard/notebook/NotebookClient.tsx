'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../../utils/api';
import HeartbeatNotebook from '../../../components/HeartbeatNotebook';
import { motion } from 'framer-motion';

interface NotebookEntry {
  id: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  kisses: number;
}

export default function NotebookClient({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notebook?user_id=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch notebook');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err: any) {
      console.error('[Notebook] Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKiss = async (noteId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notebook/${noteId}/kiss`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        // Refresh entries to show new kiss
        setEntries(prev => prev.map(e => e.id === noteId ? { ...e, kisses: (e.kisses || 0) + 1 } : e));
      }
    } catch (err) {
      console.error('[Notebook] Kiss error:', err);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center min-h-[80vh]">
      <header className="w-full mb-12 pt-6 px-4">
        <div className="relative flex flex-col items-center">
          <Link
            href="/dashboard"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-deep-velvet/40 hover:text-deep-velvet transition-colors hidden md:block"
          >
            ← Sanctuary
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-2">
            Our Shared Whispers
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
          <p className="text-deep-velvet/60 italic font-serif text-lg mt-4 text-center">
            A digital archive of our heartbeats
          </p>
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center py-10">
        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-gold/20 border-t-rose-gold rounded-full animate-spin" />
            <p className="text-deep-velvet/40 font-serif italic">Opening our heartbeats...</p>
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl max-w-md"
          >
            <p className="text-2xl font-serif text-deep-velvet/80 italic mb-6">
              "Every story has a beginning... ours is waiting for its first word."
            </p>
            <p className="text-sm text-deep-velvet/40 uppercase tracking-[0.2em] font-bold">
              Check the admin panel to share a note
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <HeartbeatNotebook 
              entries={entries} 
              onKiss={handleKiss} 
              currentUserId={userId}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
