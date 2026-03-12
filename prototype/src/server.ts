import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { initKeys } from './crypto/keys.js';
import wellknownRoutes from './routes/wellknown.js';
import issuerRoutes from './routes/issuer.js';
import verifierRoutes from './routes/verifier.js';
import demoRoutes from './routes/demo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await initKeys();
  console.log('ES256 keypair generated');

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

  app.use(wellknownRoutes);
  app.use(issuerRoutes);
  app.use(verifierRoutes);
  app.use(demoRoutes);

  app.listen(config.port, () => {
    console.log(`JustAge prototype running at http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
