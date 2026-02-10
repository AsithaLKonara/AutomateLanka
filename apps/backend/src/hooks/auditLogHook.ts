import { ExecutionHook } from '../services/workflowExecutionService';
import prisma from '../lib/prisma';

/**
 * AuditLogHook
 * Automatically persists workflow execution events to the AuditLog table
 */
export class AuditLogHook implements ExecutionHook {
    /**
     * Log when a workflow starts
     */
    async onWorkflowStart(runId: string, workflowId: string, workspaceId: string) {
        try {
            await prisma.auditLog.create({
                data: {
                    action: 'workflow_execute_start',
                    resource: 'workflow',
                    resourceId: workflowId,
                    workspaceId,
                    details: `Run ${runId} started`,
                },
            });
        } catch (error) {
            console.error('Failed to log workflow start to audit:', error);
        }
    }

    /**
     * Log when a workflow succeeds
     */
    async onWorkflowSuccess(runId: string, result: any) {
        try {
            // Find run to get workspaceId and workflowId
            const run = await prisma.run.findUnique({
                where: { id: runId },
                select: { workspaceId: true, workflowId: true },
            });

            if (!run) return;

            await prisma.auditLog.create({
                data: {
                    action: 'workflow_execute_success',
                    resource: 'workflow',
                    resourceId: run.workflowId,
                    workspaceId: run.workspaceId,
                    details: `Run ${runId} completed successfully. ${result.nodeExecutions || 0} nodes executed.`,
                },
            });
        } catch (error) {
            console.error('Failed to log workflow success to audit:', error);
        }
    }

    /**
     * Log when a workflow fails
     */
    async onWorkflowError(runId: string, error: any) {
        try {
            // Find run to get workspaceId and workflowId
            const run = await prisma.run.findUnique({
                where: { id: runId },
                select: { workspaceId: true, workflowId: true },
            });

            if (!run) return;

            await prisma.auditLog.create({
                data: {
                    action: 'workflow_execute_failure',
                    resource: 'workflow',
                    resourceId: run.workflowId,
                    workspaceId: run.workspaceId,
                    details: `Run ${runId} failed: ${error.message || error}`,
                },
            });
        } catch (error) {
            console.error('Failed to log workflow failure to audit:', error);
        }
    }

    /**
     * Log node errors for granular debugging
     */
    async onNodeError(runId: string, nodeName: string, error: any) {
        try {
            const run = await prisma.run.findUnique({
                where: { id: runId },
                select: { workspaceId: true, workflowId: true },
            });

            if (!run) return;

            await prisma.auditLog.create({
                data: {
                    action: 'workflow_node_failure',
                    resource: 'node',
                    resourceId: nodeName,
                    workspaceId: run.workspaceId,
                    details: `Run ${runId}, Node "${nodeName}" failed: ${error.message || error}`,
                },
            });
        } catch (error) {
            console.error('Failed to log node error to audit:', error);
        }
    }
}

export const auditLogHook = new AuditLogHook();
