import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
    private fromEmail = 'AutomateLanka <onboarding@resend.dev>'; // Default from Resend sandbox

    /**
     * Send verification email to new user
     */
    async sendVerificationEmail(email: string, name: string, token: string) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Verify your email - AutomateLanka',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #8b5cf6;">Welcome to AutomateLanka, ${name}!</h2>
            <p>Please verify your email address to get started with your automation workspace.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #8b5cf6; font-size: 14px;">${verificationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
            });
        } catch (error) {
            console.error('Error sending verification email:', error);
            // Don't throw - we don't want to break the registration flow if email fails
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Reset your password - AutomateLanka',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #8b5cf6;">Password Reset Request</h2>
            <p>You requested to reset your password for your AutomateLanka account.</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">AutomateLanka - The Automation Intelligence Hub</p>
          </div>
        `,
            });
        } catch (error) {
            console.error('Error sending password reset email:', error);
        }
    }

    /**
     * Send workspace invitation email
     */
    async sendInviteEmail(email: string, workspaceName: string, inviterName: string, inviteUrl: string) {
        try {
            await resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `You're invited to join ${workspaceName} on AutomateLanka`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #8b5cf6;">Workspace Invitation</h2>
            <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on AutomateLanka.</p>
            <div style="margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">AutomateLanka - The Automation Intelligence Hub</p>
          </div>
        `,
            });
        } catch (error) {
            console.error('Error sending invite email:', error);
        }
    }
}

export const emailService = new EmailService();
