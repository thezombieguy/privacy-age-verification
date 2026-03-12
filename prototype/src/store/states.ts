import crypto from 'node:crypto';
import { config } from '../config.js';

const store = new Map<string, { redirectUri: string; expiry: number }>();

export function generateState(redirectUri: string): string {
  const state = crypto.randomBytes(32).toString('base64url');
  const expiry = Date.now() + config.nonceTtlSeconds * 1000;
  store.set(state, { redirectUri, expiry });
  return state;
}

export function consumeState(state: string): string | null {
  const entry = store.get(state);
  if (!entry) return null;
  store.delete(state);
  if (Date.now() >= entry.expiry) return null;
  return entry.redirectUri;
}

// Periodic cleanup of expired states
setInterval(() => {
  const now = Date.now();
  for (const [state, entry] of store) {
    if (now >= entry.expiry) store.delete(state);
  }
}, 60_000);
