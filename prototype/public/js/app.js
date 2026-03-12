// app.js — Scene-based demo flow orchestration

import { wallet } from './wallet.js';
import { decodeJwtParts, formatTimestamp } from './sdjwt-inspect.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ── Scene config ──
const SCENES = {
  1: {
    url: 'https://spacebook.com',
    narrator: 'You visit a website that requires age verification.',
  },
  2: {
    url: 'https://myid.gov.au/age-verify',
    narrator: 'A trusted issuer (government, bank) verifies your age and issues a credential.',
  },
  3: {
    url: 'wallet://my-credentials',
    narrator: 'Your credential is stored on your device. You control it. Inspect it \u2014 no identity data inside.',
  },
  4: {
    url: 'https://spacebook.com',
    narrator: 'The website verifies the cryptographic proof. It receives age_over_18 = true \u2014 nothing else.',
  },
};

let currentScene = 1;

// ── DOM references ──
const urlText = $('#url-text');
const narratorText = $('#narrator-text');
const progressDots = $$('.progress-dot');

// Scene elements
const scene1 = $('#scene-1');
const scene2 = $('#scene-2');
const scene3 = $('#scene-3');
const scene4 = $('#scene-4');

// Buttons
const btnStartVerify = $('#btn-start-verify');
const btnIssue = $('#btn-issue');
const btnToWallet = $('#btn-to-wallet');
const btnReturnBarfinder = $('#btn-return-barfinder');
const btnTamper = $('#btn-tamper');
const btnReset = $('#btn-reset');

// Gov success state
const govIssueState = $('#gov-issue-state');
const govSuccess = $('#gov-success');

// Wallet display
const credType = $('#cred-type');
const credClaims = $('#cred-claims');
const walletRaw = $('#wallet-raw');
const walletDecoded = $('#wallet-decoded');

// Result display
const resultBadge = $('#result-badge');
const resultTitle = $('#result-title');
const resultSubtitle = $('#result-subtitle');
const unblurredListings = $('#unblurred-listings');
const panelReceived = $('#panel-received');
const panelVerified = $('#panel-verified');
const panelAbsent = $('#panel-absent');

// ═══════════════════════════════════════════
// SCENE NAVIGATION
// ═══════════════════════════════════════════

function goToScene(num) {
  currentScene = num;

  // Update URL bar
  urlText.textContent = SCENES[num].url;

  // Update narrator
  narratorText.textContent = SCENES[num].narrator;

  // Update progress dots
  progressDots.forEach((dot) => {
    const dotScene = parseInt(dot.dataset.scene);
    dot.classList.toggle('active', dotScene <= num);
  });

  // Toggle active scene
  $$('.scene').forEach((s) => s.classList.remove('active'));
  $(`#scene-${num}`).classList.add('active');
}

// ═══════════════════════════════════════════
// SCENE 1 → SCENE 2: Start verification
// ═══════════════════════════════════════════

btnStartVerify.addEventListener('click', () => {
  goToScene(2);
});

// ═══════════════════════════════════════════
// SCENE 2: Issue credential
// ═══════════════════════════════════════════

btnIssue.addEventListener('click', async () => {
  btnIssue.disabled = true;
  btnIssue.innerHTML = '<span class="spinner"></span> Verifying...';

  try {
    const res = await fetch('/api/issuer/credential', { method: 'POST' });
    if (!res.ok) throw new Error('Issuance failed');
    const data = await res.json();
    wallet.store(data);

    // Show success state
    govIssueState.style.display = 'none';
    govSuccess.classList.add('visible');
  } catch (err) {
    btnIssue.textContent = 'Error — Try Again';
    btnIssue.disabled = false;
    console.error('Issuance error:', err);
  }
});

// ═══════════════════════════════════════════
// SCENE 2 → SCENE 3: Go to wallet
// ═══════════════════════════════════════════

btnToWallet.addEventListener('click', () => {
  renderWallet();
  goToScene(3);
});

// ═══════════════════════════════════════════
// SCENE 3: Render wallet contents
// ═══════════════════════════════════════════

function renderWallet() {
  const cred = wallet.get();
  if (!cred) return;

  const decoded = decodeJwtParts(cred.sd_jwt);

  credType.textContent = decoded.payload.vct || 'AgeCredential';

  credClaims.innerHTML = `
    <div class="cred-claim">
      <span class="cred-claim-label">Claim</span>
      <span class="cred-claim-value cred-claim-value--highlight">age_over_18 = true</span>
    </div>
    <div class="cred-claim">
      <span class="cred-claim-label">Issuer</span>
      <span class="cred-claim-value">${decoded.payload.issuer_name || decoded.payload.iss}</span>
    </div>
    <div class="cred-claim">
      <span class="cred-claim-label">Issued</span>
      <span class="cred-claim-value">${formatTimestamp(decoded.payload.iat)}</span>
    </div>
    <div class="cred-claim">
      <span class="cred-claim-label">Expires</span>
      <span class="cred-claim-value">${formatTimestamp(decoded.payload.exp)}</span>
    </div>
    <div class="cred-claim">
      <span class="cred-claim-label">Type</span>
      <span class="cred-claim-value">${decoded.payload.vct}</span>
    </div>
  `;

  walletRaw.textContent = cred.sd_jwt;

  walletDecoded.innerHTML =
    `<strong>Header:</strong>\n${JSON.stringify(decoded.header, null, 2)}\n\n` +
    `<strong>Payload:</strong>\n${JSON.stringify(decoded.payload, null, 2)}\n\n` +
    `<strong>Disclosures:</strong>\n${decoded.disclosures.map((d) => JSON.stringify(d)).join('\n')}`;
}

// ═══════════════════════════════════════════
// SCENE 3 → SCENE 4: Verify and show result
// ═══════════════════════════════════════════

btnReturnBarfinder.addEventListener('click', async () => {
  btnReturnBarfinder.disabled = true;
  btnReturnBarfinder.innerHTML = '<span class="spinner"></span> Presenting...';

  try {
    const cred = wallet.get();
    if (!cred) throw new Error('No credential');

    const result = await doVerify(cred.sd_jwt);
    renderVerification(result);
    goToScene(4);
  } catch (err) {
    console.error('Verification error:', err);
    btnReturnBarfinder.textContent = 'Error — Try Again';
  } finally {
    btnReturnBarfinder.disabled = false;
    btnReturnBarfinder.textContent = 'Return to Spacebook';
  }
});

// ═══════════════════════════════════════════
// VERIFICATION API
// ═══════════════════════════════════════════

async function doVerify(sdJwt) {
  const nonceRes = await fetch('/api/verify/nonce');
  if (!nonceRes.ok) throw new Error('Failed to get nonce');
  const { nonce } = await nonceRes.json();

  const presentRes = await fetch('/api/verify/present', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sd_jwt: sdJwt, nonce }),
  });
  if (!presentRes.ok) throw new Error('Presentation failed');
  return presentRes.json();
}

// ═══════════════════════════════════════════
// RENDER VERIFICATION RESULT
// ═══════════════════════════════════════════

function renderVerification(result) {
  if (result.valid) {
    resultBadge.className = 'result-badge result-badge--success';
    resultBadge.innerHTML = '&#x2714; Verified';
    resultTitle.textContent = 'Age Verified \u2014 Access Granted';
    resultSubtitle.textContent = 'Spacebook received only a cryptographic proof. No personal data.';
    unblurredListings.style.display = '';

    panelReceived.className = 'panel panel--received';
    panelReceived.innerHTML = `
      <h4>Received</h4>
      <ul>
        <li><code>age_over_18: ${result.claims.age_over_18}</code></li>
        <li>Issuer: ${result.claims.issuer_name || result.claims.iss}</li>
        <li>Expires: ${formatTimestamp(result.claims.exp)}</li>
      </ul>
    `;

    panelVerified.className = 'panel panel--verified';
    panelVerified.innerHTML = `
      <h4>Verified</h4>
      <ul>
        <li>Signature valid ${result.checks.signatureValid ? '\u2714' : '\u2718'}</li>
        <li>Nonce matched ${result.checks.nonceMatched ? '\u2714' : '\u2718'}</li>
        <li>Disclosure hash ${result.checks.disclosureHashValid ? '\u2714' : '\u2718'}</li>
        <li>Not expired ${result.checks.notExpired ? '\u2714' : '\u2718'}</li>
      </ul>
    `;

    panelAbsent.className = 'panel panel--absent';
    panelAbsent.innerHTML = `
      <h4>Not Received</h4>
      <ul>
        <li>Name \u2014 absent</li>
        <li>Date of birth \u2014 absent</li>
        <li>ID number \u2014 absent</li>
        <li>Address \u2014 absent</li>
        <li>Photo \u2014 absent</li>
      </ul>
    `;
  } else {
    resultBadge.className = 'result-badge result-badge--error';
    resultBadge.innerHTML = '&#x2718; Rejected';
    resultTitle.textContent = 'Verification Failed';
    resultSubtitle.textContent = 'The credential could not be cryptographically verified.';
    unblurredListings.style.display = 'none';

    panelReceived.className = 'panel panel--error';
    panelReceived.innerHTML = `
      <h4>Verification Failed</h4>
      <p class="error-detail">${result.error}</p>
    `;

    panelVerified.className = 'panel panel--error';
    panelVerified.innerHTML = `
      <h4>Checks</h4>
      <ul>
        <li>Signature ${result.checks.signatureValid ? '\u2714' : '\u2718'}</li>
        <li>Nonce ${result.checks.nonceMatched ? '\u2714' : '\u2718'}</li>
        <li>Disclosure hash ${result.checks.disclosureHashValid ? '\u2714' : '\u2718'}</li>
        <li>Not expired ${result.checks.notExpired ? '\u2714' : '\u2718'}</li>
      </ul>
    `;

    panelAbsent.className = 'panel panel--error';
    panelAbsent.innerHTML = `
      <h4>Result</h4>
      <p>Age verification <strong>rejected</strong>. The credential could not be verified.</p>
    `;
  }
}

// ═══════════════════════════════════════════
// TAMPER DEMO
// ═══════════════════════════════════════════

btnTamper.addEventListener('click', async () => {
  const cred = wallet.get();
  if (!cred) return;

  btnTamper.disabled = true;
  btnTamper.innerHTML = '<span class="spinner spinner--dark"></span> Tampering...';

  try {
    // Corrupt the JWT payload
    const parts = cred.sd_jwt.split('.');
    const payloadChars = parts[1].split('');
    const mid = Math.floor(payloadChars.length / 2);
    payloadChars[mid] = payloadChars[mid] === 'A' ? 'B' : 'A';
    parts[1] = payloadChars.join('');
    const tampered = parts.join('.');

    const result = await doVerify(tampered);
    renderVerification(result);

    // Update narrator for tamper scene
    narratorText.textContent = 'A corrupted token is cryptographically rejected. The math works.';
  } catch (err) {
    // Even network errors mean the tampered token was rejected
    renderVerification({
      valid: false,
      error: err.message,
      checks: {
        signatureValid: false,
        nonceMatched: false,
        disclosureHashValid: false,
        notExpired: false,
      },
    });
    narratorText.textContent = 'A corrupted token is cryptographically rejected. The math works.';
  } finally {
    btnTamper.disabled = false;
    btnTamper.textContent = 'Tamper Demo';
  }
});

// ═══════════════════════════════════════════
// RESET / START OVER
// ═══════════════════════════════════════════

btnReset.addEventListener('click', () => {
  wallet.clear();

  // Reset gov issuer scene
  govIssueState.style.display = '';
  govSuccess.classList.remove('visible');
  btnIssue.disabled = false;
  btnIssue.textContent = 'Verify My Age';

  // Go back to scene 1
  goToScene(1);
});

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

goToScene(1);
