import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface CreateWorkflowInput {
  name: string;
  workspaceId: string;
  createdBy: string;
  json: any; // n8n workflow JSON
  filename?: string;
  active?: boolean;
  public?: boolean;
  tags?: string[];
  category?: string;
}

export interface UpdateWorkflowInput {
  name?: string;
  json?: any;
  active?: boolean;
  public?: boolean;
  tags?: string[];
  category?: string;
}

export interface SearchWorkflowsInput {
  workspaceId?: string;
  includePublic?: boolean;
  query?: string;
  category?: string;
  tags?: string[];
  active?: boolean;
  page?: number;
  limit?: number;
}

export class PrismaWorkflowService {
  /**
   * Create new workflow
   */
  async createWorkflow(input: CreateWorkflowInput) {
    // Analyze workflow JSON
    const analysis = this.analyzeWorkflowJson(input.json);

    const workflow = await prisma.workflow.create({
      data: {
        name: input.name,
        workspaceId: input.workspaceId,
        createdBy: input.createdBy,
        json: input.json,
        filename: input.filename || this.generateFilename(input.name),
        active: input.active || false,
        public: input.public || false,
        tags: input.tags || [],
        category: input.category || analysis.category,
        nodesCount: analysis.nodesCount,
        integrations: analysis.integrations,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create initial version
    await prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        version: 1,
        json: input.json,
        note: 'Initial version',
      },
    });

    return workflow;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string, userId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Check access: must be public OR user must have workspace access
    if (!workflow.public) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: workflow.workspaceId,
          },
        },
      });

      if (!membership || !membership.acceptedAt) {
        throw new Error('Access denied to this workflow');
      }
    }

    return workflow;
  }

  /**
   * List/Search workflows
   */
  async searchWorkflows(input: SearchWorkflowsInput) {
    const {
      workspaceId,
      includePublic = true,
      query,
      category,
      tags,
      active,
      page = 1,
      limit = 30,
    } = input;

    // Build where clause
    const where: any = {};

    // Workspace filter
    if (workspaceId) {
      if (includePublic) {
        where.OR = [
          { workspaceId },
          { public: true },
        ];
      } else {
        where.workspaceId = workspaceId;
      }
    } else if (includePublic) {
      where.public = true;
    }

    // Text search (name search for now, could use full-text search)
    if (query) {
      where.name = {
        contains: query,
        mode: 'insensitive',
      };
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = {
        hasEvery: tags,
      };
    }

    // Active filter
    if (typeof active === 'boolean') {
      where.active = active;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.workflow.count({ where }),
    ]);

    return {
      workflows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    userId: string,
    input: UpdateWorkflowInput,
    createVersion: boolean = false
  ) {
    // Verify access
    const workflow = await this.getWorkflow(workflowId, userId);

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: workflow.workspaceId,
        },
      },
    });

    if (!membership || !membership.acceptedAt) {
      throw new Error('Access denied to this workflow');
    }

    // Analyze new JSON if provided
    let analysis = null;
    if (input.json) {
      analysis = this.analyzeWorkflowJson(input.json);
    }

    // Update workflow
    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        ...input,
        ...(analysis && {
          nodesCount: analysis.nodesCount,
          integrations: analysis.integrations,
          category: input.category || analysis.category,
        }),
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create version if JSON changed and createVersion is true
    if (input.json && createVersion) {
      const latestVersion = await prisma.workflowVersion.findFirst({
        where: { workflowId },
        orderBy: { version: 'desc' },
      });

      await prisma.workflowVersion.create({
        data: {
          workflowId,
          version: (latestVersion?.version || 0) + 1,
          json: input.json,
          note: 'Updated',
        },
      });
    }

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, userId: string) {
    // Verify access
    const workflow = await this.getWorkflow(workflowId, userId);

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: workflow.workspaceId,
        },
      },
    });

    if (!membership || !membership.acceptedAt) {
      throw new Error('Access denied to this workflow');
    }

    // Only owner/admin can delete
    if (membership.role !== 'owner' && membership.role !== 'admin') {
      throw new Error('Only workspace owners/admins can delete workflows');
    }

    // Delete workflow (cascades to versions, runs)
    await prisma.workflow.delete({
      where: { id: workflowId },
    });

    return { success: true };
  }

  /**
   * Clone workflow (within or across workspaces)
   */
  async cloneWorkflow(
    workflowId: string,
    targetWorkspaceId: string,
    userId: string,
    newName?: string
  ) {
    // Get source workflow
    const sourceWorkflow = await this.getWorkflow(workflowId, userId);

    // Verify target workspace access
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: targetWorkspaceId,
        },
      },
    });

    if (!membership || !membership.acceptedAt) {
      throw new Error('Access denied to target workspace');
    }

    // Create clone
    const cloned = await this.createWorkflow({
      name: newName || `${sourceWorkflow.name} (Copy)`,
      workspaceId: targetWorkspaceId,
      createdBy: userId,
      json: sourceWorkflow.json,
      active: false, // Clone starts inactive
      public: false, // Clone is private by default
      tags: sourceWorkflow.tags,
      category: sourceWorkflow.category || undefined,
    });

    return cloned;
  }

  /**
   * Get workflow versions
   */
  async getWorkflowVersions(workflowId: string, userId: string) {
    // Verify access
    await this.getWorkflow(workflowId, userId);

    const versions = await prisma.workflowVersion.findMany({
      where: { workflowId },
      orderBy: { version: 'desc' },
    });

    return versions;
  }

  /**
   * Restore workflow version
   */
  async restoreVersion(workflowId: string, version: number, userId: string) {
    // Verify access
    const workflow = await this.getWorkflow(workflowId, userId);

    // Get version
    const versionRecord = await prisma.workflowVersion.findUnique({
      where: {
        workflowId_version: {
          workflowId,
          version,
        },
      },
    });

    if (!versionRecord) {
      throw new Error('Version not found');
    }

    // Update workflow with version JSON
    const updated = await this.updateWorkflow(
      workflowId,
      userId,
      { json: versionRecord.json },
      true // Create new version
    );

    return updated;
  }

  /**
   * Toggle workflow active status
   */
  async toggleActive(workflowId: string, userId: string) {
    const workflow = await this.getWorkflow(workflowId, userId);

    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { active: !workflow.active },
    });

    return updated;
  }

  /**
   * Import workflow from JSON file
   */
  async importWorkflow(
    workspaceId: string,
    userId: string,
    jsonData: any,
    name?: string
  ) {
    // Validate JSON structure (basic check)
    if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
      throw new Error('Invalid workflow JSON: missing nodes array');
    }

    // Create workflow
    const workflow = await this.createWorkflow({
      name: name || jsonData.name || 'Imported Workflow',
      workspaceId,
      createdBy: userId,
      json: jsonData,
      active: false,
      public: false,
    });

    return workflow;
  }

  /**
   * Helper: Analyze workflow JSON
   */
  private analyzeWorkflowJson(json: any) {
    const nodes = json.nodes || [];
    const nodesCount = nodes.length;

    // Extract integrations from node types
    const integrations = Array.from(
      new Set(
        nodes
          .map((node: any) => {
            const type = node.type || '';
            // Extract service name from node type (e.g., 'n8n-nodes-base.slack' -> 'slack')
            const match = type.match(/\.([^.]+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean)
      )
    ) as string[];

    // Determine category based on integrations
    let category = 'General';
    if (integrations.some((i) => ['slack', 'discord', 'telegram'].includes(i))) {
      category = 'Communication';
    } else if (integrations.some((i) => ['gmail', 'outlook', 'sendgrid'].includes(i))) {
      category = 'Email';
    } else if (integrations.some((i) => ['sheets', 'airtable', 'mysql', 'postgres'].includes(i))) {
      category = 'Data';
    } else if (integrations.some((i) => ['github', 'gitlab', 'jenkins'].includes(i))) {
      category = 'Development';
    }

    return {
      nodesCount,
      integrations,
      category,
    };
  }

  /**
   * Helper: Generate filename from name
   */
  private generateFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      + '.json';
  }
}

// Export singleton instance
export const prismaWorkflowService = new PrismaWorkflowService();

