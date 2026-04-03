import { NextRequest, NextResponse } from 'next/server';
import { calculateCollar } from '@/lib/collar';
import { getStockPrice } from '@/lib/price';
import { transferToken, mintSpendNote, transferNft, getOperatorId } from '@/lib/hedera';
import { addNote } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      durationMonths = 1,
      recipientName = 'Someone',
      userAccountId,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!userAccountId) {
      return NextResponse.json(
        { error: 'User account required' },
        { status: 400 }
      );
    }

    // Get live price
    const priceData = await getStockPrice('TSLA');
    const collar = calculateCollar(amount, priceData.price, durationMonths);

    const operatorId = getOperatorId().toString();
    const tslaTokenId = process.env.MOCK_TSLA_TOKEN_ID!;
    const usdcTokenId = process.env.USDC_TEST_TOKEN_ID!;
    const noteTokenId = process.env.SPEND_NOTE_TOKEN_ID!;

    // Step 1: Lock user's TSLA shares into agent escrow
    const lockTxId = await transferToken(
      tslaTokenId,
      userAccountId,
      operatorId,
      collar.sharesHts
    );

    // Step 2: Send USDC from agent to user (the advance)
    await transferToken(
      usdcTokenId,
      operatorId,
      userAccountId,
      collar.advanceHts
    );

    // Step 3: Mint Spend Note NFT
    const metadata = JSON.stringify({
      name: `Spend Note #${Date.now()}`,
      asset: 'MOCK-TSLA',
      shares_collared: collar.sharesHts,
      stock_price: Math.floor(priceData.price * 1e6),
      collar_floor: Math.floor(collar.floor * 1e6),
      collar_cap: Math.floor(collar.cap * 1e6),
      advance_usdc: collar.advanceHts,
      fee: 0,
      duration_months: durationMonths,
      expires_at: collar.expiryDate.toISOString(),
      status: 'active',
    });

    const serial = await mintSpendNote(
      new TextEncoder().encode(metadata)
    );

    // Step 4: Transfer Spend Note NFT to user
    await transferNft(noteTokenId, serial, operatorId, userAccountId);

    // Step 5: Store in memory
    const note = addNote({
      serial,
      recipient: 'recipient-placeholder',
      recipientName,
      amount: collar.advance,
      shares: collar.shares,
      sharesHts: collar.sharesHts,
      stockPrice: priceData.price,
      floor: collar.floor,
      cap: collar.cap,
      durationMonths,
      expiryDate: collar.expiryDate.toISOString(),
      status: 'active',
      txId: lockTxId,
      createdAt: new Date().toISOString(),
      userAccountId,
    });

    return NextResponse.json({
      success: true,
      note,
      collar: {
        shares: collar.shares,
        floor: collar.floor,
        cap: collar.cap,
        advance: collar.advance,
        fee: collar.fee,
        expiryDate: collar.expiryDate.toISOString(),
      },
      txId: lockTxId,
    });
  } catch (error) {
    console.error('Spend error:', error);
    return NextResponse.json(
      {
        error: 'Spend transaction failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
