import { NextResponse } from 'next/server';
import { holdingGradient } from '@/lib/types';

// Map env-configured token IDs back to stock symbols
function getTokenSymbolMap(): Record<string, { symbol: string; name: string }> {
  const map: Record<string, { symbol: string; name: string }> = {};

  if (process.env.MOCK_TSLA_TOKEN_ID) {
    map[process.env.MOCK_TSLA_TOKEN_ID] = { symbol: 'TSLA', name: 'Tesla' };
  }
  if (process.env.MOCK_AAPL_TOKEN_ID) {
    map[process.env.MOCK_AAPL_TOKEN_ID] = { symbol: 'AAPL', name: 'Apple' };
  }

  return map;
}

const hederaConfigured = !!(
  process.env.HEDERA_OPERATOR_ID &&
  process.env.HEDERA_OPERATOR_KEY
);

export async function GET() {
  if (!hederaConfigured) {
    return NextResponse.json({ holdings: [], source: 'not_configured' });
  }

  try {
    const { getTokenBalances, getOperatorId } = await import('@/lib/hedera');
    const operatorId = getOperatorId().toString();
    const balances = await getTokenBalances(operatorId);
    const tokenMap = getTokenSymbolMap();

    const holdings = Array.from(balances.entries())
      .filter(([tokenId]) => tokenId in tokenMap)
      .map(([tokenId, rawBalance]) => {
        const { symbol, name } = tokenMap[tokenId];
        // Token balances are in smallest unit (6 decimals)
        const shares = Math.floor(rawBalance / 1e6);
        return {
          symbol,
          name,
          shares,
          icon: symbol[0],
          gradient: holdingGradient(symbol),
        };
      })
      .filter((h) => h.shares > 0);

    return NextResponse.json({ holdings, source: 'hedera' });
  } catch (error) {
    console.error('Hedera holdings error:', error);
    return NextResponse.json({ holdings: [], source: 'error' });
  }
}
