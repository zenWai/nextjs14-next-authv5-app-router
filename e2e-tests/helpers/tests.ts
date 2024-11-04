import type { Page } from '@playwright/test';

type LoginFormData = {
  email: string | null;
  password: string | null;
};

/**
 * Fill out the Login form
 */
export async function fillLoginForm(page: Page, data: LoginFormData): Promise<void> {
  const TEST_EMAIL = data.email;
  const TEST_PASSWORD = data.password;

  if (TEST_EMAIL) await page.locator('input[name="email"]').fill(TEST_EMAIL);
  if (TEST_PASSWORD) await page.locator('input[name="password"]').fill(TEST_PASSWORD);
}

type RegistrationFormData = {
  email: string | null;
  password: string | null;
  name: string | null;
};

/**
 * Fill out the Registration form
 */
export async function fillRegistrationForm(page: Page, data: RegistrationFormData): Promise<void> {
  const TEST_EMAIL = data.email;
  const TEST_PASSWORD = data.password;
  const TEST_NAME = data.name;

  if (TEST_EMAIL) await page.locator('input[name="email"]').fill(TEST_EMAIL);
  if (TEST_PASSWORD) await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  if (TEST_NAME) await page.locator('input[name="name"]').fill(TEST_NAME);
}
