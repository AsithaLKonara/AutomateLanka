import workflowQueue from '../config/queue';
import { WorkflowExecutor } from './workflowExecutor';
import { billingService } from './billingService';
import prisma from '../lib/prisma';
import workflowExecutionService from './workflowExecutionService';
import { auditLogHook } from '../hooks/auditLogHook';
import { checkpointHook } from '../hooks/checkpointHook';

export interface WorkflowJob {
  runId: string;
}

/**
 * Workflow Worker
 * Processes workflow execution jobs from the Bull queue
 */
export class WorkflowWorker {
  /**
   * Start the worker
   */
  static start() {
    console.log('🚀 Starting workflow worker...');

    // Register baseline hooks
    workflowExecutionService.registerHook(auditLogHook);
    workflowExecutionService.registerHook(checkpointHook);

    workflowQueue.process(async (job) => {
      const { runId } = job.data as WorkflowJob;

      console.log(`📋 Processing run: ${runId}`);

      try {
        // Update run status to 'running'
        await prisma.run.update({
          where: { id: runId },
          data: {
            status: 'running',
            startedAt: new Date(),
          },
        });

        // Fetch run details with workflow
        const run = await prisma.run.findUnique({
          where: { id: runId },
          include: {
            workflow: true,
            workspace: true,
          },
        });

        if (!run) {
          throw new Error(`Run ${runId} not found`);
        }

        console.log(`▶️  Executing workflow: ${run.workflow.name}`);

        // Trigger workflow start hook
        await workflowExecutionService.triggerWorkflowStart(
          runId,
          run.workflowId,
          run.workspaceId
        );

        // Create executor with initial state if resuming
        const initialOutputs = new Map<string, any>(
          Object.entries((run.outputData as any) || {})
        );

        const executor = new WorkflowExecutor(
          run.workflow.json,
          run.workspaceId,
          runId,
          initialOutputs,
          run.nodeExecutions || 0
        );

        // Execute workflow
        const result = await executor.execute(run.inputData);

        // Calculate duration
        const durationMs = Date.now() - (run.startedAt?.getTime() || Date.now());

        // Update run with results
        await prisma.run.update({
          where: { id: runId },
          data: {
            status: 'success',
            finishedAt: new Date(),
            durationMs,
            outputData: result.output,
            logs: result.logs.join('\n'),
            nodeExecutions: result.nodeExecutions,
          },
        });

        // Trigger workflow success hook
        await workflowExecutionService.triggerWorkflowSuccess(runId, result);

        // Increment usage
        await billingService.incrementUsage(
          run.workspaceId,
          'runs',
          1
        );
        await billingService.incrementUsage(
          run.workspaceId,
          'nodeExecutions',
          result.nodeExecutions
        );

        console.log(`✅ Run ${runId} completed successfully`);

        return { success: true, runId };
      } catch (error: any) {
        console.error(`❌ Run ${runId} failed (Attempt ${job.attemptsMade + 1}/${job.opts.attempts}):`, error);

        // Update run with error only if it's the last attempt
        if (job.attemptsMade + 1 >= (job.opts.attempts || 1)) {
          await prisma.run.update({
            where: { id: runId },
            data: {
              status: 'failed',
              finishedAt: new Date(),
              errorMessage: error.message,
              logs: error.stack || error.message,
            },
          });
        }

        // Trigger workflow error hook
        await workflowExecutionService.triggerWorkflowError(runId, error);

        throw error;
      }
    });

    console.log('✅ Workflow worker started and listening for jobs');
  }

  /**
   * Stop the worker gracefully
   */
  static async stop() {
    console.log('🛑 Stopping workflow worker...');
    await workflowQueue.close();
    await prisma.$disconnect();
    console.log('✅ Workflow worker stopped');
  }
}

// Auto-start worker if this file is run directly
if (require.main === module) {
  WorkflowWorker.start();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await WorkflowWorker.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await WorkflowWorker.stop();
    process.exit(0);
  });
}

