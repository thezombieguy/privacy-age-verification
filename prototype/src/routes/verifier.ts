import { Router } from 'express';
import { generateNonce, consumeNonce } from '../store/nonces.js';
import { verifyPresentation } from '../crypto/verify.js';

const router = Router();

router.get('/api/verify/nonce', (_req, res) => {
  const nonce = generateNonce();
  res.json({ nonce });
});

router.post('/api/verify/present', async (req, res) => {
  const { sd_jwt, nonce } = req.body;

  if (!sd_jwt || !nonce) {
    res.status(400).json({ error: 'Missing sd_jwt or nonce' });
    return;
  }

  if (!consumeNonce(nonce)) {
    res.status(400).json({ error: 'Invalid or expired nonce' });
    return;
  }

  const result = await verifyPresentation(sd_jwt, nonce);
  res.json(result);
});

export default router;
