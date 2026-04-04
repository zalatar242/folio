import { NextRequest, NextResponse } from 'next/server';
import { getTokenRegistry } from '@/lib/token-registry';
import { SYMBOL_GRADIENTS, DEFAULT_GRADIENT } from '@/lib/types';

const hederaConfigured = !!(
  process.env.HEDERA_OPERATOR_ID &&
  process.env.HEDERA_OPERATOR_KEY
);

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json({ error: 'accountId required' }, { status: 400 });
  }

  if (!hederaConfigured) {
    return NextResponse.json({ holdings: [] });
  }

  try {
    const { getTokenBalances } = await import('@/lib/hedera');
    const balances = await getTokenBalances(accountId);
    const registry = getTokenRegistry();

    const tokenMap = new Map(registry.map((t) => [t.tokenId, t]));

    const holdings = Array.from(balances.entries())
      .filter(([tokenId]) => tokenMap.has(tokenId))
      .map(([tokenId, rawBalance]) => {
        const entry = tokenMap.get(tokenId)!;
        const shares = rawBalance / 10 ** entry.decimals;
        const isCrypto = entry.type === 'crypto';
        return {
          symbol: entry.symbol,
          name: entry.name,
          shares: isCrypto ? shares : Math.floor(shares), // USDC keeps decimals, stocks round
          icon: entry.symbol === 'USDC' ? '$' : entry.symbol[0],
          gradient: SYMBOL_GRADIENTS[entry.symbol] || (isCrypto ? 'linear-gradient(135deg, #2775CA, #1A5FB4)' : DEFAULT_GRADIENT),
          type: entry.type,
        };
      })
      .filter((h) => h.shares > 0);

    return NextResponse.json({ holdings });
  } catch (error) {
    console.error('User balances error:', error);
    return NextResponse.json({ holdings: [] });
  }
}
