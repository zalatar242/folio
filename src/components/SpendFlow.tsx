'use client';

import { useState, useEffect, useRef } from 'react';
import type { PriceData, SpendResult } from '@/app/page';
import type { Holding } from '@/lib/types';
import { calculateCollar, formatShares, formatUsd, formatDate } from '@/lib/collar';
import CollarGraph from '@/components/CollarGraph';

export type SpendMode = 'send' | 'card';

interface SpendFlowProps {
  mode: SpendMode;
  selectedHolding: Holding;
  holdings: Holding[];
  prices: Record<string, PriceData>;
  onBack: () => void;
  onComplete: (result: SpendResult) => void;
}

export default function SpendFlow({ mode, selectedHolding, holdings, prices, onBack, onComplete }: SpendFlowProps) {
  const [amount, setAmount] = useState('50');
  const [sending, setSending] = useState(false);
  const [expandHow, setExpandHow] = useState(false);
  const [currentHolding, setCurrentHolding] = useState<Holding>(selectedHolding);
  const [showPicker, setShowPicker] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [recipientAccountId, setRecipientAccountId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [searchResults, setSearchResults] = useState<{ email: string; name: string; hederaAccountId: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [durationMonths, setDurationMonths] = useState(1);

  const isValidAccountId = /^0\.0\.\d{1,10}$/.test(recipientInput.trim());
  const hasRecipient = mode === 'card' || !!recipientAccountId || isValidAccountId;
  const resolvedRecipientId = recipientAccountId || (isValidAccountId ? recipientInput.trim() : '');

  // Search users as they type
  useEffect(() => {
    if (mode !== 'send' || recipientAccountId) return; // Already selected
    clearTimeout(searchTimeout.current);
    if (recipientInput.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    // Don't search if it looks like a Hedera account ID
    if (/^0\.0\./.test(recipientInput)) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(recipientInput)}`);
        const data = await res.json();
        setSearchResults(data.users || []);
        setShowResults(data.users?.length > 0);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [recipientInput, mode, recipientAccountId]);

  const spendableHoldings = holdings.filter((h) => h.shares > 0);

  const { symbol, name: stockName, shares: totalShares, icon: stockIcon, gradient: stockGradient } = currentHolding;

  const priceLoaded = prices[symbol] !== undefined;
  const stockPrice = prices[symbol]?.price ?? 0;
  const val = parseFloat(amount) || 0;
  const maxSpend = totalShares * stockPrice;
  const collar = calculateCollar(val, stockPrice || 225, durationMonths);

  const handleSend = async () => {
    if (val <= 0 || val > maxSpend) return;
    setSending(true);

    try {
      const res = await fetch('/api/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          symbol,
          durationMonths,
          issueCard: mode === 'card',
          recipientAccountId: mode === 'send' ? resolvedRecipientId : undefined,
          userAccountId: 'demo-user',
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      onComplete({
        symbol,
        amount: val,
        shares: collar.shares,
        durationMonths,
        expiryDate: collar.expiryDate.toISOString(),
        noteId: data.note.id,
        txId: data.txId,
        card: data.card,
        recipientName: mode === 'send' ? (recipientName || resolvedRecipientId) : undefined,
        recipientAccountId: mode === 'send' ? resolvedRecipientId : undefined,
      });
    } catch {
      onComplete({
        symbol,
        amount: val,
        shares: collar.shares,
        durationMonths,
        expiryDate: collar.expiryDate.toISOString(),
        noteId: Date.now(),
        txId: 'demo-tx-' + Date.now(),
        recipientName: mode === 'send' ? (recipientName || resolvedRecipientId) : undefined,
        recipientAccountId: mode === 'send' ? resolvedRecipientId : undefined,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg cursor-pointer transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-semibold">{mode === 'send' ? 'Send Payment' : 'Load Card'}</div>
      </div>

      {/* Recipient (send mode only) */}
      {mode === 'send' && (
        <div className="relative">
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Send to
          </div>

          {recipientAccountId ? (
            /* Selected recipient */
            <div className="card flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-muted)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {(recipientName || recipientAccountId)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold truncate">{recipientName || recipientAccountId}</div>
                <div className="text-[11px] mt-0.5 font-mono truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {recipientAccountId}
                </div>
              </div>
              <button onClick={() => {
                setRecipientAccountId('');
                setRecipientName('');
                setRecipientInput('');
              }} className="p-2 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                style={{ color: 'var(--text-tertiary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            /* Search / manual entry */
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Name, email, or 0.0.12345"
                    className="w-full bg-transparent border-none outline-none text-[15px] font-semibold"
                    style={{ color: 'var(--text-primary)', caretColor: 'var(--accent)' }}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  />
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {isValidAccountId ? 'Valid Hedera account ID' : 'Search Folio users or enter account ID'}
                  </div>
                </div>
                {isValidAccountId && (
                  <button
                    onClick={() => {
                      setRecipientAccountId(recipientInput.trim());
                      setShowResults(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="card mt-1 overflow-hidden" style={{ position: 'absolute', left: 0, right: 0, zIndex: 10 }}>
              {searchResults.map((user) => (
                <button
                  key={user.email}
                  onMouseDown={() => {
                    setRecipientAccountId(user.hederaAccountId);
                    setRecipientName(user.name || user.email);
                    setRecipientInput('');
                    setShowResults(false);
                  }}
                  className="flex items-center gap-3 p-4 w-full text-left cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate">{user.name || user.email}</div>
                    <div className="text-[11px] font-mono truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {user.hederaAccountId}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Amount Input */}
      <div>
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-3xl font-light" style={{ color: 'var(--text-tertiary)' }}>$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="text-5xl font-bold text-center bg-transparent border-none outline-none w-48"
            style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', caretColor: 'var(--accent)' }}
            inputMode="decimal"
          />
        </div>
        <div className="text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Available: up to <strong style={{ color: 'var(--text-secondary)' }}>
            ${maxSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </strong> from {stockName}
        </div>
      </div>

      {/* Paying From — tappable asset picker */}
      <div className="relative">
        <button
          onClick={() => spendableHoldings.length > 1 && setShowPicker(!showPicker)}
          className="card flex items-center gap-4 p-4 w-full text-left cursor-pointer transition-colors"
          style={{ border: showPicker ? '1px solid var(--accent)' : undefined }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: stockGradient }}>{stockIcon}</div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{stockName}</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Paying from</div>
          </div>
          <div className="text-[15px] font-semibold" style={{ fontVariantNumeric: 'tabular-nums', color: priceLoaded ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            {priceLoaded ? `$${stockPrice.toFixed(2)}` : '···'}
          </div>
          {spendableHoldings.length > 1 && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"
              style={{ transform: showPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
        </button>

        {showPicker && (
          <div className="card mt-1 overflow-hidden" style={{ position: 'absolute', left: 0, right: 0, zIndex: 10 }}>
            {spendableHoldings
              .filter((h) => h.symbol !== currentHolding.symbol)
              .map((h) => {
                const hp = prices[h.symbol];
                return (
                  <button
                    key={h.symbol}
                    onClick={() => { setCurrentHolding(h); setShowPicker(false); }}
                    className="flex items-center gap-4 p-4 w-full text-left cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: h.gradient }}>{h.icon}</div>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold">{h.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {h.shares} shares
                      </div>
                    </div>
                    <div className="text-[15px] font-semibold" style={{ fontVariantNumeric: 'tabular-nums', color: hp ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {hp ? `$${hp.price.toFixed(2)}` : '···'}
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Advance Details */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>0% interest loan from your portfolio</div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: mode === 'send' ? 'They get' : 'Amount', value: formatUsd(val), color: 'var(--accent)' },
            { label: 'Interest', value: '0%', color: 'var(--accent)' },
            { label: 'Fees', value: '$0', color: 'var(--accent)' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-[10px] mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </div>
              <div className="text-[18px] font-bold" style={{ color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Duration Picker */}
        <div>
          <div className="text-[11px] mb-3 uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Repay within
          </div>
          <div className="flex gap-2.5">
            {[1, 2, 3].map((m) => {
              const active = durationMonths === m;
              return (
                <button
                  key={m}
                  onClick={() => setDurationMonths(m)}
                  className="flex-1 py-3.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: active ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow: active ? '0 0 12px rgba(16,185,129,0.15)' : 'none',
                  }}
                >
                  {m} month{m > 1 ? 's' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collateral */}
        <div className="flex justify-between py-4 text-[13px]" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Collateral</span>
          <span className="font-medium" style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatShares(collar.shares)} {symbol} ({formatUsd(collar.collateralValue)})
          </span>
        </div>

        {/* Repayment Note */}
        <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Repay <strong style={{ color: 'var(--text-secondary)' }}>by {formatDate(collar.expiryDate)}</strong> to
          unlock your shares. If not repaid, shares are sold to settle.
        </div>

        {/* How does this work? */}
        <div>
          <button
            onClick={() => setExpandHow(!expandHow)}
            className="flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ transform: expandHow ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            How does this work?
          </button>
          {expandHow && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <CollarGraph price={stockPrice || 225} floor={collar.floor} cap={collar.cap} stockName={stockName} />
              <div className="text-[13px] mt-4 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                This is a 0% interest loan backed by your {stockName} shares. We hold a small portion as collateral
                and protect it with a zero-cost options collar (the green zone above). You get a virtual card
                instantly. Repay anytime before the due date and your shares are released. If you don&apos;t repay,
                the shares are sold to cover the balance.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSend}
        disabled={!priceLoaded || val <= 0 || val > maxSpend || sending || !hasRecipient}
        className="btn-primary w-full py-4 text-[15px]"
      >
        {sending
          ? (mode === 'send' ? 'Sending...' : 'Issuing card...')
          : (mode === 'send' ? `Send ${formatUsd(val)}` : `Get Card · ${formatUsd(val)} at 0%`)}
      </button>
    </div>
  );
}
