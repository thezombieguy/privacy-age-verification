import crypto from 'node:crypto';
import { config } from '../config.js';

const store = new Map<string, { redirectUri: string; minAge: number; expiry: number }>();

export function generateState(redirectUri: string, minAge: number): string {
  const state = crypto.randomBytes(32).toString('base64url');
  const expiry = Date.now() + config.nonceTtlSeconds * 1000;
  store.set(state, { redirectUri, minAge, expiry });
  return state;
}

export function consumeState(state: string): { redirectUri: string; minAge: number } | null {
  const entry = store.get(state);
  if (!entry) return null;
  store.delete(state);
  if (Date.now() >= entry.expiry) return null;
  return { redirectUri: entry.redirectUri, minAge: entry.minAge };
}

// Periodic cleanup of expired states
setInterval(() => {
  const now = Date.now();
  for (const [state, entry] of store) {
    if (now >= entry.expiry) store.delete(state);
  }
}, 60_000);
