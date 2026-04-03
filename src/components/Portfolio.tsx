'use client';

import type { PriceData } from '@/app/page';

interface PortfolioProps {
  prices: Record<string, PriceData>;
  onSpend: () => void;
  onViewNotes: () => void;
}

// Mock portfolio — 44 TSLA shares, 0 AAPL
const HOLDINGS = [
  { symbol: 'TSLA', name: 'Tesla', shares: 44, icon: 'T' },
  { symbol: 'AAPL', name: 'Apple', shares: 0, icon: 'A' },
];

export default function Portfolio({ prices, onSpend, onViewNotes }: PortfolioProps) {
  const totalValue = HOLDINGS.reduce((sum, h) => {
    const price = prices[h.symbol]?.price ?? 0;
    return sum + h.shares * price;
  }, 0);

  const totalChange = HOLDINGS.reduce((sum, h) => {
    const change = prices[h.symbol]?.change ?? 0;
    return sum + h.shares * change;
  }, 0);

  const isPositive = totalChange >= 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Portfolio</div>
        <div className="text-4xl font-bold tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm font-medium mt-1" style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}>
          {isPositive ? '+' : ''}{totalChange.toFixed(2)} today
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={onSpend}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          Send Payment
        </button>
        <button
          onClick={onViewNotes}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          Spend Notes
        </button>
      </div>

      {/* Holdings */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Holdings
        </div>
        <div className="flex flex-col gap-2">
          {HOLDINGS.map((h) => {
            const price = prices[h.symbol]?.price ?? 0;
            const change = prices[h.symbol]?.changePercent ?? 0;
            const value = h.shares * price;
            const isUp = change >= 0;

            return (
              <div
                key={h.symbol}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                  {h.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{h.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {h.shares} shares
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-medium" style={{ color: isUp ? 'var(--positive)' : 'var(--negative)' }}>
                    {isUp ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collateral Status */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Available to Spend
        </div>
        <div className="text-2xl font-bold" style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
          ${(HOLDINGS[0].shares * (prices.TSLA?.price ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          From {HOLDINGS[0].shares} shares of Tesla at 0% interest
        </div>
      </div>
    </div>
  );
}
