import { NextRequest, NextResponse } from 'next/server';
import { getUser, registerUser } from '@/lib/user-registry';
import { getTokenIdForSymbol } from '@/lib/token-registry';

const hederaConfigured = !!(
  process.env.HEDERA_OPERATOR_ID &&
  process.env.HEDERA_OPERATOR_KEY
);

export async function POST(req: NextRequest) {
  try {
    const { email, name, publicKey } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await getUser(email);
    if (existing) {
      return NextResponse.json({ user: existing });
    }

    let hederaAccountId = `0.0.${Date.now()}`; // Demo fallback
    let tokenAssocTxBytes: string | undefined;

    if (hederaConfigured && publicKey) {
      // Non-custodial: create account with user's public key
      const { createAccountWithPublicKey, prepareTokenAssociation } = await import('@/lib/hedera');
      hederaAccountId = await createAccountWithPublicKey(publicKey);

      // Prepare unsigned token association for client to sign
      const tokenIds = ['TSLA', 'AAPL']
        .map(getTokenIdForSymbol)
        .filter(Boolean) as string[];

      const usdcId = process.env.USDC_TEST_TOKEN_ID;
      const noteId = process.env.SPEND_NOTE_TOKEN_ID;
      if (usdcId) tokenIds.push(usdcId);
      if (noteId) tokenIds.push(noteId);

      if (tokenIds.length > 0) {
        const txBytes = await prepareTokenAssociation(hederaAccountId, tokenIds);
        // Base64-encode for JSON transport
        let binary = '';
        for (let i = 0; i < txBytes.length; i++) {
          binary += String.fromCharCode(txBytes[i]);
        }
        tokenAssocTxBytes = Buffer.from(txBytes).toString('base64');
      }
    } else if (hederaConfigured) {
      // Legacy custodial path (no publicKey provided)
      const { createAccount, associateTokens, transferToken } = await import('@/lib/hedera');
      const { accountId, privateKey } = await createAccount();
      hederaAccountId = accountId;

      try {
        const tokenIds = ['TSLA', 'AAPL']
          .map(getTokenIdForSymbol)
          .filter(Boolean) as string[];

        const usdcId = process.env.USDC_TEST_TOKEN_ID;
        const noteId = process.env.SPEND_NOTE_TOKEN_ID;
        if (usdcId) tokenIds.push(usdcId);
        if (noteId) tokenIds.push(noteId);

        if (tokenIds.length > 0) {
          await associateTokens(hederaAccountId, tokenIds, privateKey);
        }

        if (usdcId) {
          const operatorId = process.env.HEDERA_OPERATOR_ID!;
          const fundAmount = 500_000_000;
          await transferToken(usdcId, operatorId, hederaAccountId, fundAmount);
        }
      } catch (tokenError) {
        console.error('Token setup failed (account still created):', tokenError);
      }
    }

    const user = await registerUser(email, name || '', hederaAccountId, publicKey || undefined);

    return NextResponse.json({
      user,
      created: true,
      tokenAssocTxBytes,
      needsTokenAssociation: !!tokenAssocTxBytes,
    });
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
