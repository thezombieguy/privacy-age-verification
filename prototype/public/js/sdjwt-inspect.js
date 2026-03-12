// sdjwt-inspect.js — Client-side SD-JWT decoder for display

function base64urlDecode(str) {
  // Add padding
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export function decodeJwtParts(sdJwt) {
  const parts = sdJwt.split('~').filter(Boolean);
  const jwtPart = parts[0];
  const disclosures = parts.slice(1);

  const [headerB64, payloadB64] = jwtPart.split('.');

  let header, payload;
  try {
    header = JSON.parse(base64urlDecode(headerB64));
  } catch {
    header = { error: 'Could not decode header' };
  }
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    payload = { error: 'Could not decode payload' };
  }

  const decodedDisclosures = disclosures.map((d) => {
    try {
      return JSON.parse(base64urlDecode(d));
    } catch {
      return ['error', 'Could not decode disclosure'];
    }
  });

  return { header, payload, disclosures: decodedDisclosures, raw: { jwt: jwtPart, disclosures } };
}

export function formatTimestamp(epoch) {
  return new Date(epoch * 1000).toLocaleString();
}
