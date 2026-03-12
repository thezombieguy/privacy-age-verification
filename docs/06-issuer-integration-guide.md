# Issuer Integration Guide

How a bank, government agency, or identity provider implements credential issuance for AgeRelay.

## Overview

An **issuer** is a trusted organisation that already knows a user's age — a bank, government registry, or licensed identity provider. In the AgeRelay ecosystem, the issuer:

1. **Authenticates** the user (proves they are who they claim to be)
2. **Looks up** their age from existing records (no user input required)
3. **Issues** a cryptographic credential containing only `age_over_18: true`
4. **Redirects** the user back to the requesting website with the credential

The issuer never sends the user's name, date of birth, or any other personal data to the requesting website.

## Prerequisites

| Requirement | Detail |
|-------------|--------|
| **ES256 keypair** | Elliptic Curve key (P-256) for signing credentials |
| **JWKS endpoint** | Public key hosted at `/.well-known/jwks.json` |
| **HTTPS** | All production endpoints must use TLS |
| **User authentication** | Existing login system (SSO, banking app, government ID portal) |
| **Age data** | Access to verified age/date-of-birth records for your users |

## Step 1: Generate and Host an ES256 Keypair

Generate a P-256 keypair and expose the public key at a well-known URL so verifiers can fetch it.

```typescript
import * as jose from 'jose';

// Generate keypair (do this once, store securely)
const { publicKey, privateKey } = await jose.generateKeyPair('ES256');

// Export public key as JWK
const publicJwk = await jose.exportJWK(publicKey);

// Add metadata
const jwks = {
  keys: [{
    ...publicJwk,
    kid: 'your-key-id-1',
    alg: 'ES256',
    use: 'sig',
  }],
};

// Serve at GET /.well-known/jwks.json
app.get('/.well-known/jwks.json', (req, res) => {
  res.json(jwks);
});
```

**Key management requirements:**
- Store the private key in a Hardware Security Module (HSM) or secrets manager
- Rotate keys periodically (e.g. every 90 days)
- Keep expired keys in the JWKS for a grace period so in-flight credentials can still be verified
- Use a unique `kid` (key ID) per key so verifiers can look up the correct key

## Step 2: Build the SD-JWT Credential

When a user authenticates and their age qualifies, build a Selective Disclosure JWT (SD-JWT).

The SD-JWT format separates the signed JWT from its disclosures with `~` delimiters:

```
<signed-jwt>~<disclosure1>~<disclosure2>~
```

Each disclosure is a base64url-encoded JSON array: `[salt, claim_name, claim_value]`.

```typescript
import crypto from 'node:crypto';
import * as jose from 'jose';

function base64url(data: string | Uint8Array): string {
  const buf = typeof data === 'string'
    ? Buffer.from(data, 'utf-8')
    : Buffer.from(data);
  return buf.toString('base64url');
}

async function sha256(data: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(data, 'utf-8').digest();
  return base64url(hash);
}

async function issueAgeCredential(privateKey: jose.KeyLike): Promise<string> {
  // 1. Create disclosure for age_over_18
  const salt = base64url(crypto.randomBytes(16));
  const disclosure = base64url(
    JSON.stringify([salt, 'age_over_18', true])
  );
  const disclosureHash = await sha256(disclosure);

  // 2. Build JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'https://your-issuer.example.com',
    iat: now,
    exp: now + 3600, // 1 hour TTL
    _sd_alg: 'sha-256',
    _sd: [disclosureHash],
    vct: 'AgeCredential',
    issuer_name: 'Your Organisation Name',
  };

  // 3. Sign the JWT
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: 'ES256',
      kid: 'your-key-id-1',
      typ: 'vc+sd-jwt',
    })
    .sign(privateKey);

  // 4. Combine into SD-JWT format
  return `${jwt}~${disclosure}~`;
}
```

## Step 3: Implement the Redirect Flow

The issuer participates in an OAuth-like redirect flow:

### 3a. Receive the verification request

The requesting website redirects the user to your login page with:

```
GET /login?redirect_uri=https://example.com/callback&state=<random>
```

| Parameter | Description |
|-----------|-------------|
| `redirect_uri` | Where to send the user back after verification |
| `state` | CSRF token — must be returned unchanged |

### 3b. Authenticate the user

Present your standard login flow. The user proves their identity via your existing auth system (password, biometrics, banking app, etc.).

**Critical:** The user does NOT enter their age or date of birth. You already have this on file.

### 3c. Check age and issue credential

```typescript
app.post('/authenticate', async (req, res) => {
  const { username, password, redirect_uri, state } = req.body;

  // Validate redirect_uri against allowlist
  if (!isAllowedRedirectUri(redirect_uri)) {
    return res.status(400).send('Invalid redirect_uri');
  }

  // Authenticate user
  const user = await authenticateUser(username, password);
  if (!user) {
    return res.redirect('/login?error=invalid&...');
  }

  // Check age
  if (user.age < 18) {
    return res.render('underage'); // Dead end — no credential issued
  }

  // Issue credential
  const sdJwt = await issueAgeCredential(privateKey);

  // Redirect back with credential
  const callbackUrl = new URL(redirect_uri);
  callbackUrl.searchParams.set('token', sdJwt);
  callbackUrl.searchParams.set('state', state);
  res.redirect(302, callbackUrl.toString());
});
```

### 3d. Open redirect protection

Always validate the `redirect_uri` against an allowlist of registered verifier domains:

```typescript
const ALLOWED_ORIGINS = [
  'https://spacebook.example.com',
  'https://ticketmaster.example.com',
];

function isAllowedRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri);
    return ALLOWED_ORIGINS.includes(url.origin);
  } catch {
    return false;
  }
}
```

## API Contract

The issued credential (SD-JWT) must contain:

### JWT Header
```json
{
  "alg": "ES256",
  "kid": "<your-key-id>",
  "typ": "vc+sd-jwt"
}
```

### JWT Payload
```json
{
  "iss": "https://your-issuer.example.com",
  "iat": 1700000000,
  "exp": 1700003600,
  "_sd_alg": "sha-256",
  "_sd": ["<sha256-hash-of-disclosure>"],
  "vct": "AgeCredential",
  "issuer_name": "Your Organisation Name"
}
```

### Disclosure
```json
["<random-salt>", "age_over_18", true]
```

Base64url-encoded and appended after the JWT, separated by `~`.

## Security Requirements

| Requirement | Rationale |
|-------------|-----------|
| **HTTPS everywhere** | Prevent credential interception in transit |
| **Key rotation** | Limit blast radius if a key is compromised |
| **HSM or KMS** | Protect private keys from extraction |
| **Redirect URI allowlist** | Prevent open redirect attacks |
| **State parameter validation** | Prevent CSRF attacks |
| **Short credential TTL** | Limit replay window (1 hour recommended) |
| **Audit logging** | Log issuance events (not user data) for compliance |
| **Rate limiting** | Prevent credential farming |
| **No age data in logs** | Never log the user's actual age or date of birth |

## Testing

Use the AgeRelay demo to test your integration:

1. Start the demo server: `cd prototype && npm run dev`
2. Your issuer should redirect to your callback URL with a valid SD-JWT
3. The demo verifier at `/api/verify/present` can validate your credentials
4. Check `/.well-known/jwks.json` is accessible and returns your public key

## Credential Lifecycle

```
User visits age-gated site
         │
         ▼
    ┌──────────┐     redirect_uri + state
    │ Verifier │ ──────────────────────────► ┌────────┐
    │ (website)│                              │ Issuer │
    └──────────┘ ◄────────────────────────── │ (you)  │
         │        token (SD-JWT) + state      └────────┘
         ▼                                        │
    Verify signature                         Authenticate
    Check expiry                             Look up age
    Extract claim                            Issue or refuse
```
