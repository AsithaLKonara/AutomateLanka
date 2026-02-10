import { ExecutionHook } from '../services/workflowExecutionService';
import prisma from '../lib/prisma';

/**
 * Checkpoint Hook
 * Persists intermediate node results to the database after each successful node execution.
 * This allows workflows to resume from the last successful node in case of a crash or retry.
 */
export class CheckpointHook implements ExecutionHook {
    async onNodeSuccess(runId: string, nodeName: string, result: any) {
        try {
            // Fetch current run results
            const run = await prisma.run.findUnique({
                where: { id: runId },
                select: { outputData: true }
            });

            // Update outputData with new node result
            const currentOutput = (run?.outputData as any) || {};
            currentOutput[nodeName] = result;

            await prisma.run.update({
                where: { id: runId },
                data: {
                    outputData: currentOutput,
                }
            });

            console.log(`📍 Checkpoint saved for node: ${nodeName} (Run: ${runId})`);
        } catch (error) {
            console.error(`❌ Failed to save checkpoint for node ${nodeName}:`, error);
        }
    }
}

export const checkpointHook = new CheckpointHook();
