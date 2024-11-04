import { expect, Page, test } from '@playwright/test';

import { TEST_CONFIG } from '@/e2e-tests/config/test-config';
import { cleanupTestUserFromDB, createCredentialsTestUser } from '@/e2e-tests/helpers/helper-functions';
import { cleanupMailsacInbox, getEmailContent } from '@/e2e-tests/helpers/mailsac/mailsac';
import { fillLoginForm } from '@/e2e-tests/helpers/tests';

test.describe('2FA Authentication Flow', () => {
  const { MAILSAC_API_KEY, TEST_EMAIL, TEST_PASSWORD, TEST_NAME } = TEST_CONFIG;

  async function cleanupState() {
    await cleanupTestUserFromDB(TEST_EMAIL);
    const mailsacResponseStatus = await cleanupMailsacInbox(TEST_EMAIL, MAILSAC_API_KEY);
    expect(mailsacResponseStatus).toBe(204);
  }

  async function createTwoFactorUser() {
    await createCredentialsTestUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD, {
      isTwoFactorEnabled: true,
      emailVerified: true,
    });
  }

  async function initiateLogin(page: Page) {
    await page.goto('/login');
    await fillLoginForm(page, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    await page.locator('button[type="submit"]').click();
  }

  async function getTwoFactorCode(): Promise<string> {
    const emailContent = await getEmailContent(TEST_EMAIL, MAILSAC_API_KEY, '2FA Code', {
      retries: 5,
      delay: 2000,
      exactMatch: false,
    });

    const twoFactorCode = emailContent.match(/(\d{6})/)?.[1];

    if (!twoFactorCode) {
      throw new Error('Could not extract 2FA code from email');
    }

    return twoFactorCode;
  }

  async function submitTwoFactorCode(page: Page, code: string) {
    await page.locator('input[name="code"]').fill(code);
    await page.locator('button[type="submit"]').click();
  }

  test('should successfully authenticate user with valid 2FA code', async ({ page }) => {
    await test.step('Setup test environment', async () => {
      await cleanupState();
      await createTwoFactorUser();
    });

    await test.step('Initiate login process', async () => {
      await initiateLogin(page);
    });

    await test.step('Process 2FA verification', async () => {
      const twoFactorCode = await getTwoFactorCode();
      await submitTwoFactorCode(page, twoFactorCode);
      await page.waitForURL('**/settings');
      await expect(page).toHaveURL('/settings');
    });
  });

  test('should reject login attempt with invalid 2FA code', async ({ page }) => {
    await test.step('Setup test environment', async () => {
      await cleanupState();
      await createTwoFactorUser();
    });

    await test.step('Attempt login with invalid 2FA code', async () => {
      await initiateLogin(page);
      await submitTwoFactorCode(page, '000000');
      await expect(page.getByText('Invalid code')).toBeVisible();
    });
  });
});
