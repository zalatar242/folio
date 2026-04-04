// File-backed user registry — maps Dynamic auth users to Hedera accounts
// In production, use encrypted database storage

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface FolioUser {
  email: string;
  name: string;
  hederaAccountId: string;
  createdAt: string;
}

const REGISTRY_FILE = join(process.cwd(), '.user-registry.json');

function loadRegistry(): Record<string, FolioUser> {
  try {
    return JSON.parse(readFileSync(REGISTRY_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveRegistry(registry: Record<string, FolioUser>): void {
  writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));
}

export function getUser(email: string): FolioUser | undefined {
  return loadRegistry()[email.toLowerCase()];
}

export function registerUser(email: string, name: string, hederaAccountId: string): FolioUser {
  const registry = loadRegistry();
  const key = email.toLowerCase();
  const user: FolioUser = {
    email: key,
    name: name || email.split('@')[0],
    hederaAccountId,
    createdAt: new Date().toISOString(),
  };
  registry[key] = user;
  saveRegistry(registry);
  return user;
}

export function searchUsers(query: string): FolioUser[] {
  const registry = loadRegistry();
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return Object.values(registry).filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.includes(q)
  );
}

export function getUserByAccountId(accountId: string): FolioUser | undefined {
  const registry = loadRegistry();
  return Object.values(registry).find((u) => u.hederaAccountId === accountId);
}

export function getAllUsers(): FolioUser[] {
  return Object.values(loadRegistry());
}
