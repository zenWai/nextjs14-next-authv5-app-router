import { expect, test, type Page } from '@playwright/test';

import { TEST_CONFIG } from '@/e2e-tests/config/test-config';
import { cleanupTestUserFromDB, createCredentialsTestUser } from '@/e2e-tests/helpers/helper-functions';
import { fillLoginForm } from '@/e2e-tests/helpers/tests';

test.describe('Authentication-based Navigation and Routing Tests', () => {
  const { TEST_EMAIL, TEST_PASSWORD, TEST_NAME } = TEST_CONFIG;
  const protectedRoutes = ['/admin', '/client', '/server', '/settings'];
  const authRoutes = ['/', '/login', '/register', '/loginerror', '/reset-password', '/new-password'];

  async function CreateAndLoginUser(page: Page) {
    await cleanupTestUserFromDB(TEST_EMAIL);
    await createCredentialsTestUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD, {
      emailVerified: true,
      isTwoFactorEnabled: false,
    });
    await fillLoginForm(page, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    await page.locator('button[type="submit"]').click();
  }

  async function navigateAndCheckRedirect(page: Page, route: string, expectedRedirect: string, expectedStatus = 307) {
    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith(route), { timeout: 10000 }),
      page.goto(route),
    ]);

    expect(response.status()).toBe(expectedStatus);
    await page.waitForURL(`**/${expectedRedirect}**`);
  }

  test('should redirect unauthenticated users to login page with correct callback URL', async ({ page }) => {
    await test.step('Verify initial state shows login page', async () => {
      await page.goto('/login');
      await page.waitForURL('**/login');
    });

    await test.step('Verify protected routes require authentication', async () => {
      for (const route of protectedRoutes) {
        await test.step(`When accessing ${route}, should redirect to login with correct callback`, async () => {
          await navigateAndCheckRedirect(page, route, 'login');

          const url = new URL(page.url());
          expect(url.searchParams.get('callbackUrl')).toBe(route);
        });
      }
    });
  });

  test('should redirect authenticated users from auth routes to settings page', async ({ page }) => {
    await test.step('Login user', async () => {
      await page.goto('/login');
      await CreateAndLoginUser(page);
      await page.waitForURL('**/settings');
    });

    await test.step('Verify authentication routes redirect back to settings', async () => {
      for (const route of authRoutes) {
        await test.step(`When accessing ${route}, should redirect to settings page`, async () => {
          await navigateAndCheckRedirect(page, route, 'settings');
          expect(page.url()).toContain('/settings');
        });
      }
    });
  });

  test('should redirect to originally requested protected page after successful login', async ({ page }) => {
    await test.step('Given an unauthenticated user accessing admin page', async () => {
      await navigateAndCheckRedirect(page, '/admin', 'login');
    });

    await test.step('When user logs in, should redirect to originally requested admin page', async () => {
      await CreateAndLoginUser(page);
      await page.waitForURL('**/admin');
      expect(page.url()).toContain('/admin');
    });
  });
});
