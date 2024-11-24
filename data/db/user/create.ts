import { v4 as uuidv4 } from 'uuid';

import { hashPassword } from '@/lib/crypto/hash-edge-compatible';
import { db } from '@/lib/db';

type CreateCredentialsUserData = {
  name: string;
  email: string;
  password: string;
  hashedIp: string;
};

type CreateCredentialsUserResponse = {
  emailCustomVerificationToken: {
    id: string;
    token: string;
    email: string;
  };
};

/**
 * Creates a new credentials-based user with email verification token
 *
 * Creates a user account in the database with a hashed password and generates
 * an email verification token. Uses a single transaction.
 *
 * @param {CreateCredentialsUserData} params - name, email, password, hashedIp
 * @returns {Promise<CreateCredentialsUserResponse>} CustomVerificationToken data of created user
 *
 * @throws {PrismaClientKnownRequestError}
 * - P2002: Email already exists
 * - Other Prisma errors for database operation failures
 *
 * @note
 * - Verification token expires in 1 hour
 * - Password is automatically hashed
 * - Uses UUID v4 for token generation
 * - Returns the necessary token data for email sending
 */
export const createNewCredentialsUser = async ({
  name,
  email,
  password,
  hashedIp,
}: CreateCredentialsUserData): Promise<CreateCredentialsUserResponse> => {
  const token = uuidv4();

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create user and verification token
  const newUser = await db.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      ip: hashedIp,
      customVerificationTokens: {
        create: {
          email: email,
          token: token,
          expires: new Date(new Date().getTime() + 3600 * 1000), // 1hr
        },
      },
    },
    select: {
      customVerificationTokens: {
        where: {
          token: token,
        },
        select: {
          id: true,
          token: true,
          email: true,
        },
      },
    },
  });
  const [verificationToken] = newUser.customVerificationTokens;

  return {
    emailCustomVerificationToken: verificationToken,
  };
};
