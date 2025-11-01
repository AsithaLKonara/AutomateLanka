import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { slackProvider } from './oauth/slackProvider';
import { googleProvider } from './oauth/googleProvider';
import { githubProvider } from './oauth/githubProvider';
import { microsoftProvider } from './oauth/microsoftProvider';
import { BaseOAuthProvider } from './oauth/baseOAuthProvider';

const prisma = new PrismaClient();

// Map of integration types to providers
const providers: Record<string, BaseOAuthProvider> = {
  slack: slackProvider,
  google: googleProvider,
  github: githubProvider,
  microsoft: microsoftProvider,
};

export class IntegrationService {
  /**
   * Start OAuth flow - get authorization URL
   */
  async startOAuthFlow(
    type: string,
    workspaceId: string,
    userId: string
  ): Promise<{ authUrl: string; state: string }> {
    const provider = providers[type];
    
    if (!provider) {
      throw new Error(`Unsupported integration type: ${type}`);
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/cache (for simplicity, we'll include workspace in state)
    const stateData = {
      workspaceId,
      userId,
      type,
      timestamp: Date.now(),
    };

    // In production, store this in Redis with expiry
    const stateToken = `${state}:${Buffer.from(JSON.stringify(stateData)).toString('base64')}`;

    const authUrl = provider.getAuthorizationUrl(stateToken);

    return {
      authUrl,
      state: stateToken,
    };
  }

  /**
   * Complete OAuth flow - exchange code for tokens
   */
  async completeOAuthFlow(
    type: string,
    code: string,
    state: string
  ): Promise<any> {
    const provider = providers[type];
    
    if (!provider) {
      throw new Error(`Unsupported integration type: ${type}`);
    }

    // Parse state token
    const [stateHash, stateDataEncoded] = state.split(':');
    const stateData = JSON.parse(Buffer.from(stateDataEncoded, 'base64').toString());

    // Validate state (check timestamp - should be < 10 minutes old)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new Error('OAuth state expired. Please try again.');
    }

    // Exchange code for tokens
    const tokens = await provider.exchangeCodeForTokens(code);

    // Get user info from provider
    const userInfo = await provider.getUserInfo(tokens);

    // Save integration to database
    const integration = await provider.saveIntegration(
      stateData.workspaceId,
      stateData.userId,
      tokens,
      `${type} - ${userInfo.email || userInfo.name || userInfo.login || 'Account'}`
    );

    return {
      integration,
      userInfo,
    };
  }

  /**
   * List workspace integrations
   */
  async listIntegrations(workspaceId: string) {
    const integrations = await prisma.integration.findMany({
      where: { workspaceId },
      select: {
        id: true,
        type: true,
        name: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        lastUsedAt: true,
        connectedBy: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return integrations;
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string, workspaceId: string) {
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        workspaceId,
      },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    return integration;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string, workspaceId: string) {
    // Verify integration belongs to workspace
    await this.getIntegration(integrationId, workspaceId);

    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return { success: true };
  }

  /**
   * Test integration connection
   */
  async testIntegration(integrationId: string, workspaceId: string): Promise<boolean> {
    const integration = await this.getIntegration(integrationId, workspaceId);
    const provider = providers[integration.type];

    if (!provider) {
      throw new Error(`Provider not found for type: ${integration.type}`);
    }

    // Get credentials
    const tokens = await provider.getCredentials(integrationId);

    // Test connection
    const isValid = await provider.testConnection(tokens);

    // Update last used timestamp
    if (isValid) {
      await prisma.integration.update({
        where: { id: integrationId },
        data: { lastUsedAt: new Date() },
      });
    }

    return isValid;
  }

  /**
   * Get integration credentials (for workflow execution)
   */
  async getIntegrationForWorkflow(
    workspaceId: string,
    type: string
  ): Promise<any> {
    // Get the most recently used integration of this type
    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId,
        type,
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    if (!integration) {
      return null;
    }

    const provider = providers[type];
    if (!provider) {
      return null;
    }

    // Get and return decrypted credentials
    const tokens = await provider.getCredentials(integration.id);

    return {
      integration,
      tokens,
      provider,
    };
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();

