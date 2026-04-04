// Plaid client singleton + file-backed token store

import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const isPlaidConfigured = !!(
  process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET
);

// File-backed access token store — persists across dev server restarts
// In production, use encrypted database storage
const TOKEN_FILE = join(process.cwd(), '.plaid-tokens.json');

function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveTokens(tokens: Record<string, string>): void {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export function setAccessToken(userId: string, token: string): void {
  const tokens = loadTokens();
  tokens[userId] = token;
  saveTokens(tokens);
}

export function getAccessToken(userId: string): string | undefined {
  return loadTokens()[userId];
}

export function hasAccessToken(userId: string): boolean {
  return userId in loadTokens();
}
