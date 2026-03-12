import { Router } from 'express';
import { getJwks } from '../crypto/keys.js';

const router = Router();

router.get('/.well-known/jwks.json', (_req, res) => {
  res.json(getJwks());
});

export default router;
