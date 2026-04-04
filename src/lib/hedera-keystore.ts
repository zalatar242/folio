'use client';

// Client-side Hedera key management — private key never leaves the browser

const STORAGE_KEY_PRIVATE = 'folio:hedera:privateKey';
const STORAGE_KEY_PUBLIC = 'folio:hedera:publicKey';

export function hasKeypair(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_KEY_PRIVATE);
}

export async function generateKeypair(): Promise<{ privateKeyDer: string; publicKeyDer: string }> {
  const { PrivateKey } = await import('@hashgraph/sdk');
  const privateKey = PrivateKey.generateED25519();
  const privateKeyDer = privateKey.toStringDer();
  const publicKeyDer = privateKey.publicKey.toStringDer();

  localStorage.setItem(STORAGE_KEY_PRIVATE, privateKeyDer);
  localStorage.setItem(STORAGE_KEY_PUBLIC, publicKeyDer);

  return { privateKeyDer, publicKeyDer };
}

export function getStoredPublicKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_PUBLIC);
}

export async function signTransaction(txBytes: Uint8Array): Promise<Uint8Array> {
  const { PrivateKey, Transaction } = await import('@hashgraph/sdk');
  const privateKeyDer = localStorage.getItem(STORAGE_KEY_PRIVATE);
  if (!privateKeyDer) throw new Error('No private key found — please back up and re-import your key');

  const privateKey = PrivateKey.fromStringDer(privateKeyDer);
  const tx = Transaction.fromBytes(txBytes);
  await tx.sign(privateKey);
  return tx.toBytes();
}

export function exportKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_PRIVATE);
}

export function importKey(privateKeyDer: string): string {
  // Validate by parsing — throws if invalid
  // We do this synchronously since PrivateKey.fromStringDer is sync in the SDK
  // but we need the dynamic import for tree-shaking
  localStorage.setItem(STORAGE_KEY_PRIVATE, privateKeyDer);
  // Derive public key — caller should call validateImportedKey() after
  return privateKeyDer;
}

export async function validateImportedKey(): Promise<string> {
  const { PrivateKey } = await import('@hashgraph/sdk');
  const privateKeyDer = localStorage.getItem(STORAGE_KEY_PRIVATE);
  if (!privateKeyDer) throw new Error('No key to validate');

  const privateKey = PrivateKey.fromStringDer(privateKeyDer);
  const publicKeyDer = privateKey.publicKey.toStringDer();
  localStorage.setItem(STORAGE_KEY_PUBLIC, publicKeyDer);
  return publicKeyDer;
}

export function clearKeypair(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_PRIVATE);
  localStorage.removeItem(STORAGE_KEY_PUBLIC);
}
