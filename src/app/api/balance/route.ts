import { NextRequest, NextResponse } from 'next/server';
import { getTokenBalances } from '@/lib/hedera';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId required' },
      { status: 400 }
    );
  }

  try {
    const balances = await getTokenBalances(accountId);
    const result: Record<string, number> = {};
    balances.forEach((value, key) => {
      result[key] = value;
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Balance query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    );
  }
}
