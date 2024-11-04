export const TEST_CONFIG = {
  MAILSAC_API_KEY: process.env.MAILSAC_API_KEY!,
  DATABASE_URL: process.env.DATABASE_URL!,
  TEST_EMAIL: 'zenwainextauthtesting@mailsac.com',
  TEST_PASSWORD: '1234567',
  TEST_NAME: 'faketesting',
};

if (!TEST_CONFIG.MAILSAC_API_KEY) {
  throw new Error('MAILSAC_API_KEY is required');
}

if (!TEST_CONFIG.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}
