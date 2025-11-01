import { BaseOAuthProvider, OAuthConfig, OAuthTokens } from './baseOAuthProvider';
import axios from 'axios';

export class MicrosoftOAuthProvider extends BaseOAuthProvider {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: `${process.env.FRONTEND_URL}/integrations/microsoft/callback`,
      scope: [
        'User.Read',
        'Mail.Send',
        'Calendars.ReadWrite',
        'Files.ReadWrite',
      ],
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    };

    super('microsoft', config);
  }

  /**
   * Test Microsoft connection
   */
  async testConnection(tokens: OAuthTokens): Promise<boolean> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      return !!response.data.mail;
    } catch (error) {
      console.error('Microsoft connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Microsoft user info
   */
  async getUserInfo(tokens: OAuthTokens): Promise<any> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      return {
        id: response.data.id,
        email: response.data.mail || response.data.userPrincipalName,
        displayName: response.data.displayName,
        givenName: response.data.givenName,
        surname: response.data.surname,
      };
    } catch (error) {
      console.error('Failed to get Microsoft user info:', error);
      throw error;
    }
  }

  /**
   * Send email via Microsoft Outlook
   */
  async sendEmail(
    tokens: OAuthTokens,
    to: string,
    subject: string,
    body: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject,
            body: {
              contentType: 'HTML',
              content: body,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to,
                },
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Microsoft send email error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const microsoftProvider = new MicrosoftOAuthProvider();

