# Verifier Integration Guide

How a website integrates JustAge privacy-preserving age verification.

## Overview

A **verifier** is any website that needs to confirm a visitor is over 18 — a social media platform, alcohol delivery service, online casino, or age-restricted content platform. In the JustAge ecosystem, the verifier:

1. **Redirects** the user to a trusted issuer to obtain a credential
2. **Receives** the credential back via a callback URL
3. **Verifies** the cryptographic signature and checks the `age_over_18` claim
4. **Grants access** — without ever learning the user's name, date of birth, or identity

You never see or store any personal data. You only receive proof that a trusted issuer confirmed the user is over 18.

## Prerequisites

| Requirement | Detail |
|-------------|--------|
| **HTTPS** | Your callback URL must use TLS in production |
| **Server-side code** | To generate state parameters and verify credentials |
| **Trusted issuer list** | JWKS URLs of issuers you accept |

No special cryptographic libraries are needed beyond a JWT verification library (e.g. `jose`).

## Step 1: Redirect the User to the Issuer

When a user needs age verification, redirect them to a trusted issuer's login page.

```typescript
import crypto from 'node:crypto';

// In-memory state store (use Redis or similar in production)
const stateStore = new Map<string, { redirectUri: string; expiry: number }>();

app.get('/start-verify', (req, res) => {
  // Generate CSRF state parameter
  const state = crypto.randomBytes(32).toString('base64url');
  const redirectUri = 'https://your-site.com/callback';

  stateStore.set(state, {
    redirectUri,
    expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  // Redirect to issuer
  const issuerUrl = new URL('https://issuer.example.com/login');
  issuerUrl.searchParams.set('redirect_uri', redirectUri);
  issuerUrl.searchParams.set('state', state);

  res.redirect(302, issuerUrl.toString());
});
```

### Parameters sent to the issuer

| Parameter | Description |
|-----------|-------------|
| `redirect_uri` | Your callback URL where the credential will be delivered |
| `state` | Random CSRF token — the issuer must return this unchanged |

## Step 2: Receive the Callback

After the user authenticates with the issuer, they're redirected back to your callback URL with:

```
GET /callback?token=<sd-jwt>&state=<state>
```

| Parameter | Description |
|-----------|-------------|
| `token` | The SD-JWT credential (compact format) |
| `state` | Your CSRF token — verify it matches |

### Server-side callback handler

```typescript
app.get('/callback', async (req, res) => {
  const { token, state } = req.query;

  // 1. Validate state parameter
  const storedState = stateStore.get(state);
  if (!storedState || Date.now() >= storedState.expiry) {
    return res.status(400).send('Invalid or expired state');
  }
  stateStore.delete(state); // Consume — one-time use

  // 2. Verify the credential
  const result = await verifyCredential(token);

  if (result.valid && result.claims.age_over_18 === true) {
    // Age verified — grant access
    req.session.ageVerified = true;
    res.redirect('/');
  } else {
    res.status(403).send('Age verification failed');
  }
});
```

## Step 3: Verify the Credential

Verification involves four checks:

1. **Signature** — the JWT was signed by a trusted issuer
2. **Expiry** — the credential hasn't expired
3. **Disclosure hash** — the `age_over_18` disclosure matches the hash in the JWT
4. **Claim value** — `age_over_18` is `true`

### Fetch the issuer's public key

```typescript
import * as jose from 'jose';

async function getIssuerPublicKey(issuerUrl: string): Promise<jose.KeyLike> {
  const jwksUrl = `${issuerUrl}/.well-known/jwks.json`;
  const response = await fetch(jwksUrl);
  const jwks = await response.json();

  // Find the signing key
  const key = jwks.keys.find(
    (k: any) => k.use === 'sig' && k.alg === 'ES256'
  );
  if (!key) throw new Error('No suitable signing key found');

  return jose.importJWK(key, 'ES256');
}
```

### Full verification logic

```typescript
import crypto from 'node:crypto';

function base64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

async function sha256(data: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(data, 'utf-8').digest();
  return Buffer.from(hash).toString('base64url');
}

interface VerificationResult {
  valid: boolean;
  claims: Record<string, unknown>;
  error?: string;
}

async function verifyCredential(sdJwt: string): Promise<VerificationResult> {
  // 1. Parse SD-JWT format: jwt~disclosure1~disclosure2~
  const parts = sdJwt.split('~').filter(Boolean);
  if (parts.length < 2) {
    return { valid: false, claims: {}, error: 'Invalid SD-JWT format' };
  }

  const jwtPart = parts[0];
  const disclosures = parts.slice(1);

  // 2. Verify JWT signature
  let payload;
  try {
    // Decode issuer from JWT to know which public key to fetch
    const unverifiedPayload = JSON.parse(
      base64urlDecode(jwtPart.split('.')[1])
    );
    const publicKey = await getIssuerPublicKey(unverifiedPayload.iss);

    const result = await jose.jwtVerify(jwtPart, publicKey, {
      algorithms: ['ES256'],
    });
    payload = result.payload;
  } catch {
    return { valid: false, claims: {}, error: 'Signature verification failed' };
  }

  // 3. Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    return { valid: false, claims: {}, error: 'Credential expired' };
  }

  // 4. Verify disclosure hashes
  const sdArray = (payload._sd as string[]) || [];
  const claims: Record<string, unknown> = {};

  for (const disc of disclosures) {
    const hash = await sha256(disc);
    if (!sdArray.includes(hash)) {
      return { valid: false, claims: {}, error: 'Disclosure hash mismatch' };
    }
    try {
      const decoded = JSON.parse(base64urlDecode(disc));
      if (Array.isArray(decoded) && decoded.length === 3) {
        claims[decoded[1]] = decoded[2];
      }
    } catch {
      return { valid: false, claims: {}, error: 'Invalid disclosure format' };
    }
  }

  // 5. Check the claim we care about
  if (claims.age_over_18 !== true) {
    return { valid: false, claims, error: 'age_over_18 claim is not true' };
  }

  return { valid: true, claims };
}
```

## API Contract

### What you receive

The SD-JWT token contains a signed JWT and one or more disclosures:

```
eyJhbGciOi....<jwt>....~WyJzYWx0IiwiYWdlX292ZXJfMTgiLHRydWVd~
```

### JWT payload structure

```json
{
  "iss": "https://issuer.example.com",
  "iat": 1700000000,
  "exp": 1700003600,
  "_sd_alg": "sha-256",
  "_sd": ["<hash>"],
  "vct": "AgeCredential",
  "issuer_name": "Government Identity Service"
}
```

### Decoded disclosure

```json
["<salt>", "age_over_18", true]
```

### What you should extract

| Field | Source | Use |
|-------|--------|-----|
| `age_over_18` | Disclosure | The claim you're verifying — must be `true` |
| `iss` | JWT payload | Identify which issuer made the claim |
| `exp` | JWT payload | Ensure credential is still valid |
| `vct` | JWT payload | Confirm credential type is `AgeCredential` |

## Security Requirements

| Requirement | Rationale |
|-------------|-----------|
| **Validate state parameter** | Prevent CSRF — confirm it matches what you generated |
| **Consume state on use** | One-time use prevents replay |
| **Short state TTL** | 5 minutes maximum |
| **Verify JWT signature** | Ensure credential was issued by a trusted party |
| **Check expiry** | Reject stale credentials |
| **HTTPS on callback** | Prevent token interception |
| **Allowlist issuers** | Only accept credentials from trusted issuers |
| **Don't store the credential** | You don't need it after verification — store only the boolean result |
| **Don't log the token** | Tokens could be correlated across sites |

## Client-Side Alternative

If your architecture prefers client-side verification (e.g. single-page apps), you can verify the credential in the browser:

```javascript
// On your callback page
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

// Send to your verification endpoint
const res = await fetch('/api/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
const result = await res.json();

if (result.valid) {
  // Grant access in the UI
}
```

This is the approach used in the JustAge demo.

## Testing

Use the JustAge demo server to test your integration:

1. Start the demo: `cd prototype && npm run dev`
2. The demo issuer is at `http://localhost:3000/demo/issuer/login`
3. Use demo accounts: `jane.smith` / `password` (age 25), `tom.young` / `password` (age 16)
4. Fetch the public key from `http://localhost:3000/.well-known/jwks.json`
5. Verify credentials against `POST http://localhost:3000/api/verify/present`

## Flow Diagram

```
User visits your site
         │
         ▼
  ┌─────────────┐    redirect_uri + state     ┌────────────┐
  │ Your Site   │ ───────────────────────────► │  Trusted   │
  │ (verifier)  │                              │  Issuer    │
  │             │ ◄─────────────────────────── │            │
  └─────────────┘   token (SD-JWT) + state     └────────────┘
         │
         ▼
  Verify signature ✓
  Check expiry     ✓
  Check disclosure ✓
  age_over_18: true ✓
         │
         ▼
  Grant access
  (no personal data stored)
```
