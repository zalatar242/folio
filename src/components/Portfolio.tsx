'use client';

import type { PriceData } from '@/app/page';

interface PortfolioProps {
  prices: Record<string, PriceData>;
  onSpend: () => void;
  onViewNotes: () => void;
}

const HOLDINGS = [
  { symbol: 'TSLA', name: 'Tesla', shares: 44, icon: 'T', gradient: 'linear-gradient(135deg, #E31937, #B91C3A)' },
  { symbol: 'AAPL', name: 'Apple', shares: 0, icon: 'A', gradient: 'linear-gradient(135deg, #555, #333)' },
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
      <div className="mb-8">
        <div className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Total Portfolio
        </div>
        <div className="text-[42px] font-bold tracking-tight leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-sm font-semibold px-2 py-0.5 rounded-md"
            style={{
              color: isPositive ? 'var(--positive)' : 'var(--negative)',
              background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            }}>
            {isPositive ? '+' : ''}{totalChange.toFixed(2)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>today</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <button onClick={onSpend} className="btn-primary flex-1 py-3.5 text-sm">
          Send Payment
        </button>
        <button onClick={onViewNotes} className="btn-secondary flex-1 py-3.5 text-sm">
          Spend Notes
        </button>
      </div>

      {/* Holdings */}
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Holdings
        </div>
        <div className="flex flex-col gap-2.5">
          {HOLDINGS.map((h) => {
            const price = prices[h.symbol]?.price ?? 0;
            const change = prices[h.symbol]?.changePercent ?? 0;
            const value = h.shares * price;
            const isUp = change >= 0;

            return (
              <div key={h.symbol} className="card flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: h.gradient }}>
                  {h.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{h.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {h.shares} share{h.shares !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
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

      {/* Available to Spend */}
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
          style={{ background: 'var(--accent)', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Available to Spend
        </div>
        <div className="text-[28px] font-bold" style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
          ${(HOLDINGS[0].shares * (prices.TSLA?.price ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
          From {HOLDINGS[0].shares} shares of Tesla at 0% interest
        </div>
      </div>
    </div>
  );
}
