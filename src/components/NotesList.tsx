'use client';

import { useState, useEffect } from 'react';
import { formatUsd, formatDate } from '@/lib/collar';

interface SpendNote {
  id: number;
  amount: number;
  shares: number;
  recipientName: string;
  status: 'active' | 'repaid' | 'expired';
  expiryDate: string;
  createdAt: string;
}

interface NotesListProps {
  onSelectNote: (noteId: number) => void;
}

export default function NotesList({ onSelectNote }: NotesListProps) {
  const [notes, setNotes] = useState<SpendNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        setNotes(data.notes ?? []);
      } catch {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'var(--accent-muted)', color: 'var(--accent)' };
      case 'repaid': return { bg: 'rgba(99,102,241,0.1)', color: '#6366F1' };
      case 'expired': return { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' };
      default: return { bg: 'var(--bg-elevated)', color: 'var(--text-tertiary)' };
    }
  };

  return (
    <div>
      <div className="text-lg font-semibold mb-4">Spend Notes</div>

      {loading ? (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Loading...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'var(--bg-elevated)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8" />
            </svg>
          </div>
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No spend notes yet</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Send a payment to create your first spend note
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => {
            const expiry = new Date(note.expiryDate);
            const style = statusStyle(note.status);

            return (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer w-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                  {note.recipientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{note.recipientName}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Due {formatDate(expiry)}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatUsd(note.amount)}
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: style.bg, color: style.color }}>
                    {note.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
