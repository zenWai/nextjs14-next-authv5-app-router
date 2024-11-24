import { expect, test, type Page } from '@playwright/test';

import { TEST_CONFIG } from '@/e2e-tests/config/test-config';
import { cleanupTestUserFromDB, createCredentialsTestUser } from '@/e2e-tests/helpers/helper-functions';
import { cleanupMailsacInbox, getEmailContent } from '@/e2e-tests/helpers/mailsac/mailsac';
import { fillLoginForm } from '@/e2e-tests/helpers/tests';
import { messages } from '@/lib/constants/messages/actions/messages';

test.describe('Password Reset Flow', () => {
  const { MAILSAC_API_KEY, TEST_EMAIL, TEST_PASSWORD, TEST_NAME } = TEST_CONFIG;
  const NEW_PASSWORD = 'newpassword123';

  async function setupTestUser() {
    await cleanupTestUserFromDB(TEST_EMAIL);
    const mailsacResponseStatus = await cleanupMailsacInbox(TEST_EMAIL, MAILSAC_API_KEY);
    expect(mailsacResponseStatus).toBe(204);

    await createCredentialsTestUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD, {
      emailVerified: true,
      isTwoFactorEnabled: false,
    });
  }

  async function requestPasswordReset(page: Page) {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.waitForURL('**/reset-password');

    await page.locator('input[name="email"]').fill(TEST_EMAIL);

    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/reset-password'), { timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ]);

    expect(response.status()).toBe(200);

    await expect(page.getByText(messages.reset_password.success.PASSWORD_RESET_EMAIL_SENT)).toBeVisible();
  }

  async function getResetToken(): Promise<string> {
    const emailContent = await getEmailContent(TEST_EMAIL, MAILSAC_API_KEY, 'Reset your password', {
      retries: 5,
      delay: 2000,
      exactMatch: false,
    });

    const resetTokenMatch = emailContent.match(/token=([a-zA-Z0-9-]+)/);
    const resetToken = resetTokenMatch?.[1];

    if (!resetToken) {
      throw new Error('Could not extract reset token from email');
    }

    return resetToken;
  }

  async function resetPassword(page: Page, token: string) {
    await page.goto(`/new-password?token=${token}`);
    await expect(page.getByText('Enter a new password')).toBeVisible();

    await page.locator('input[name="password"]').fill(NEW_PASSWORD);
    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith(`/new-password?token=${token}`), { timeout: 10000 }),
      page.locator('button[type="submit"]').click(),
    ]);

    expect(response.status()).toBe(200);
  }

  async function verifyNewPassword(page: Page) {
    await page.goto('/login');
    await fillLoginForm(page, {
      email: TEST_EMAIL,
      password: NEW_PASSWORD,
    });
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/settings');
    await expect(page).toHaveURL('/settings');
  }

  test('Completes full password reset flow', async ({ page }) => {
    await test.step('Setup test environment', async () => {
      await setupTestUser();
    });

    await test.step('Request password reset', async () => {
      await requestPasswordReset(page);
    });

    await test.step('Process reset token and change password', async () => {
      const resetToken = await getResetToken();
      await resetPassword(page, resetToken);
      await expect(page.getByText(messages.new_password.success.UPDATE_SUCCESSFUL)).toBeVisible();
    });

    await test.step('Should be able to login with new password', async () => {
      await verifyNewPassword(page);
    });
  });

  test('Should show error for invalid reset token', async ({ page }) => {
    await resetPassword(page, 'invalid-token');

    await expect(page.getByText(messages.new_password.errors.INVALID_TOKEN)).toBeVisible();
  });
});
