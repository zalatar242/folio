'use client';

import { useState, useEffect } from 'react';
import { formatUsd, formatShares, formatDate } from '@/lib/collar';

interface SpendNote {
  id: number;
  amount: number;
  shares: number;
  floor: number;
  cap: number;
  recipientName: string;
  status: 'active' | 'repaid' | 'expired';
  durationMonths: number;
  expiryDate: string;
  createdAt: string;
  txId: string;
}

interface NoteDetailProps {
  noteId: number;
  onBack: () => void;
}

export default function NoteDetail({ noteId, onBack }: NoteDetailProps) {
  const [note, setNote] = useState<SpendNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        const found = (data.notes ?? []).find((n: SpendNote) => n.id === noteId);
        setNote(found ?? null);
      } catch {
        setNote(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  const handleRepay = async () => {
    if (!note) return;
    setRepaying(true);
    try {
      await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, status: 'repaid' }),
      });
      setNote({ ...note, status: 'repaid' });
    } catch {
      // Demo: mark repaid locally
      setNote({ ...note, status: 'repaid' });
    } finally {
      setRepaying(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Loading...
      </div>
    );
  }

  if (!note) {
    return (
      <div>
        <button onClick={onBack} className="p-1 mb-4 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center py-12 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Note not found
        </div>
      </div>
    );
  }

  const expiry = new Date(note.expiryDate);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isUrgent = daysLeft <= 7 && note.status === 'active';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-semibold">Spend Note #{note.id}</div>
      </div>

      {/* Recipient */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          {note.recipientName.charAt(0)}
        </div>
        <div>
          <div className="text-base font-semibold">{note.recipientName}</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="text-3xl font-bold mb-6" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatUsd(note.amount)}
      </div>

      {/* Urgency Banner */}
      {isUrgent && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-xs font-medium" style={{ color: '#F59E0B' }}>
            {daysLeft === 0 ? 'Expires today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} until expiry`}
          </span>
        </div>
      )}

      {/* Loan Details */}
      <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Loan Details
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Status</span>
            <span className="font-semibold" style={{
              color: note.status === 'active' ? 'var(--accent)' : note.status === 'repaid' ? '#6366F1' : '#EF4444'
            }}>
              {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Collateral</span>
            <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatShares(note.shares)} TSLA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Interest</span>
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>0%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Protection</span>
            <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatUsd(note.floor)} floor / {formatUsd(note.cap)} cap
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Duration</span>
            <span className="font-semibold">{note.durationMonths} month{note.durationMonths > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Repay by</span>
            <span className="font-semibold">{formatDate(expiry)}</span>
          </div>
        </div>

        <div className="text-[11px] mt-3 pt-3 leading-relaxed" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
          {note.status === 'repaid'
            ? 'Loan repaid. Your shares have been unlocked and returned.'
            : note.status === 'expired'
            ? 'Loan expired. Collateral shares were sold to settle the balance.'
            : `Repay ${formatUsd(note.amount)} before ${formatDate(expiry)} to unlock your shares.`}
        </div>
      </div>

      {/* TX ID */}
      <div className="text-[11px] mb-6 font-mono px-1" style={{ color: 'var(--text-tertiary)' }}>
        TX: {note.txId}
      </div>

      {/* Repay Button */}
      {note.status === 'active' && (
        <button
          onClick={handleRepay}
          disabled={repaying}
          className="w-full py-4 rounded-xl text-base font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          {repaying ? 'Processing...' : `Repay ${formatUsd(note.amount)} & Unlock Shares`}
        </button>
      )}
    </div>
  );
}
