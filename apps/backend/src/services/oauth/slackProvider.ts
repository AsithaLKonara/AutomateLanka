import { BaseOAuthProvider, OAuthConfig, OAuthTokens } from './baseOAuthProvider';
import axios from 'axios';

export class SlackOAuthProvider extends BaseOAuthProvider {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      redirectUri: `${process.env.FRONTEND_URL}/integrations/slack/callback`,
      scope: [
        'chat:write',
        'channels:read',
        'users:read',
        'files:write',
        'im:write',
      ],
      authorizationUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
    };

    super('slack', config);
  }

  /**
   * Test Slack connection
   */
  async testConnection(tokens: OAuthTokens): Promise<boolean> {
    try {
      const response = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      return response.data.ok === true;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }

  /**
   * Get Slack user/workspace info
   */
  async getUserInfo(tokens: OAuthTokens): Promise<any> {
    try {
      const response = await axios.get('https://slack.com/api/auth.test', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      return {
        teamId: response.data.team_id,
        teamName: response.data.team,
        userId: response.data.user_id,
        userName: response.data.user,
      };
    } catch (error) {
      console.error('Failed to get Slack user info:', error);
      throw error;
    }
  }

  /**
   * Send Slack message
   */
  async sendMessage(
    tokens: OAuthTokens,
    channel: string,
    text: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to send message');
      }

      return response.data;
    } catch (error: any) {
      console.error('Slack send message error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const slackProvider = new SlackOAuthProvider();

