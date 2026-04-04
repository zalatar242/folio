'use client';

import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useHederaKey } from './use-hedera-key';

export interface FolioUser {
  email: string;
  name: string;
  hederaAccountId: string;
  publicKey?: string;
}

type RegistrationStatus =
  | 'idle'
  | 'generating-key'
  | 'creating-account'
  | 'signing-association'
  | 'completing'
  | 'done'
  | 'error';

export function useUserRegistration() {
  const { user } = useDynamicContext();
  const { hasKey, publicKeyDer, generateKey, signTransaction } = useHederaKey();
  const [folioUser, setFolioUser] = useState<FolioUser | null>(null);
  const [status, setStatus] = useState<RegistrationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    async function register() {
      try {
        // Step 1: Ensure we have a keypair
        let pubKey = publicKeyDer;
        if (!hasKey || !pubKey) {
          setStatus('generating-key');
          pubKey = await generateKey();
        }

        if (cancelled) return;

        // Step 2: Register with server (sends public key, gets unsigned token assoc tx)
        setStatus('creating-account');
        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user!.email,
            name: user!.firstName || '',
            publicKey: pubKey,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.details || err.error || 'Registration failed');
        }

        const data = await res.json();
        if (cancelled) return;

        // If user already existed, we're done
        if (!data.needsTokenAssociation) {
          setFolioUser(data.user);
          setStatus('done');
          return;
        }

        // Step 3: Sign the token association transaction client-side
        setStatus('signing-association');
        const signedTxBytes = await signTransaction(data.tokenAssocTxBytes);

        if (cancelled) return;

        // Step 4: Submit signed transaction to server
        setStatus('completing');
        const completeRes = await fetch('/api/users/register/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user!.email,
            signedTxBytes,
          }),
        });

        if (!completeRes.ok) {
          const err = await completeRes.json().catch(() => ({}));
          throw new Error(err.details || err.error || 'Token association failed');
        }

        if (cancelled) return;

        setFolioUser(data.user);
        setStatus('done');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Registration failed');
          setStatus('error');
        }
      }
    }

    register();
    return () => { cancelled = true; };
  }, [user, hasKey, publicKeyDer, generateKey, signTransaction]);

  return {
    folioUser,
    registering: status !== 'idle' && status !== 'done' && status !== 'error',
    status,
    error,
  };
}
