'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { getAuthToken, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { authFetch } from '@/lib/use-auth-fetch';
import type { Holding } from './types';
import { DEMO_HOLDINGS } from './types';

export type PlaidStatus = 'idle' | 'loading' | 'connected' | 'error';

/** Merge two holdings lists by summing shares per symbol */
function mergeHoldings(
  base: { symbol: string; shares: number }[],
  additions: { symbol: string; shares: number }[],
): { symbol: string; shares: number }[] {
  const map = new Map<string, number>();
  for (const h of base) map.set(h.symbol, (map.get(h.symbol) ?? 0) + h.shares);
  for (const h of additions) map.set(h.symbol, (map.get(h.symbol) ?? 0) + h.shares);
  return Array.from(map.entries()).map(([symbol, shares]) => ({ symbol, shares }));
}

interface PlaidHookResult {
  status: PlaidStatus;
  holdings: Holding[];
  openLink: () => void;
  isPlaidAvailable: boolean;
  isDemo: boolean;
}

export function usePlaidHoldings(userAccountId?: string): PlaidHookResult {
  const { user } = useDynamicContext();
  const [status, setStatus] = useState<PlaidStatus>('loading');
  const [holdings, setHoldings] = useState<Holding[]>(DEMO_HOLDINGS);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidAvailable, setIsPlaidAvailable] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  // Load tokenized holdings from Hedera (user's on-chain balances)
  // Returns the fetched holdings so callers can use them without stale closures
  const fetchHederaHoldings = useCallback(async (): Promise<Holding[] | null> => {
    if (!userAccountId) return null;
    try {
      const res = await authFetch(`/api/hedera/holdings?accountId=${encodeURIComponent(userAccountId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.holdings?.length > 0) {
        setHoldings(data.holdings);
        return data.holdings;
      }
    } catch { /* fall through */ }
    return null;
  }, [userAccountId]);

  // Sync holdings to on-chain HTS tokens, then refresh from chain
  const syncHoldingsToChain = useCallback(async (accountId: string, holdingsToSync: { symbol: string; shares: number }[]): Promise<Holding[] | null> => {
    try {
      await authFetch('/api/holdings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          holdings: holdingsToSync.map((h) => ({ symbol: h.symbol, shares: h.shares })),
        }),
      });
      // Re-fetch HTS holdings so UI matches on-chain state
      return await fetchHederaHoldings();
    } catch { return null; }
  }, [fetchHederaHoldings]);

  // Initialize: load HTS tokenized equities, then set up Plaid for brokerage linking
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Skip API calls if not authenticated yet (avoids 401 console errors)
      if (!getAuthToken()) {
        setStatus('idle');
        return;
      }

      // Load user's on-chain HTS stock holdings (minted at registration)
      let htsHoldings = await fetchHederaHoldings();
      if (!htsHoldings && !cancelled) {
        setHoldings(DEMO_HOLDINGS);
        // Ensure demo tokens exist on-chain (may have been skipped during registration)
        if (userAccountId) {
          htsHoldings = await syncHoldingsToChain(userAccountId, DEMO_HOLDINGS);
        }
      }

      // If user has a connected brokerage, merge with on-chain totals and sync
      // so Hedera remains the single source of truth
      try {
        const brokerageRes = await authFetch('/api/plaid/holdings');
        if (brokerageRes.ok && !cancelled) {
          const brokerageData = await brokerageRes.json();
          if (brokerageData.holdings?.length > 0 && userAccountId) {
            const currentOnChain = htsHoldings ?? DEMO_HOLDINGS;
            const merged = mergeHoldings(currentOnChain, brokerageData.holdings);
            await syncHoldingsToChain(userAccountId, merged);
            setIsDemo(false);
          }
        }
      } catch { /* no previously connected account — that's fine */ }

      // Then check Plaid availability for new connections
      try {
        const res = await authFetch('/api/plaid/create-link-token', {
          method: 'POST',
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
  }, [fetchHederaHoldings, syncHoldingsToChain, userAccountId, user]);

  // Fetch brokerage holdings, merge with current on-chain, sync to chain, read back
  const fetchHoldings = useCallback(async () => {
    try {
      const res = await authFetch('/api/plaid/holdings');
      if (!res.ok) throw new Error('Failed to fetch holdings');
      const data = await res.json();

      const brokerageHoldings: { symbol: string; name: string; shares: number }[] = data.holdings;

      if (brokerageHoldings.length > 0 && userAccountId) {
        // Get fresh on-chain state before merging
        const currentOnChain = await fetchHederaHoldings() ?? DEMO_HOLDINGS;
        const merged = mergeHoldings(currentOnChain, brokerageHoldings);
        await syncHoldingsToChain(userAccountId, merged);
        setIsDemo(false);
      }
      setStatus('connected');
    } catch {
      setStatus('error');
    }
  }, [userAccountId, fetchHederaHoldings, syncHoldingsToChain]);

  // Handle Plaid Link success
  const onSuccess = useCallback(async (publicToken: string) => {
    setStatus('loading');
    try {
      const res = await authFetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
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
