import crypto from 'node:crypto';
import { config } from '../config.js';

const store = new Map<string, number>(); // nonce -> expiry timestamp

export function generateNonce(): string {
  const nonce = crypto.randomBytes(32).toString('base64url');
  const expiry = Date.now() + config.nonceTtlSeconds * 1000;
  store.set(nonce, expiry);
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  const expiry = store.get(nonce);
  if (!expiry) return false;
  store.delete(nonce);
  return Date.now() < expiry;
}

// Periodic cleanup of expired nonces
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of store) {
    if (now >= expiry) store.delete(nonce);
  }
}, 60_000);
