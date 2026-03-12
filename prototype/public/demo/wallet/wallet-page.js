// Wallet page — reads credentials from localStorage

(function renderWallet() {
  const container = document.getElementById('walletContent');
  const credential = localStorage.getItem('agerelay-demo-credential');
  const verification = JSON.parse(localStorage.getItem('agerelay-demo-verification') || 'null');

  if (!credential) {
    container.innerHTML = `
      <div class="wallet-empty">
        <div class="empty-icon">&#x1f4B3;</div>
        <h2>No Credentials Yet</h2>
        <p>You haven't received any age verification credentials. Visit Spacebook to get started.</p>
        <a href="/demo/spacebook/" class="btn btn--blue">Go to Spacebook</a>
      </div>
    `;
    return;
  }

  // Decode the SD-JWT for display
  const parts = credential.split('~').filter(Boolean);
  const jwtPart = parts[0];
  const disclosures = parts.slice(1);

  let payload = {};
  let header = {};
  try {
    const [headerB64, payloadB64] = jwtPart.split('.');
    header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    // ignore decode errors
  }

  let decodedDisclosures = [];
  for (const disc of disclosures) {
    try {
      decodedDisclosures.push(JSON.parse(atob(disc.replace(/-/g, '+').replace(/_/g, '/'))));
    } catch (e) {
      decodedDisclosures.push(disc);
    }
  }

  const isValid = verification && verification.valid;
  const claims = verification ? verification.claims : {};

  // Find the dynamic age_over_N claim from disclosures
  const ageClaim = decodedDisclosures
    .filter(d => Array.isArray(d) && d.length === 3)
    .find(d => String(d[1]).startsWith('age_over_'));
  const ageClaimDisplay = ageClaim ? `${ageClaim[1]}: ${ageClaim[2]}` : 'age_over_18: true';

  const expDate = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown';
  const iatDate = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown';

  container.innerHTML = `
    <div class="cred-card">
      <div class="cred-card-header">
        <span class="cred-type">Age Credential</span>
        <span class="cred-badge">${isValid ? '&#x2714; Verified' : '&#x23F3; Unverified'}</span>
      </div>

      <div class="cred-claim">
        <span class="cred-claim-label">Claim</span>
        <span class="cred-claim-value cred-claim-value--highlight">${ageClaimDisplay}</span>
      </div>
      <div class="cred-claim">
        <span class="cred-claim-label">Issuer</span>
        <span class="cred-claim-value">${escapeHtml(payload.issuer_name || payload.iss || 'Unknown')}</span>
      </div>
      <div class="cred-claim">
        <span class="cred-claim-label">Issued</span>
        <span class="cred-claim-value">${iatDate}</span>
      </div>
      <div class="cred-claim">
        <span class="cred-claim-label">Expires</span>
        <span class="cred-claim-value">${expDate}</span>
      </div>
      <div class="cred-claim">
        <span class="cred-claim-label">Type</span>
        <span class="cred-claim-value">${escapeHtml(payload.vct || 'Unknown')}</span>
      </div>

      <div class="not-included">
        <h4>Not included in this credential:</h4>
        <div class="not-included-tags">
          <span class="not-included-tag">Full Name</span>
          <span class="not-included-tag">Date of Birth</span>
          <span class="not-included-tag">Address</span>
          <span class="not-included-tag">ID Number</span>
          <span class="not-included-tag">Photo</span>
        </div>
      </div>

      <details class="inspect-section">
        <summary>Decoded Token</summary>
        <pre class="inspect-pre">${escapeHtml(JSON.stringify({ header, payload, disclosures: decodedDisclosures }, null, 2))}</pre>
      </details>

      <details class="inspect-section">
        <summary>Raw SD-JWT</summary>
        <pre class="inspect-pre">${escapeHtml(credential)}</pre>
      </details>
    </div>

    <div class="wallet-actions">
      <a href="/demo/spacebook/" class="btn btn--blue btn--small">Back to Spacebook</a>
      <button class="btn btn--ghost btn--small" onclick="clearWallet()">Clear Wallet</button>
    </div>
  `;
})();

function clearWallet() {
  localStorage.removeItem('agerelay-demo-credential');
  localStorage.removeItem('agerelay-demo-verification');
  window.location.reload();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
