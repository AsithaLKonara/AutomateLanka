import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../../utils/encryption';

const prisma = new PrismaClient();

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authorizationUrl: string;
  tokenUrl: string;
}

/**
 * Base OAuth Provider
 * Abstract class for OAuth 2.0 integrations
 */
export abstract class BaseOAuthProvider {
  protected config: OAuthConfig;
  protected type: string;

  constructor(type: string, config: OAuthConfig) {
    this.type = type;
    this.config = config;
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      state,
      response_type: 'code',
      access_type: 'offline', // For refresh token
      prompt: 'consent',
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post(this.config.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      });

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        scope: data.scope,
      };
    } catch (error: any) {
      console.error('Token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await axios.post(this.config.tokenUrl, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const data = response.data;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Store integration in database
   */
  async saveIntegration(
    workspaceId: string,
    userId: string,
    tokens: OAuthTokens,
    name?: string
  ): Promise<any> {
    const credentialsJson = JSON.stringify(tokens);
    const encryptedCredentials = encrypt(credentialsJson);

    const integration = await prisma.integration.create({
      data: {
        workspaceId,
        type: this.type,
        name: name || `${this.type} Account`,
        encryptedCredentials,
        connectedBy: userId,
        metadata: {
          scope: tokens.scope,
        },
      },
    });

    return integration;
  }

  /**
   * Get integration credentials (decrypted)
   */
  async getCredentials(integrationId: string): Promise<OAuthTokens> {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const decrypted = decrypt(integration.encryptedCredentials);
    return JSON.parse(decrypted);
  }

  /**
   * Update integration credentials
   */
  async updateCredentials(integrationId: string, tokens: OAuthTokens): Promise<void> {
    const credentialsJson = JSON.stringify(tokens);
    const encryptedCredentials = encrypt(credentialsJson);

    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        encryptedCredentials,
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Test connection (to be implemented by each provider)
   */
  abstract testConnection(tokens: OAuthTokens): Promise<boolean>;

  /**
   * Get user info (to be implemented by each provider)
   */
  abstract getUserInfo(tokens: OAuthTokens): Promise<any>;
}

