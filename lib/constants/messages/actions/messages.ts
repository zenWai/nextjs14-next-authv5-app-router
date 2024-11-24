export const messages = {
  generic: {
    errors: {
      GENERIC_ERROR: 'Something went wrong!',
      DB_CONNECTION_ERROR: 'Unable to connect to the database. Please try again later.',
      INVALID_FIELDS: 'Invalid fields',
      UNEXPECTED_ERROR: 'An unexpected error occurred. Try again!',
      NASTY_WEIRD_ERROR: 'Something weird went wrong', // wtf just happened
      UNKNOWN_ERROR: 'Unknown Error. Try Again!',
    },
  },
  admin: {
    success: {
      ALLOWED_SA: 'Allowed Server Action!',
    },
    errors: {
      FORBIDDEN_SA: 'Forbidden Server Action!',
    },
  },
  register: {
    errors: {
      EMAIL_EXISTS: 'Email already registered!',
      ACCOUNT_LIMIT: 'You are not allowed to register more accounts on this app preview',
      IP_VALIDATION_FAILED: 'Sorry! Something went wrong. Could not identify you as a human',
    },
    success: {
      REGISTRATION_COMPLETE: 'Success! Check your inbox to verify your account',
      ACC_CREATED_EMAIL_SEND_FAILED: 'Account created but Failed to send your email for email verification.',
    },
  },
  new_verification_email: {
    success: {
      EMAIL_VERIFIED: 'Email verified successfully! You can now login',
    },
    errors: {
      EMAIL_NOT_FOUND: 'Error - try again',
      EMAIL_ALREADY_VERIFIED: 'Your email is already verified',
      INVALID_TOKEN: 'Error - Can not complete verification',
      TOKEN_EXPIRED_FAILED_SEND_EMAIL: 'Expired',
      TOKEN_EXPIRED_SENT_NEW: 'Expired - Check your inbox for a new link to confirm your email',
      INVALID_TOKEN_OR_VERIFIED: 'Invalid request or email already verified',
    },
  },
  reset_password: {
    success: {
      PASSWORD_RESET_EMAIL_SENT: 'Reset email sent!',
    },
    errors: {
      INVALID_EMAIL: 'Invalid email!',
      EMAIL_NOT_FOUND: 'Invalid email!',
      OAUTH_USER_ONLY: 'Email registered with a provider! Login with your Email Provider!',
      TOKEN_STILL_VALID: 'Reset password email already sent! Check your inbox!',
      SEND_EMAIL_ERROR: 'Error - Could not send you a email to reset your password',
    },
  },
  new_password: {
    success: {
      UPDATE_SUCCESSFUL: 'Password updated successfully',
    },
    errors: {
      REQUEST_NEW_PASSWORD_RESET: 'Expired! Please request a new Password Reset!',
      INVALID_PASSWORD: 'Invalid password format',
      INVALID_TOKEN: 'Error - Please request a new Password Reset!',
    },
  },
  login: {
    errors: {
      WRONG_CREDENTIALS: 'Invalid credentials',
      CONFIRMATION_EMAIL_ALREADY_SENT: 'Confirmation email already sent! Check your inbox!',
      NEW_CONFIRMATION_EMAIL_SENT: 'Sent new confirmation email! Check your inbox!',
      INVALID_FIELDS: 'Invalid fields!',
      RESEND_EMAIL_ERROR: 'Something went wrong while sending your email! Try again!',
      TWO_FACTOR_TOKEN_NOT_EXISTS: 'Two-factor authentication code required',
      TWO_FACTOR_CODE_INVALID: 'Invalid authentication code',
      GENERIC_ERROR: 'Something went wrong!',
      AUTH_ERROR: 'An authentication error occurred',
      ASK_USER_RESET_PASSWORD: 'You need to reset your password. Please use the password reset option.',
    },
    success: {
      LOGIN_COMPLETE: 'Successfully logged in',
    },
  },
  settings: {
    success: {
      SETTINGS_UPDATED: 'Settings updated!',
      VERIFICATION_EMAIL_SENT: 'Verification email sent!',
    },
    errors: {
      UNAUTHORIZED: 'Unauthorized!',
      INVALID_FIELDS: 'Invalid fields!',
      EMAIL_IN_USE: 'Email already in use!',
      VERIFICATION_EMAIL_ALREADY_SENT: 'Verification email already sent! Confirm your inbox!',
      EMAIL_CHANGE_REQUEST_EXISTS:
        'You have already requested to change your email! You need to wait 1hour to change again',
      INCORRECT_PASSWORD: 'Incorrect Password!',
      SAME_PASSWORD: 'Your new password is equal to your old password',
      NO_CHANGES_REQUIRED: 'No changes required! Your settings are already perfect? ☜(ˆ▽ˆ)',
      PASSWORD_NEEDS_UPDATE: 'You are currently in need of a password reset. Please proceed, and do a password reset.',
    },
  },
  magicLink: {
    errors: {
      IP_LIMIT: 'Too many attempts. Please try again later.',
      GENERIC_FAILED: 'Failed to send your link. Try again later!',
      GENERIC_AUTHERROR: 'Failed to send your link. Try again later!',
      GENERIC_CUSTOMMAGICLINKERROR: 'Failed to send your link. Try again later!',
      INVALID_EMAIL: 'Invalid email address!',
      INVALID_IP: 'Can not process more requests! Try again later!',
      EMAIL_ALREADY_SENT: 'Email already sent! Check your inbox!',
    },
    success: {
      SENT: 'Magic link sent! Click the link send to your email.',
    },
  },
} as const;
