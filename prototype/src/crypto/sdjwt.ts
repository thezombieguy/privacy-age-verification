import * as jose from 'jose';
import crypto from 'node:crypto';
import { getPrivateKey } from './keys.js';
import { config } from '../config.js';

function base64url(data: string | Uint8Array): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf-8') : Buffer.from(data);
  return buf.toString('base64url');
}

async function sha256Hash(data: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(data, 'utf-8').digest();
  return base64url(hash);
}

export interface IssuanceResult {
  sdJwt: string;          // compact: jwt~disclosure~
  disclosures: string[];  // raw base64url disclosure strings
  jwtPayload: Record<string, unknown>;
}

export async function issueCredential(minAge: number = 18): Promise<IssuanceResult> {
  const salt = base64url(crypto.randomBytes(16));
  const disclosure = base64url(JSON.stringify([salt, `age_over_${minAge}`, true]));
  const disclosureHash = await sha256Hash(disclosure);

  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    iss: config.issuerUrl,
    iat: now,
    exp: now + config.credentialTtlSeconds,
    _sd_alg: 'sha-256',
    _sd: [disclosureHash],
    vct: 'AgeCredential',
    issuer_name: config.issuerName,
    min_age: minAge,
  };

  const jwt = await new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'ES256', kid: 'agerelay-demo-1', typ: 'vc+sd-jwt' })
    .sign(getPrivateKey());

  const sdJwt = `${jwt}~${disclosure}~`;

  return { sdJwt, disclosures: [disclosure], jwtPayload: payload };
}
