'use server';

import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import * as zod from 'zod';

import { unstable_update } from '@/auth';
import { getUserSettingsData } from '@/data/db/user/settings';
import { currentSessionUser } from '@/lib/auth/auth-utils';
import { CustomSettingsError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { hashPassword, verifyPassword } from '@/lib/crypto/hash-edge-compatible';
import { db } from '@/lib/db';
import { SettingsSchema } from '@/schemas';

type SettingsActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to handle user settings updates
 *
 * Manages user profile updates of a logged-in user.
 * Handles different update scenarios for OAuth and password-based users, with
 * appropriate validations and restrictions.
 *
 * @specialBehavior
 * - OAuth users cannot change password or 2FA settings
 * - Password changes require current password verification
 * - Returns dynamic success message based on updated fields
 * - Updates user session to reflect changes immediately
 *
 * @helper getValuesWeAreUpdating
 * Helper function that:
 * - Determines which fields have actually changed
 * - Builds update data object for database
 * - Tracks changed fields for success message
 * - Prevents unnecessary database updates
 */
export const settingsAction = async (values: zod.infer<typeof SettingsSchema>): Promise<SettingsActionResult> => {
  try {
    const authUser = await currentSessionUser();
    if (!authUser?.id || !authUser.email) {
      throw new CustomSettingsError('Unauthorized');
    }

    const validatedFields = SettingsSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new CustomSettingsError('InvalidFields');
    }

    let { name, password, newPassword, isTwoFactorEnabled, role } = validatedFields.data;
    /* Fields that users from oauth should not be able to change */
    if (authUser.isOauth) {
      password = undefined;
      newPassword = undefined;
      isTwoFactorEnabled = undefined;
    }

    const userData = await getUserSettingsData(authUser.id);
    if (!userData?.email) {
      throw new CustomSettingsError('Unauthorized');
    }

    /* Password change logic */
    let hashedNewPassword = undefined;
    if (password && newPassword && userData.password) {
      const { isPasswordValid, passwordNeedsUpdate } = await verifyPassword(password, userData.password);
      if (passwordNeedsUpdate) {
        throw new CustomSettingsError('PasswordNeedUpdate');
      }
      if (!isPasswordValid) {
        throw new CustomSettingsError('IncorrectPassword');
      }
      if (password === newPassword) {
        throw new CustomSettingsError('SamePassword');
      }
      hashedNewPassword = await hashPassword(newPassword);
    }

    const { updateData, updatedFields, hasChanges } = getValuesWeAreUpdating({
      name,
      hashedNewPassword,
      isTwoFactorEnabled,
      role,
      userData: {
        name: userData.name ?? '',
        isTwoFactorEnabled: userData.isTwoFactorEnabled,
        role: userData.role,
      },
    });
    if (!hasChanges) {
      throw new CustomSettingsError('NoChangesToBeMade');
    }

    const updatedUser = await db.user.update({
      where: { id: userData.id },
      data: updateData,
    });

    await unstable_update({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        image: updatedUser.image,
        isOauth: true,
        isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
        role: updatedUser.role,
        name: updatedUser.name ?? undefined,
      },
    });
    // Create update message
    const updatedMessage =
      updatedFields.length === 1
        ? `Updated ${updatedFields[0]}`
        : `Updated ${updatedFields.slice(0, -1).join(', ')} and ${updatedFields[updatedFields.length - 1]}`;
    return { success: updatedMessage };
  } catch (error) {
    if (error instanceof CustomSettingsError) {
      switch (error.type) {
        case 'Unauthorized':
          return { error: messages.settings.errors.UNAUTHORIZED };
        case 'InvalidFields':
          return { error: messages.settings.errors.INVALID_FIELDS };
        case 'IncorrectPassword':
          return { error: messages.settings.errors.INCORRECT_PASSWORD };
        case 'SamePassword':
          return { error: messages.settings.errors.SAME_PASSWORD };
        case 'NoChangesToBeMade':
          return { error: messages.settings.errors.NO_CHANGES_REQUIRED };
        case 'PasswordNeedUpdate':
          return { error: messages.settings.errors.PASSWORD_NEEDS_UPDATE };
        default:
          return { error: messages.generic.errors.UNKNOWN_ERROR };
      }
    }

    if (error instanceof PrismaClientInitializationError) {
      console.error('Database connection error:', error);
      return { error: messages.generic.errors.DB_CONNECTION_ERROR };
    }

    console.error('Settings update error:', error);
    return { error: messages.generic.errors.GENERIC_ERROR };
  }
};

interface GetUpdateValuesParams {
  name?: string;
  hashedNewPassword?: string;
  isTwoFactorEnabled?: boolean;
  role?: string;
  userData: {
    name: string;
    isTwoFactorEnabled: boolean;
    role: string;
  };
}

function getValuesWeAreUpdating({
  name,
  hashedNewPassword,
  isTwoFactorEnabled,
  role,
  userData,
}: GetUpdateValuesParams) {
  const updateData: Record<string, any> = {};
  const updatedFields: string[] = [];

  if (name && name !== userData.name) {
    updateData.name = name;
    updatedFields.push('name');
  }

  if (hashedNewPassword) {
    updateData.password = hashedNewPassword;
    updatedFields.push('password');
  }

  if (typeof isTwoFactorEnabled === 'boolean' && isTwoFactorEnabled !== userData.isTwoFactorEnabled) {
    updateData.isTwoFactorEnabled = isTwoFactorEnabled;
    updatedFields.push('2FA');
  }

  if (role && role !== userData.role) {
    updateData.role = role;
    updatedFields.push('role');
  }

  return {
    updateData,
    updatedFields,
    hasChanges: updatedFields.length > 0,
  };
}
