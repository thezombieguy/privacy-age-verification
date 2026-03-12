import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authenticate } from '../store/users.js';
import { generateState, consumeState } from '../store/states.js';
import { issueCredential } from '../crypto/sdjwt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// ─── Spacebook: Start verification flow ───
router.get('/demo/spacebook/start-verify', (_req, res) => {
  const redirectUri = '/demo/spacebook/callback';
  const state = generateState(redirectUri);
  res.redirect(302, `/demo/issuer/login?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`);
});

// ─── Issuer: Login page (server-rendered) ───
router.get('/demo/issuer/login', (req, res) => {
  const redirectUri = req.query.redirect_uri as string || '';
  const state = req.query.state as string || '';
  const error = req.query.error as string || '';

  // Validate redirect_uri for open redirect protection
  if (!redirectUri.startsWith('/demo/')) {
    res.status(400).send('Invalid redirect_uri');
    return;
  }

  res.type('html').send(renderLoginPage(redirectUri, state, error));
});

// ─── Issuer: Authenticate + issue credential ───
router.post('/demo/issuer/authenticate', async (req, res) => {
  const { username, password, redirect_uri, state } = req.body;

  // Validate redirect_uri
  if (!redirect_uri || !redirect_uri.startsWith('/demo/')) {
    res.status(400).send('Invalid redirect_uri');
    return;
  }

  // Authenticate user
  const user = authenticate(username, password);
  if (!user) {
    res.redirect(302, `/demo/issuer/login?redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&error=invalid`);
    return;
  }

  // Check age
  if (user.age < 18) {
    res.type('html').send(renderUnderagePage(user.name));
    return;
  }

  // Validate state
  const storedRedirectUri = consumeState(state);
  if (!storedRedirectUri) {
    res.status(400).send('Invalid or expired state parameter');
    return;
  }

  // Issue credential
  const result = await issueCredential();
  res.redirect(302, `${storedRedirectUri}?token=${encodeURIComponent(result.sdJwt)}&state=${state}`);
});

// ─── Server-rendered HTML ───

function renderLoginPage(redirectUri: string, state: string, error: string): string {
  const errorHtml = error === 'invalid'
    ? `<div class="login-error">Invalid username or password. Please try again.</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Identity Service — Login</title>
  <link rel="stylesheet" href="/demo/shared.css">
  <link rel="stylesheet" href="/demo/issuer/issuer.css">
</head>
<body>
  <div class="issuer-page">
    <header class="issuer-header">
      <div class="issuer-shield">&#x1f3db;</div>
      <div>
        <h1>Government Identity Service</h1>
        <p class="issuer-subtitle">Digital Age Verification</p>
      </div>
    </header>

    <div class="login-card">
      <h2>Sign In</h2>
      <p class="login-desc">Authenticate to verify your age. We will only share whether you are over 18 — no personal details are sent to the requesting site.</p>

      ${errorHtml}

      <form method="POST" action="/demo/issuer/authenticate">
        <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}">
        <input type="hidden" name="state" value="${escapeHtml(state)}">

        <label for="username">Username</label>
        <input type="text" id="username" name="username" placeholder="e.g. jane.smith" required autocomplete="username">

        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="password" required autocomplete="current-password">

        <button type="submit" class="btn btn--navy">Sign In &amp; Verify Age</button>
      </form>

      <div class="demo-hint">
        <strong>Demo accounts:</strong>
        <span class="hint-account">jane.smith / password <em>(age 25)</em></span>
        <span class="hint-account">tom.young / password <em>(age 16)</em></span>
        <span class="hint-account">alex.wong / password <em>(age 18)</em></span>
      </div>
    </div>

    <div class="privacy-notice">
      <strong>Privacy guarantee:</strong> Only a cryptographic proof of "age over 18" is shared. Your name, date of birth, and identity details are never sent to the requesting website.
    </div>
  </div>
</body>
</html>`;
}

function renderUnderagePage(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Government Identity Service — Verification</title>
  <link rel="stylesheet" href="/demo/shared.css">
  <link rel="stylesheet" href="/demo/issuer/issuer.css">
</head>
<body>
  <div class="issuer-page">
    <header class="issuer-header">
      <div class="issuer-shield">&#x1f3db;</div>
      <div>
        <h1>Government Identity Service</h1>
        <p class="issuer-subtitle">Digital Age Verification</p>
      </div>
    </header>

    <div class="underage-card">
      <div class="underage-icon">&#x26D4;</div>
      <h2>Age Verification Unsuccessful</h2>
      <p>Sorry, we cannot verify that <strong>${escapeHtml(name)}</strong> is over 18.</p>
      <p class="underage-detail">Our records indicate you do not meet the minimum age requirement. No credential has been issued and no information has been shared with the requesting website.</p>
      <a href="/demo/spacebook/" class="btn btn--ghost">Return to Spacebook</a>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default router;
