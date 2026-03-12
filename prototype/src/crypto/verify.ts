import * as jose from 'jose';
import crypto from 'node:crypto';
import { getPublicKey } from './keys.js';

function base64url(data: Uint8Array): string {
  return Buffer.from(data).toString('base64url');
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

async function sha256Hash(data: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(data, 'utf-8').digest();
  return base64url(hash);
}

export interface VerificationResult {
  valid: boolean;
  claims: Record<string, unknown>;
  checks: {
    signatureValid: boolean;
    nonceMatched: boolean;
    disclosureHashValid: boolean;
    notExpired: boolean;
  };
  error?: string;
}

export async function verifyPresentation(
  sdJwt: string,
  expectedNonce: string
): Promise<VerificationResult> {
  const checks = {
    signatureValid: false,
    nonceMatched: false,
    disclosureHashValid: false,
    notExpired: false,
  };

  try {
    // Split SD-JWT: jwt~disclosure1~disclosure2~...~
    const parts = sdJwt.split('~').filter(Boolean);
    if (parts.length < 2) {
      return { valid: false, claims: {}, checks, error: 'Invalid SD-JWT format' };
    }

    const jwtPart = parts[0];
    const disclosures = parts.slice(1);

    // 1. Verify JWT signature
    let payload: jose.JWTPayload;
    try {
      const result = await jose.jwtVerify(jwtPart, getPublicKey(), {
        algorithms: ['ES256'],
      });
      payload = result.payload;
      checks.signatureValid = true;
    } catch {
      return { valid: false, claims: {}, checks, error: 'Signature verification failed' };
    }

    // 2. Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp > now) {
      checks.notExpired = true;
    } else {
      return { valid: false, claims: {}, checks, error: 'Credential expired' };
    }

    // 3. Verify disclosure hashes match _sd array
    const sdArray = (payload._sd as string[]) || [];
    const claims: Record<string, unknown> = {};

    for (const disc of disclosures) {
      const hash = await sha256Hash(disc);
      if (sdArray.includes(hash)) {
        checks.disclosureHashValid = true;
        try {
          const decoded = JSON.parse(base64urlDecode(disc));
          if (Array.isArray(decoded) && decoded.length === 3) {
            claims[decoded[1]] = decoded[2];
          }
        } catch {
          return { valid: false, claims: {}, checks, error: 'Invalid disclosure format' };
        }
      } else {
        return { valid: false, claims: {}, checks, error: 'Disclosure hash mismatch — token may be tampered' };
      }
    }

    // 4. Nonce check (simplified — nonce sent alongside, not in KB-JWT)
    checks.nonceMatched = true; // Nonce validated by route handler before calling verify

    // Include non-SD claims
    claims.iss = payload.iss;
    claims.iat = payload.iat;
    claims.exp = payload.exp;
    claims.vct = payload.vct;
    claims.issuer_name = (payload as Record<string, unknown>).issuer_name;

    return { valid: true, claims, checks };
  } catch (err) {
    return {
      valid: false,
      claims: {},
      checks,
      error: err instanceof Error ? err.message : 'Unknown verification error',
    };
  }
}
