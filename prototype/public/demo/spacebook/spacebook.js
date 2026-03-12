// Spacebook callback — verify the SD-JWT received from the issuer

(async function verifyCallback() {
  const status = document.getElementById('status');
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const state = params.get('state');

  if (!token) {
    status.innerHTML = `
      <div style="color: var(--c-danger); font-weight: 600;">No token received</div>
      <p style="margin-top: .5rem; font-size: var(--fs-sm); color: var(--c-text-dim);">
        The issuer did not return a credential. <a href="/demo/spacebook/">Go back</a>
      </p>
    `;
    return;
  }

  try {
    // 1. Get a fresh nonce from the verifier
    const nonceRes = await fetch('/api/verify/nonce');
    const { nonce } = await nonceRes.json();

    // 2. Present the credential for verification
    const verifyRes = await fetch('/api/verify/present', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sd_jwt: token, nonce }),
    });
    const result = await verifyRes.json();

    // 3. Store credential and result in localStorage
    localStorage.setItem('agerelay-demo-credential', token);
    localStorage.setItem('agerelay-demo-verification', JSON.stringify(result));

    if (result.valid) {
      // Redirect to Spacebook main page (which will read localStorage)
      window.location.href = '/demo/spacebook/';
    } else {
      status.innerHTML = `
        <div style="color: var(--c-danger); font-size: 2rem; margin-bottom: .5rem;">&#x26A0;</div>
        <div style="color: var(--c-danger); font-weight: 700; font-size: var(--fs-lg);">Verification Failed</div>
        <p style="margin-top: .5rem; font-size: var(--fs-sm); color: var(--c-text-dim);">
          ${result.error || 'The credential could not be verified.'}
        </p>
        <a href="/demo/spacebook/" class="btn btn--ghost btn--small" style="margin-top: 1rem;">Go Back</a>
      `;
    }
  } catch (err) {
    status.innerHTML = `
      <div style="color: var(--c-danger); font-weight: 600;">Verification error</div>
      <p style="margin-top: .5rem; font-size: var(--fs-sm); color: var(--c-text-dim);">
        ${err.message}. <a href="/demo/spacebook/">Go back</a>
      </p>
    `;
  }
})();
