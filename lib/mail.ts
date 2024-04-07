import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const htmlContent = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
    <h2>Secure Your Account</h2>
    <p>Your 2FA code is:</p>
    <p><strong>${token}</strong></p>
    <p>This code will expire in 1h. Please enter it promptly.</p>
  </div>`;

  await resend.emails.send({
    from: 'noreply@fpresa.org',
    to: email,
    subject: 'Next-auth Example || 2FA Code',
    html: htmlContent,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;
  const htmlContent = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
    <h2>Reset Your Password</h2>
    <p>Click the button below to reset your password:</p>
    <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 10px 20px; font-size: 16px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>Or manually visit: <a href="${resetLink}">${resetLink}</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
  </div>`;

  await resend.emails.send({
    from: 'noreply@fpresa.org',
    to: email,
    subject: 'Next-auth Example || Reset your password',
    html: htmlContent,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/new-verification?token=${token}`;
  const htmlContent = `
  <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #333;">
    <h2>Confirm Your Email Address</h2>
    <p>Click the button below to confirm your email address:</p>
    <p><a href="${confirmLink}" style="display: inline-block; background-color: #28a745; color: #ffffff; padding: 10px 20px; font-size: 16px; text-decoration: none; border-radius: 5px;">Confirm Email</a></p>
    <p>Or manually visit: <a href="${confirmLink}">${confirmLink}</a></p>
    <p>If you did not request this verification, please ignore this email.</p>
  </div>`;

  await resend.emails.send({
    from: 'noreply@fpresa.org',
    to: email,
    subject: 'Next-auth Example || Please confirm your email',
    html: htmlContent,
  });
};
