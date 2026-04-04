'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import type { Holding } from './types';
import { DEMO_HOLDINGS, holdingGradient } from './types';

export type PlaidStatus = 'idle' | 'loading' | 'connected' | 'error';

interface PlaidHookResult {
  status: PlaidStatus;
  holdings: Holding[];
  openLink: () => void;
  isPlaidAvailable: boolean;
  isDemo: boolean;
}

export function usePlaidHoldings(): PlaidHookResult {
  const [status, setStatus] = useState<PlaidStatus>('loading');
  const [holdings, setHoldings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidAvailable, setIsPlaidAvailable] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  // Load tokenized holdings from Hedera (always runs — these are the native HTS equities)
  const fetchHederaHoldings = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/hedera/holdings');
      if (!res.ok) return false;
      const data = await res.json();
      if (data.holdings?.length > 0) {
        setHoldings(data.holdings);
        return true;
      }
    } catch { /* fall through */ }
    return false;
  }, []);

  // Initialize: load HTS tokenized equities, then set up Plaid for brokerage linking
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Always load Hedera tokenized holdings first
      const hasHedera = await fetchHederaHoldings();
      if (!hasHedera && !cancelled) {
        setHoldings(DEMO_HOLDINGS);
      }

      // Then check Plaid availability
      try {
        const res = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'demo-user' }),
        });

        if (!res.ok) {
          if (!cancelled) {
            setIsPlaidAvailable(false);
            setStatus('idle');
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setLinkToken(data.link_token);
          setIsPlaidAvailable(true);
          setStatus('idle');
        }
      } catch {
        if (!cancelled) {
          setIsPlaidAvailable(false);
          setStatus('idle');
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [fetchHederaHoldings]);

  // Fetch holdings after connection
  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch('/api/plaid/holdings?userId=demo-user');
      if (!res.ok) throw new Error('Failed to fetch holdings');
      const data = await res.json();

      const mapped: Holding[] = data.holdings.map((h: { symbol: string; name: string; shares: number }) => ({
        symbol: h.symbol,
        name: h.name,
        shares: h.shares,
        icon: h.symbol[0],
        gradient: holdingGradient(h.symbol),
      }));

      if (mapped.length > 0) {
        setHoldings(mapped);
        setIsDemo(false);
      } else {
        setHoldings(DEMO_HOLDINGS);
        setIsDemo(true);
      }
      setStatus('connected');
    } catch {
      setStatus('error');
    }
  }, []);

  // Handle Plaid Link success
  const onSuccess = useCallback(async (publicToken: string) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken, userId: 'demo-user' }),
      });

      if (!res.ok) throw new Error('Token exchange failed');

      await fetchHoldings();
    } catch {
      setStatus('error');
      setHoldings(DEMO_HOLDINGS);
    }
  }, [fetchHoldings]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const openLink = useCallback(() => {
    if (ready) open();
  }, [ready, open]);

  return { status, holdings, openLink, isPlaidAvailable, isDemo };
}
