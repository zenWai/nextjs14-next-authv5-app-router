'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/auth';
import { CustomMagicLinkError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';

type MagicLinkActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to handle magic link authentication requests
 *
 * Processes email-based authentication by sending a magic link to the user's email.
 * Uses the Resend provider from Auth.js to handle email delivery and implements
 * rate limiting and security checks.
 *
 * @note Handles NEXT_REDIRECT errors differently than standard Auth.js flow:
 * Instead of redirecting, returns a success message
 *
 * @securityNotes
 * - Uses built-in Resend email normalization
 */
export async function magicLinkAction(formData: FormData): Promise<MagicLinkActionResult> {
  try {
    // This is a example sending raw formData
    await signIn('resend', formData);
    return { success: messages.magicLink.success.SENT };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.cause?.err instanceof CustomMagicLinkError) {
        switch (error.cause.err.errorType) {
          case 'IpInvalid':
            return { error: messages.magicLink.errors.GENERIC_FAILED };
          case 'IpLimit':
            return { error: messages.magicLink.errors.IP_LIMIT };
          case 'TokenExists':
            return { error: messages.magicLink.errors.EMAIL_ALREADY_SENT };
          default:
            return { error: messages.magicLink.errors.GENERIC_CUSTOMMAGICLINKERROR };
        }
      }
      return { error: messages.magicLink.errors.GENERIC_AUTHERROR };
    }

    if (error instanceof Error && error.message?.includes('NEXT_REDIRECT')) {
      /*throw error;// This is necessary for the redirect to work*/
      // Not redirecting, returning a success instead
      return { success: messages.magicLink.success.SENT };
    }

    return { error: messages.generic.errors.UNEXPECTED_ERROR };
  }
}
