import prisma from '../lib/prisma';
import workflowQueue from '../config/queue';

class WebhookService {
    /**
     * Handle incoming webhook request
     */
    async handleWebhook(
        method: string,
        path: string,
        headers: any,
        body: any,
        query: any
    ) {
        // 1. Find workflows with Webhook trigger matching path and method
        // Note: This is an expensive operation if we scan all workflows.
        // Optimization: In production, we should have a separate 'webhooks' table or index.
        const activeWorkflows = await prisma.workflow.findMany({
            where: {
                active: true,
            },
            select: {
                id: true,
                workspaceId: true,
                json: true,
                name: true,
            },
        });

        const matchedWorkflows = [];

        for (const workflow of activeWorkflows) {
            const json = workflow.json as any;
            if (!json || !json.nodes) continue;

            for (const node of json.nodes) {
                if (node.type === 'n8n-nodes-base.webhook') {
                    const parameters = node.parameters || {};
                    const webhookPath = parameters.path;
                    const webhookMethod = parameters.httpMethod || 'GET'; // Default to GET if not specified

                    // strict match for now
                    if (
                        webhookPath === path &&
                        (webhookMethod === method || webhookMethod === 'ANY')
                    ) {
                        matchedWorkflows.push({
                            workflow,
                            nodeName: node.name,
                        });
                    }
                }
            }
        }

        if (matchedWorkflows.length === 0) {
            throw new Error(`No workflow found for webhook: ${method} ${path}`);
        }

        // 2. Trigger executions
        const results = await Promise.all(
            matchedWorkflows.map(async ({ workflow, nodeName }) => {
                // Create execution record
                const run = await prisma.run.create({
                    data: {
                        workflowId: workflow.id,
                        workspaceId: workflow.workspaceId,
                        triggerType: 'webhook',
                        status: 'queued',
                        inputData: JSON.stringify({
                            headers,
                            body,
                            query,
                            webhookPath: path,
                            webhookMethod: method,
                        }),
                    },
                });

                // Add to queue
                await workflowQueue.add({
                    runId: run.id,
                    triggerNodeName: nodeName, // Tell executor which node started it
                });

                return { runId: run.id, workflowName: workflow.name };
            })
        );

        return results;
    }
}

export const webhookService = new WebhookService();
