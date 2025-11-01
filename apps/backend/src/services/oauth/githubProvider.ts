import { BaseOAuthProvider, OAuthConfig, OAuthTokens } from './baseOAuthProvider';
import axios from 'axios';

export class GitHubOAuthProvider extends BaseOAuthProvider {
  constructor() {
    const config: OAuthConfig = {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: `${process.env.FRONTEND_URL}/integrations/github/callback`,
      scope: [
        'repo',
        'user',
        'workflow',
      ],
      authorizationUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
    };

    super('github', config);
  }

  /**
   * Override token exchange for GitHub (uses different format)
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post(
        this.config.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope,
      };
    } catch (error: any) {
      console.error('GitHub token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Test GitHub connection
   */
  async testConnection(tokens: OAuthTokens): Promise<boolean> {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });

      return !!response.data.login;
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return false;
    }
  }

  /**
   * Get GitHub user info
   */
  async getUserInfo(tokens: OAuthTokens): Promise<any> {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });

      return {
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatarUrl: response.data.avatar_url,
        id: response.data.id,
      };
    } catch (error) {
      console.error('Failed to get GitHub user info:', error);
      throw error;
    }
  }

  /**
   * Create GitHub issue
   */
  async createIssue(
    tokens: OAuthTokens,
    owner: string,
    repo: string,
    title: string,
    body: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          title,
          body,
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('GitHub create issue error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const githubProvider = new GitHubOAuthProvider();

