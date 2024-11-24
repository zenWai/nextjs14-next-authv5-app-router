import { type User } from '@prisma/client';

import { db } from '@/lib/db';

/**
 * Gets the number of accounts registered with a given IP address
 * @param data - Configuration options
 * @param data.hashedIp - User's hashed IP address
 * @throws {Error} When database operation fails
 * @returns {Promise<number>} Number of accounts registered with the IP
 */
export const countUserRegistrationsByIp = async ({ hashedIp }: { hashedIp: string }): Promise<number> => {
  const existingAccounts = await db.user.count({
    where: { ip: hashedIp },
  });

  return existingAccounts;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await db.user.findUnique({ where: { email } });

  return user;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await db.user.findUnique({ where: { id } });

  return user;
};
