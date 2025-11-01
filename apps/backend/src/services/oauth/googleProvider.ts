import { BaseOAuthProvider, OAuthConfig, OAuthTokens } from './baseOAuthProvider';
import axios from 'axios';

export class GoogleOAuthProvider extends BaseOAuthProvider {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${process.env.FRONTEND_URL}/integrations/google/callback`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/drive.file',
      ],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
    };

    super('google', config);
  }

  /**
   * Test Google connection
   */
  async testConnection(tokens: OAuthTokens): Promise<boolean> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      return !!response.data.email;
    } catch (error) {
      console.error('Google connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Google user info
   */
  async getUserInfo(tokens: OAuthTokens): Promise<any> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      return {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        id: response.data.id,
      };
    } catch (error) {
      console.error('Failed to get Google user info:', error);
      throw error;
    }
  }

  /**
   * Send Gmail email
   */
  async sendEmail(
    tokens: OAuthTokens,
    to: string,
    subject: string,
    body: string
  ): Promise<any> {
    try {
      // Create email in RFC 2822 format
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body,
      ].join('\n');

      // Encode to base64
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          raw: encodedEmail,
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
      console.error('Gmail send error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create/update Google Sheets row
   */
  async updateSheet(
    tokens: OAuthTokens,
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<any> {
    try {
      const response = await axios.put(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
          values,
        },
        {
          params: {
            valueInputOption: 'USER_ENTERED',
          },
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Sheets update error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const googleProvider = new GoogleOAuthProvider();

