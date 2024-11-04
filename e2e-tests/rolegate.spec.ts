import { expect, Page, test } from '@playwright/test';

import { TEST_CONFIG } from '@/e2e-tests/config/test-config';
import { cleanupTestUserFromDB, createCredentialsTestUser } from '@/e2e-tests/helpers/helper-functions';
import { cleanupMailsacInbox } from '@/e2e-tests/helpers/mailsac/mailsac';
import { fillLoginForm } from '@/e2e-tests/helpers/tests';

test.describe('Role-based Access Control Tests', () => {
  const { MAILSAC_API_KEY, TEST_EMAIL, TEST_PASSWORD, TEST_NAME } = TEST_CONFIG;
  let bundleChecksCompleted = false;
  const ADMIN_CONTENT = 'This is a example of secret content';
  const PERMISSION_DENIED = 'You do not have permission to view this content!';

  test.beforeEach('Clean up User state, clean up mailbox', async () => {
    await cleanupTestUserFromDB(TEST_EMAIL);
    const mailsacResponseStatus = await cleanupMailsacInbox(TEST_EMAIL, MAILSAC_API_KEY);
    expect(mailsacResponseStatus).toBe(204);
  });

  async function checkContentVisibility(page: Page, isAdmin: boolean) {
    if (isAdmin) {
      await expect(page.getByText(ADMIN_CONTENT)).toBeVisible();

      await expect(page.getByText(PERMISSION_DENIED)).not.toBeVisible();
    } else {
      await expect(page.getByText(ADMIN_CONTENT)).not.toBeVisible();

      await expect(page.getByText(PERMISSION_DENIED)).toBeVisible();
    }
  }

  async function checkSourceContent(page: Page, isAdmin: boolean) {
    const html = await page.content();
    if (isAdmin) {
      expect(html).toContain(ADMIN_CONTENT);
    } else {
      expect(html).not.toContain(ADMIN_CONTENT);
    }

    const [response] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith('/admin')),
      page.reload(),
    ]);
    const responseText = await response.text();

    if (isAdmin) {
      expect(responseText).toContain(ADMIN_CONTENT);
    } else {
      expect(responseText).not.toContain(
        ADMIN_CONTENT
      );
    }

    await checkJSBundlesForSensitiveData(page);
  }

  type ActionType = 'Route Handler' | 'Server Action';
  type ActionOutcome = 'Allowed' | 'Forbidden';

  async function checkAdminAction(page: Page, actionType: ActionType, expectedOutcome: ActionOutcome) {
    const buttonText = `Admin-only ${actionType}`;
    const toastText = `${expectedOutcome} ${actionType === 'Route Handler' ? 'RH call' : 'Server Action!'}`;

    // Find and click the action button
    const button = page
      .locator('div.flex.flex-row', {
        has: page.getByText(buttonText, { exact: true }),
      })
      .getByRole('button');

    await button.click();
    // Check toast message
    await expect(
      page.locator('[data-sonner-toast] [data-title]', {
        hasText: toastText,
      })).toBeVisible();
  }

  async function checkJSBundlesForSensitiveData(page: Page) {
    if (bundleChecksCompleted) {
      return;
    }

    const scriptUrls = await page.evaluate(() => {
      return Array.from(document.getElementsByTagName('script'))
        .map((script) => script.src)
        .filter((src) => src.includes('/_next/static/chunks/'))
        .filter((src) => !src.includes('webpack') && !src.includes('framework'));
    });

    for (const url of scriptUrls) {
      const response = await page.request.get(url);
      const content = await response.text();

      expect(content).not.toContain(
        'This is a example of secret content'
      );
    }

    bundleChecksCompleted = true;
  }

  async function loginWithRole(page: Page, role: 'USER' | 'ADMIN') {
    await createCredentialsTestUser(TEST_NAME, TEST_EMAIL, TEST_PASSWORD, {
      isTwoFactorEnabled: false,
      emailVerified: true,
      role,
    });

    await page.goto('/login');
    await fillLoginForm(page, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/settings');
  }

  test('Should restrict access for User role', async ({ page }) => {
    await loginWithRole(page, 'USER');
    await page.goto('/admin');

    await test.step('Should prevent access to admin content', async () => {
      await checkContentVisibility(page, false);
    });

    await test.step('Should not expose sensitive data in page source', async () => {
      await checkSourceContent(page, false);
    });

    await test.step('Should block admin route handler access', async () => {
      await checkAdminAction(page, 'Route Handler', 'Forbidden');
    });

    await test.step('Should block admin server action access', async () => {
      await checkAdminAction(page, 'Server Action', 'Forbidden');
    });
  });

  test('Should grant full access for Admin role', async ({ page }) => {
    await loginWithRole(page, 'ADMIN');
    await page.goto('/admin');

    await test.step('Should display admin content', async () => {
      await checkContentVisibility(page, true);
    });

    await test.step('Should include sensitive data in DOM', async () => {
      await checkSourceContent(page, true);
    });

    await test.step('Should allow admin route handler access', async () => {
      await checkAdminAction(page, 'Route Handler', 'Allowed');
    });

    await test.step('Should allow admin server action access', async () => {
      await checkAdminAction(page, 'Server Action', 'Allowed');
    });
  });
});
