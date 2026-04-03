'use client';

import type { SpendResult } from '@/app/page';
import { formatUsd, formatShares, formatDate } from '@/lib/collar';

interface ConfirmationProps {
  result: SpendResult;
  onViewDetails: () => void;
  onDone: () => void;
}

export default function Confirmation({ result, onViewDetails, onDone }: ConfirmationProps) {
  const expiryDate = new Date(result.expiryDate);

  return (
    <div className="text-center pt-8">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--accent-muted)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <div className="text-2xl font-bold mb-1">Sent!</div>
      <div className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {formatUsd(result.amount)} sent to {result.recipientName}
      </div>

      {/* Loan Summary Card */}
      <div className="p-4 rounded-xl text-left mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Loan Summary
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Amount</span>
            <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatUsd(result.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Collateral</span>
            <span className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatShares(result.shares)} TSLA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Interest</span>
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>0%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-tertiary)' }}>Repay by</span>
            <span className="font-semibold">{formatDate(expiryDate)}</span>
          </div>
        </div>

        <div className="text-[11px] mt-3 pt-3 leading-relaxed" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
          Repay {formatUsd(result.amount)} before {formatDate(expiryDate)} to unlock your shares.
          If not repaid, collateral shares will be sold to settle.
        </div>
      </div>

      {/* Transaction ID */}
      <div className="text-[11px] mb-6 font-mono" style={{ color: 'var(--text-tertiary)' }}>
        TX: {result.txId}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onViewDetails}
          className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          View Spend Note
        </button>
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          Back to Portfolio
        </button>
      </div>
    </div>
  );
}
