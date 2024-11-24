'use server';

import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as zod from 'zod';

import { deleteCustomVerificationTokenById } from '@/data/db/tokens/verification-email/delete';
import { createNewCredentialsUser } from '@/data/db/user/create';
import { countUserRegistrationsByIp } from '@/data/db/user/helpers';
import { CustomRegisterCredentialsUserError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail/mail';
import { getHashedUserIpFromHeaders } from '@/lib/nextjs/headers';
import { RegisterSchema } from '@/schemas';

type RegisterActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to handle new user registration with email verification
 *
 * Manages the entire registration process including input validation, IP-based
 * rate limiting, user creation, and email verification token generation/sending.
 * Implements security measures like IP tracking and account limits.
 *
 * 1. Validate input fields
 * 2. Get and validate IP address
 * 3. Check account limits per IP (production only)
 * 4. Verify email uniqueness
 * 5. Create user and customVerification token
 * 6. Send verification email
 * 7. Delete the created token when send email fail
 *
 * @securityFeatures
 * - IP-based rate limiting (max 2 accounts per IP in production)
 * - Email uniqueness validation
 * - IP tracking for registrations
 *
 */
export const registerAction = async (values: zod.infer<typeof RegisterSchema>): Promise<RegisterActionResult> => {
  try {
    const validatedFields = RegisterSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new CustomRegisterCredentialsUserError('InvalidFields');
    }

    const { email, password, name } = validatedFields.data;
    const hashedIp = await getHashedUserIpFromHeaders();

    if (!hashedIp) {
      throw new CustomRegisterCredentialsUserError('IpValidation');
    }
    // Check account limit per IP
    if (process.env.NODE_ENV === 'production') {
      const accountCount = await countUserRegistrationsByIp({
        hashedIp,
      });

      if (accountCount >= 2) {
        throw new CustomRegisterCredentialsUserError('AccountLimit');
      }
    }

    // check existing email
    const existingUser = await db.user.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (existingUser) {
      throw new CustomRegisterCredentialsUserError('EmailExists');
    }

    // Create user and verification token
    const { emailCustomVerificationToken } = await createNewCredentialsUser({
      name,
      email,
      password,
      hashedIp,
    });

    // Send email for email-verification.

    const emailResponse = await sendVerificationEmail(
      emailCustomVerificationToken.email,
      emailCustomVerificationToken.token
    );

    // If it fails we still send success message. Account is Registered at this point!
    if (emailResponse.error) {
      await deleteCustomVerificationTokenById(emailCustomVerificationToken.id);
      return { success: messages.register.success.ACC_CREATED_EMAIL_SEND_FAILED };
    }

    return { success: messages.register.success.REGISTRATION_COMPLETE };
  } catch (error) {
    if (error instanceof CustomRegisterCredentialsUserError) {
      switch (error.type) {
        case 'InvalidFields':
          return { error: messages.generic.errors.INVALID_FIELDS };
        case 'IpValidation':
          return { error: messages.register.errors.IP_VALIDATION_FAILED };
        case 'AccountLimit':
          return { error: messages.register.errors.ACCOUNT_LIMIT };
        case 'EmailExists':
          return { error: messages.register.errors.EMAIL_EXISTS };
        default:
          return { error: messages.generic.errors.GENERIC_ERROR };
      }
    }

    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: messages.register.errors.EMAIL_EXISTS };
    }

    if (error instanceof PrismaClientInitializationError) {
      console.error('Database connection error:', error);
      return { error: messages.generic.errors.DB_CONNECTION_ERROR };
    }

    console.error('Unknown registration error:', error);
    return { error: messages.generic.errors.GENERIC_ERROR };
  }
};
