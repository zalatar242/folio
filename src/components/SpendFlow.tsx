'use client';

import { useState } from 'react';
import type { PriceData, SpendResult } from '@/app/page';
import { calculateCollar, formatShares, formatUsd, formatDate } from '@/lib/collar';
import CollarGraph from '@/components/CollarGraph';

interface SpendFlowProps {
  prices: Record<string, PriceData>;
  onBack: () => void;
  onComplete: (result: SpendResult) => void;
}

export default function SpendFlow({ prices, onBack, onComplete }: SpendFlowProps) {
  const [amount, setAmount] = useState('50');
  const [durationMonths, setDurationMonths] = useState(1);
  const [recipientSelected, setRecipientSelected] = useState(true);
  const [sending, setSending] = useState(false);
  const [expandHow, setExpandHow] = useState(false);

  const tslaPrice = prices.TSLA?.price ?? 225;
  const val = parseFloat(amount) || 0;
  const maxSpend = 44 * tslaPrice;
  const collar = calculateCollar(val, tslaPrice, durationMonths);

  const handleSend = async () => {
    if (val <= 0 || val > maxSpend) return;
    setSending(true);

    try {
      const res = await fetch('/api/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          durationMonths,
          recipientName: 'Alex Chen',
          userAccountId: 'demo-user', // In production: Dynamic wallet
        }),
      });

      const data = await res.json();

      if (data.success) {
        onComplete({
          amount: val,
          shares: collar.shares,
          recipientName: 'Alex Chen',
          durationMonths,
          expiryDate: collar.expiryDate.toISOString(),
          noteId: data.note.id,
          txId: data.txId,
        });
      }
    } catch {
      // For demo: complete anyway with mock data
      onComplete({
        amount: val,
        shares: collar.shares,
        recipientName: 'Alex Chen',
        durationMonths,
        expiryDate: collar.expiryDate.toISOString(),
        noteId: Date.now(),
        txId: 'demo-tx-' + Date.now(),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-1 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-semibold">Send Payment</div>
      </div>

      {/* Recipient */}
      {!recipientSelected ? (
        <div className="text-center py-5 mb-4">
          <button
            onClick={() => setRecipientSelected(true)}
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer"
            style={{ background: 'var(--bg-elevated)', border: '2px dashed var(--border)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="12" y1="7" x2="12" y2="17" />
            </svg>
          </button>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scan QR or tap to choose recipient</div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>A</div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold">Alex Chen</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>@alexchen</div>
          </div>
          <button onClick={() => setRecipientSelected(false)} className="p-1 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Amount Input */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <span className="text-3xl font-light" style={{ color: 'var(--text-tertiary)' }}>$</span>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          className="text-5xl font-bold text-center bg-transparent border-none outline-none w-48"
          style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}
          inputMode="decimal"
        />
      </div>
      <div className="text-center text-xs mb-5" style={{ color: 'var(--text-tertiary)' }}>
        Available: up to <strong style={{ color: 'var(--text-secondary)' }}>
          ${maxSpend.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </strong> from Tesla
      </div>

      {/* Paying From */}
      <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>T</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Tesla</div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Paying from</div>
        </div>
        <div className="text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ${tslaPrice.toFixed(2)}
        </div>
      </div>

      {/* Loan Disclosure (Klarna-style) */}
      <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Pay later with your portfolio</div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>They get</div>
            <div className="text-base font-bold" style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              {formatUsd(val)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Interest</div>
            <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>0%</div>
          </div>
          <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Fees</div>
            <div className="text-base font-bold" style={{ color: 'var(--accent)' }}>$0</div>
          </div>
        </div>

        {/* Duration Picker */}
        <div className="mb-3">
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Repay within</div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMonths(m)}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer"
                style={{
                  background: durationMonths === m ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  border: `1px solid ${durationMonths === m ? 'var(--accent)' : 'var(--border)'}`,
                  color: durationMonths === m ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: durationMonths === m ? 600 : 500,
                }}
              >
                {m} month{m > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Collateral */}
        <div className="flex justify-between py-2 text-xs" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Collateral</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {formatShares(collar.shares)} TSLA ({formatUsd(collar.collateralValue)})
          </span>
        </div>

        {/* Expiry Note */}
        <div className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Repay <strong style={{ color: 'var(--text-secondary)' }}>by {formatDate(collar.expiryDate)}</strong> to
          unlock shares. If not repaid, shares are sold to settle.
        </div>

        {/* How does this work? */}
        <button
          onClick={() => setExpandHow(!expandHow)}
          className="flex items-center gap-2 mt-3 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4.5V9.5M4.5 7H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          How does this work?
        </button>
        {expandHow && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <CollarGraph price={tslaPrice} floor={collar.floor} cap={collar.cap} />
            <div className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              This is a 0% interest loan backed by your Tesla shares. We hold a small portion as collateral
              and protect it with a zero-cost options collar (the green zone above). The recipient gets paid
              instantly. Repay anytime before the due date and your shares are released. If you don&apos;t repay,
              the shares are sold to cover the balance.
            </div>
          </div>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={val <= 0 || val > maxSpend || sending || !recipientSelected}
        className="w-full py-4 rounded-xl text-base font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--accent)', color: '#000' }}
      >
        {sending ? 'Sending...' : `Send ${formatUsd(val)}`}
      </button>
    </div>
  );
}
