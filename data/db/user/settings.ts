import { UserRole } from '@prisma/client';

import { db } from '@/lib/db';

type UserSettingsDataReturn = {
  name: string | null;
  id: string;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
};

/**
 * Retrieves user settings data with specific field selection
 *
 * Fetches essential user data needed for settings management, including
 * authentication status, role, and security preferences.
 *
 * @param {string} userId - The user's ID
 */
export const getUserSettingsData = async (userId: string): Promise<UserSettingsDataReturn | null> => {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      password: true,
      name: true,
      role: true,
      isTwoFactorEnabled: true,
    },
  });
};
