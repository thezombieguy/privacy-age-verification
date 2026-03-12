import * as jose from 'jose';

let privateKey: jose.KeyLike;
let publicKey: jose.KeyLike;
let publicJwk: jose.JWK;

export async function initKeys(): Promise<void> {
  const { privateKey: priv, publicKey: pub } = await jose.generateKeyPair('ES256');
  privateKey = priv;
  publicKey = pub;
  publicJwk = await jose.exportJWK(pub);
  publicJwk.kid = 'agerelay-demo-1';
  publicJwk.alg = 'ES256';
  publicJwk.use = 'sig';
}

export function getPrivateKey(): jose.KeyLike {
  return privateKey;
}

export function getPublicKey(): jose.KeyLike {
  return publicKey;
}

export function getJwks(): { keys: jose.JWK[] } {
  return { keys: [publicJwk] };
}
