import { test, expect, type Page } from '@playwright/test';

import { TEST_CONFIG } from '@/e2e-tests/config/test-config';
import { cleanupMailsacInbox, extractVerificationToken, getEmailContent } from '@/e2e-tests/helpers/mailsac/mailsac';
import { fillLoginForm, fillRegistrationForm } from '@/e2e-tests/helpers/tests';
import { cleanupTestUserFromDB } from '@/e2e-tests/helpers/helper-functions';

test.describe('User Registration and Email Verification Flow', () => {
  const { MAILSAC_API_KEY, TEST_EMAIL, TEST_PASSWORD, TEST_NAME } = TEST_CONFIG;

  async function cleanupState() {
    const mailsacResponseStatus = await cleanupMailsacInbox(TEST_EMAIL, MAILSAC_API_KEY);
    expect(mailsacResponseStatus).toBe(204);
    await cleanupTestUserFromDB(TEST_EMAIL);
  }

  async function registerNewUser(page: Page) {
    await page.goto('/register');

    await test.step('Fill out registration form', async () => {
      await fillRegistrationForm(page, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME,
      });
    });

    await test.step('Submit registration and verify response', async () => {
      const [response] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith('/register'), { timeout: 10000 }),
        page.locator('button[type="submit"]').click(),
      ]);
      expect(response.status()).toBe(200);
    });

    await test.step('Verify success message', async () => {
      const expectedMessage = 'Confirmation email sent!';
      await expect(page.getByText(expectedMessage, { exact: false })).toBeVisible({ timeout: 5000 });
    });
  }

  async function attemptLoginBeforeConfirmationEmailHandled(page: Page) {
    await page.goto('/login');

    await test.step('Attempt login before doing the email confirmation', async () => {
      await fillLoginForm(page, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      await page.locator('button[type="submit"]').click();
    });

    await test.step('Verify confirmation requirement message', async () => {
      await expect(
        page.getByText('Confirmation email already sent! Check your inbox!', { exact: true })).toBeVisible({
        timeout: 5000,
      });
    });
  }

  async function verifyEmailAndLogin(page: Page) {
    await test.step('Process verification email', async () => {
      const emailContent = await getEmailContent(TEST_EMAIL, MAILSAC_API_KEY, 'Please confirm your email');
      expect(emailContent).toBeTruthy();

      const verificationToken = await extractVerificationToken(emailContent);
      expect(verificationToken).toBeTruthy();

      await page.goto(`/new-verification?token=${verificationToken}`);
      await expect(
        page.getByText('Email verified!')).toBeVisible();
    });

    await test.step('Navigate to login', async () => {
      await page.getByRole('link', { name: 'Back to login' }).click();
      await page.waitForURL('**/login');
    });

    await test.step('Complete login process', async () => {
      await fillLoginForm(page, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      const [response] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith('/login'), { timeout: 10000 }),
        page.locator('button[type="submit"]').click(),
      ]);

      expect(response.status()).toBe(303);
      await page.waitForURL('**/settings');
    });
  }

  test('should complete full registration flow with email verification', async ({ page }) => {
    await test.step('Start with a clean state', async () => {
      await cleanupState();
    });

    await test.step('Register new user', async () => {
      await registerNewUser(page);
    });

    await test.step('Login attempts should be blocked until email verification', async () => {
      await attemptLoginBeforeConfirmationEmailHandled(page);
    });

    await test.step('After email verification, login should succeed', async () => {
      await verifyEmailAndLogin(page);
    });
  });
});
