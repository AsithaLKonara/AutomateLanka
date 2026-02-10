async function verifyHooks() {
    const { default: workflowExecutionService } = await import('../apps/backend/src/services/workflowExecutionService');
    const { WorkflowExecutor } = await import('../apps/backend/src/services/workflowExecutor');
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
        name: 'Parallel Test Workflow',
        nodes: [
            { name: 'Trigger', type: 'webhook', parameters: {} },
            { name: 'Branch1', type: 'set', parameters: { values: { x: 1 } } },
            { name: 'Branch2', type: 'set', parameters: { values: { y: 2 } } },
            { name: 'Join', type: 'set', parameters: { values: { z: 3 } } },
        ],
        connections: {
            Trigger: { main: [[{ node: 'Branch1' }, { node: 'Branch2' }]] },
            Branch1: { main: [[{ node: 'Join' }]] },
            Branch2: { main: [[{ node: 'Join' }]] },
        },
    };

    const executor = new WorkflowExecutor(mockWorkflow, 'test-workspace', 'test-run');

    try {
        await executor.execute();
        await workflowExecutionService.triggerWorkflowSuccess('test-run', { nodeExecutions: 4 });

        console.log('\n📊 Event Sequence Tracked:');
        console.log(events.join(' -> '));

        const expectedEvents = [
            'node_start_Trigger',
            'node_success_Trigger',
            'node_start_Branch1',
            'node_start_Branch2',
            'node_success_Branch1',
            'node_success_Branch2',
            'node_start_Join',
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
