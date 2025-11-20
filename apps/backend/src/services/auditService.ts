import prisma from '../lib/prisma';

export interface AuditLogData {
  userId?: string;
  workspaceId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Service
 * Logs sensitive actions for compliance and security
 */
class AuditService {
  /**
   * Create audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          workspaceId: data.workspaceId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Don't fail the request if audit logging fails
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log user authentication events
   */
  async logAuth(action: 'login' | 'logout' | 'register' | 'password_reset', userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: `auth:${action}`,
      resource: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log workspace events
   */
  async logWorkspace(action: 'create' | 'update' | 'delete' | 'invite_member' | 'remove_member', workspaceId: string, userId: string, details?: any): Promise<void> {
    await this.log({
      userId,
      workspaceId,
      action: `workspace:${action}`,
      resource: 'workspace',
      resourceId: workspaceId,
      details,
    });
  }

  /**
   * Log workflow events
   */
  async logWorkflow(action: 'create' | 'update' | 'delete' | 'execute' | 'clone', workflowId: string, workspaceId: string, userId: string, details?: any): Promise<void> {
    await this.log({
      userId,
      workspaceId,
      action: `workflow:${action}`,
      resource: 'workflow',
      resourceId: workflowId,
      details,
    });
  }

  /**
   * Log billing events
   */
  async logBilling(action: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'payment', workspaceId: string, userId: string, details?: any): Promise<void> {
    await this.log({
      userId,
      workspaceId,
      action: `billing:${action}`,
      resource: 'subscription',
      details,
    });
  }

  /**
   * Get audit logs for a workspace
   */
  async getWorkspaceLogs(workspaceId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get audit logs for a user
   */
  async getUserLogs(userId: string, limit: number = 100) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}

export const auditService = new AuditService();
export default auditService;

