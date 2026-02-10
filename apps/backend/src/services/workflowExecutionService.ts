/**
 * Workflow Execution Hooks Service
 * Manages lifecycle hooks for workflow and node executions
 */

export interface ExecutionHook {
    onWorkflowStart?(runId: string, workflowId: string, workspaceId: string): Promise<void> | void;
    onWorkflowSuccess?(runId: string, result: any): Promise<void> | void;
    onWorkflowError?(runId: string, error: any): Promise<void> | void;
    onNodeStart?(runId: string, nodeName: string, nodeType: string): Promise<void> | void;
    onNodeSuccess?(runId: string, nodeName: string, result: any): Promise<void> | void;
    onNodeError?(runId: string, nodeName: string, error: any): Promise<void> | void;
}

export class WorkflowExecutionService {
    private hooks: ExecutionHook[] = [];

    /**
     * Register a new execution hook
     */
    registerHook(hook: ExecutionHook): void {
        this.hooks.push(hook);
    }

    /**
     * Remove a registered hook
     */
    unregisterHook(hook: ExecutionHook): void {
        const index = this.hooks.indexOf(hook);
        if (index > -1) {
            this.hooks.splice(index, 1);
        }
    }

    // --- Trigger Methods ---

    async triggerWorkflowStart(runId: string, workflowId: string, workspaceId: string): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onWorkflowStart?.(runId, workflowId, workspaceId))
        );
    }

    async triggerWorkflowSuccess(runId: string, result: any): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onWorkflowSuccess?.(runId, result))
        );
    }

    async triggerWorkflowError(runId: string, error: any): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onWorkflowError?.(runId, error))
        );
    }

    async triggerNodeStart(runId: string, nodeName: string, nodeType: string): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onNodeStart?.(runId, nodeName, nodeType))
        );
    }

    async triggerNodeSuccess(runId: string, nodeName: string, result: any): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onNodeSuccess?.(runId, nodeName, result))
        );
    }

    async triggerNodeError(runId: string, nodeName: string, error: any): Promise<void> {
        await Promise.all(
            this.hooks.map((hook) => hook.onNodeError?.(runId, nodeName, error))
        );
    }
}

// Singleton instance
const workflowExecutionService = new WorkflowExecutionService();
export default workflowExecutionService;
