export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  issuerUrl: process.env.ISSUER_URL || 'http://localhost:3000',
  credentialTtlSeconds: 3600,     // 1 hour
  nonceTtlSeconds: 300,           // 5 minutes
  issuerName: 'JustAge Demo Issuer',
};
