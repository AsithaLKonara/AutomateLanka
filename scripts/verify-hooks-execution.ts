import workflowExecutionService, { ExecutionHook } from '../apps/backend/src/services/workflowExecutionService';
import { WorkflowExecutor } from '../apps/backend/src/services/workflowExecutor';

async function verifyHooks() {
    console.log('🧪 Starting Workflow Execution Hooks Verification...');

    const events: string[] = [];

    const testHook: ExecutionHook = {
        onWorkflowStart: (runId) => {
            console.log(`  [Hook] Workflow Start: ${runId}`);
            events.push('workflow_start');
        },
        onWorkflowSuccess: (runId) => {
            console.log(`  [Hook] Workflow Success: ${runId}`);
            events.push('workflow_success');
        },
        onNodeStart: (runId, nodeName) => {
            console.log(`  [Hook] Node Start: ${nodeName}`);
            events.push(`node_start_${nodeName}`);
        },
        onNodeSuccess: (runId, nodeName) => {
            console.log(`  [Hook] Node Success: ${nodeName}`);
            events.push(`node_success_${nodeName}`);
        },
    };

    // Register the test hook
    workflowExecutionService.registerHook(testHook);

    const mockWorkflow = {
        name: 'Test Workflow',
        nodes: [
            { name: 'Node1', type: 'set', parameters: { values: { x: 1 } } },
        ],
        connections: {},
    };

    const executor = new WorkflowExecutor(mockWorkflow, 'test-workspace', 'test-run');

    try {
        await executor.execute();
        await workflowExecutionService.triggerWorkflowSuccess('test-run', { nodeExecutions: 1 });

        console.log('\n📊 Event Sequence Tracked:');
        console.log(events.join(' -> '));

        const expectedEvents = [
            'node_start_Node1',
            'node_success_Node1',
            'workflow_success'
        ];

        const allMatched = expectedEvents.every(e => events.includes(e));

        if (allMatched) {
            console.log('\n✅ Verification PASSED: All hooks triggered in sequence.');
        } else {
            console.error('\n❌ Verification FAILED: Missing expected hook events.');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Verification FAILED with error:', error);
        process.exit(1);
    }
}

// Run verification
verifyHooks();
