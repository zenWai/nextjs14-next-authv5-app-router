import { AuthError } from 'next-auth';

type CustomLoginErrorType =
  | 'InvalidFields'
  | 'WrongCredentials'
  | 'ConfirmationEmailAlreadySent'
  | 'ResendEmailError'
  | 'NewConfirmationEmailSent'
  | 'TwoFactorTokenNotExists'
  | 'TwoFactorCodeInvalid'
  | 'PasswordNeedUpdate';

export class CustomLoginAuthError extends Error {
  constructor(public type: CustomLoginErrorType) {
    super();
    this.name = 'CustomLoginAuthError';
  }
}

type CustomNewPasswordErrorType = 'InvalidToken' | 'InvalidFields' | 'TokenNotExist';

export class CustomNewPasswordError extends Error {
  constructor(public type: CustomNewPasswordErrorType) {
    super();
    this.name = 'CustomNewPasswordError';
  }
}

type CustomResetPasswordErrorType =
  | 'InvalidFields'
  | 'EmailNotFound'
  | 'NoPasswordToReset'
  | 'TokenStillValid'
  | 'ResendEmailError';

export class CustomResetPasswordError extends Error {
  constructor(public type: CustomResetPasswordErrorType) {
    super();
    this.name = 'CustomResetPasswordError';
  }
}

type CustomNewVerificationEmailErrorType =
  | 'InvalidToken'
  | 'TokenExpired'
  | 'EmailNotFound'
  | 'EmailAlreadyVerified'
  | 'ResendEmailError'
  | 'TokenExpiredSentNewEmail'
  | 'InvalidTokenOrVerified';

export class CustomNewVerificationEmailError extends Error {
  constructor(public type: CustomNewVerificationEmailErrorType) {
    super();
    this.name = 'CustomNewVerificationEmailError';
  }
}

type CustomSettingsErrorType =
  | 'Unauthorized'
  | 'InvalidFields'
  | 'IncorrectPassword'
  | 'SamePassword'
  | 'NoChangesToBeMade'
  | 'PasswordNeedUpdate';

export class CustomSettingsError extends Error {
  constructor(public type: CustomSettingsErrorType) {
    super();
    this.name = 'CustomSettingsError';
  }
}

type CustomRegisterCredentialsUserErrorType = 'InvalidFields' | 'IpValidation' | 'AccountLimit' | 'EmailExists';

export class CustomRegisterCredentialsUserError extends Error {
  constructor(public type: CustomRegisterCredentialsUserErrorType) {
    super();
    this.name = 'CustomRegisterCredentialsUserError';
  }
}

type CustomMagicLinkErrorType = 'IpLimit' | 'IpInvalid' | 'TokenExists' | 'InvalidEmail' | 'NoUserExists';

export class CustomMagicLinkError extends AuthError {
  constructor(public errorType: CustomMagicLinkErrorType) {
    super();
    this.name = 'CustomMagicLinkError';
  }
}
