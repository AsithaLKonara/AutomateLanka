import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateWorkspaceInput {
  name: string;
  ownerId: string;
  planId?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  planId?: string;
}

export interface InviteMemberInput {
  workspaceId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
}

export class WorkspaceService {
  /**
   * Create new workspace
   */
  async createWorkspace(input: CreateWorkspaceInput) {
    // Generate unique slug
    const slug = this.generateSlug(input.name);

    // Get free plan if no plan specified
    let planId = input.planId;
    if (!planId) {
      const freePlan = await prisma.plan.findUnique({
        where: { slug: 'free' },
      });
      planId = freePlan?.id;
    }

    // Create workspace and membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: input.name,
          slug,
          ownerId: input.ownerId,
          planId,
        },
        include: {
          plan: true,
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Create owner membership
      await tx.membership.create({
        data: {
          userId: input.ownerId,
          workspaceId: workspace.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });

      return workspace;
    });

    return result;
  }

  /**
   * Get workspace by ID
   */
  async getWorkspace(workspaceId: string, userId: string) {
    // Verify user has access
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new Error('Access denied to this workspace');
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        plan: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            memberships: true,
            workflows: true,
            runs: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return {
      ...workspace,
      userRole: membership.role,
    };
  }

  /**
   * List user's workspaces
   */
  async listUserWorkspaces(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: {
        userId,
        acceptedAt: { not: null },
      },
      include: {
        workspace: {
          include: {
            plan: true,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                memberships: true,
                workflows: true,
              },
            },
          },
        },
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      userRole: m.role,
      joinedAt: m.acceptedAt,
    }));
  }

  /**
   * Update workspace
   */
  async updateWorkspace(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput
  ) {
    // Verify user is owner or admin
    const membership = await this.verifyAccess(workspaceId, userId, ['owner', 'admin']);

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: input,
      include: {
        plan: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return workspace;
  }

  /**
   * Delete workspace (owner only)
   */
  async deleteWorkspace(workspaceId: string, userId: string) {
    // Verify user is owner
    await this.verifyAccess(workspaceId, userId, ['owner']);

    // Delete workspace (cascades to memberships, workflows, etc.)
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true };
  }

  /**
   * Invite member to workspace
   */
  async inviteMember(input: InviteMemberInput) {
    // Verify inviter has permission
    await this.verifyAccess(input.workspaceId, input.invitedBy, ['owner', 'admin']);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new Error('User with this email does not exist');
    }

    // Check if already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: input.workspaceId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.acceptedAt) {
        throw new Error('User is already a member of this workspace');
      } else {
        throw new Error('User already has a pending invitation');
      }
    }

    // Check plan limits
    const workspace = await prisma.workspace.findUnique({
      where: { id: input.workspaceId },
      include: {
        plan: true,
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check member limit (-1 means unlimited)
    if (workspace.plan && workspace.plan.maxMembers !== -1) {
      if (workspace._count.memberships >= workspace.plan.maxMembers) {
        throw new Error(
          `Workspace has reached the maximum number of members (${workspace.plan.maxMembers}) for the ${workspace.plan.name} plan`
        );
      }
    }

    // Create membership invitation
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: input.workspaceId,
        role: input.role,
        invitedBy: input.invitedBy,
        // acceptedAt is null until user accepts
      },
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

    // In a real app, send invitation email here

    return membership;
  }

  /**
   * Accept workspace invitation
   */
  async acceptInvitation(workspaceId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new Error('Invitation not found');
    }

    if (membership.acceptedAt) {
      throw new Error('Invitation already accepted');
    }

    // Accept invitation
    const updated = await prisma.membership.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      data: {
        acceptedAt: new Date(),
      },
      include: {
        workspace: {
          include: {
            plan: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * List workspace members
   */
  async listMembers(workspaceId: string, userId: string) {
    // Verify user has access to workspace
    await this.verifyAccess(workspaceId, userId);

    const members = await prisma.membership.findMany({
      where: {
        workspaceId,
        acceptedAt: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastLoginAt: true,
          },
        },
      },
      orderBy: {
        acceptedAt: 'asc',
      },
    });

    return members.map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      joinedAt: m.acceptedAt,
      lastLoginAt: m.user.lastLoginAt,
    }));
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: string,
    requestingUserId: string
  ) {
    // Only owner can change roles
    await this.verifyAccess(workspaceId, requestingUserId, ['owner']);

    // Cannot change owner's role
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === targetUserId) {
      throw new Error('Cannot change role of workspace owner');
    }

    // Update role
    const updated = await prisma.membership.update({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
      data: { role: newRole },
    });

    return updated;
  }

  /**
   * Remove member from workspace
   */
  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requestingUserId: string
  ) {
    // Verify requester has permission
    const requesterMembership = await this.verifyAccess(
      workspaceId,
      requestingUserId,
      ['owner', 'admin']
    );

    // Cannot remove owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === targetUserId) {
      throw new Error('Cannot remove workspace owner');
    }

    // Admin can only remove members, not other admins (only owner can)
    if (requesterMembership.role === 'admin') {
      const targetMembership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUserId,
            workspaceId,
          },
        },
      });

      if (targetMembership?.role === 'admin' || targetMembership?.role === 'owner') {
        throw new Error('Admin cannot remove other admins or owners');
      }
    }

    // Remove member
    await prisma.membership.delete({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Transfer workspace ownership
   */
  async transferOwnership(
    workspaceId: string,
    newOwnerId: string,
    currentOwnerId: string
  ) {
    // Verify current user is owner
    await this.verifyAccess(workspaceId, currentOwnerId, ['owner']);

    // Verify new owner is a member
    const newOwnerMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: newOwnerId,
          workspaceId,
        },
      },
    });

    if (!newOwnerMembership || !newOwnerMembership.acceptedAt) {
      throw new Error('New owner must be an active member of the workspace');
    }

    // Transfer ownership in transaction
    await prisma.$transaction(async (tx) => {
      // Update workspace owner
      await tx.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerId },
      });

      // Update new owner's membership role
      await tx.membership.update({
        where: {
          userId_workspaceId: {
            userId: newOwnerId,
            workspaceId,
          },
        },
        data: { role: 'owner' },
      });

      // Downgrade previous owner to admin
      await tx.membership.update({
        where: {
          userId_workspaceId: {
            userId: currentOwnerId,
            workspaceId,
          },
        },
        data: { role: 'admin' },
      });
    });

    return { success: true };
  }

  /**
   * Leave workspace (user removes themselves)
   */
  async leaveWorkspace(workspaceId: string, userId: string) {
    // Check if user is owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (workspace?.ownerId === userId) {
      throw new Error(
        'Workspace owner cannot leave. Please transfer ownership first or delete the workspace.'
      );
    }

    // Remove membership
    await prisma.membership.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats(workspaceId: string, userId: string) {
    // Verify access
    await this.verifyAccess(workspaceId, userId);

    const [
      workflowCount,
      activeWorkflowCount,
      runCount,
      successRunCount,
      failedRunCount,
      memberCount,
      thisMonthRunCount,
    ] = await Promise.all([
      prisma.workflow.count({ where: { workspaceId } }),
      prisma.workflow.count({ where: { workspaceId, active: true } }),
      prisma.run.count({ where: { workspaceId } }),
      prisma.run.count({ where: { workspaceId, status: 'success' } }),
      prisma.run.count({ where: { workspaceId, status: 'failed' } }),
      prisma.membership.count({ where: { workspaceId, acceptedAt: { not: null } } }),
      prisma.run.count({
        where: {
          workspaceId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      workflows: {
        total: workflowCount,
        active: activeWorkflowCount,
        inactive: workflowCount - activeWorkflowCount,
      },
      runs: {
        total: runCount,
        success: successRunCount,
        failed: failedRunCount,
        successRate: runCount > 0 ? (successRunCount / runCount) * 100 : 0,
        thisMonth: thisMonthRunCount,
      },
      members: memberCount,
    };
  }

  /**
   * Helper: Verify user access to workspace
   */
  private async verifyAccess(
    workspaceId: string,
    userId: string,
    allowedRoles?: string[]
  ) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership || !membership.acceptedAt) {
      throw new Error('Access denied to this workspace');
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new Error(
        `This action requires one of these roles: ${allowedRoles.join(', ')}`
      );
    }

    return membership;
  }

  /**
   * Helper: Generate unique workspace slug
   */
  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);

    const random = crypto.randomBytes(3).toString('hex');
    return `${base}-${random}`;
  }
}

// Export singleton instance
export const workspaceService = new WorkspaceService();

