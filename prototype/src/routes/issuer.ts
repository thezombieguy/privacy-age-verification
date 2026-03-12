import { Router } from 'express';
import { issueCredential } from '../crypto/sdjwt.js';

const router = Router();

router.post('/api/issuer/credential', async (_req, res) => {
  try {
    const result = await issueCredential();
    res.json({
      sd_jwt: result.sdJwt,
      disclosures: result.disclosures,
      payload_preview: result.jwtPayload,
    });
  } catch (err) {
    console.error('Issuance error:', err);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

export default router;
