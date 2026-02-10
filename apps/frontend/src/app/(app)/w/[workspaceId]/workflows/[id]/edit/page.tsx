'use client';

import { useParams } from 'next/navigation';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';

export default function EditWorkflowPage() {
    const params = useParams();
    const workflowId = params.id as string;
    const workspaceId = params.workspaceId as string;

    return (
        <main className="h-screen w-screen overflow-hidden">
            <WorkflowCanvas workflowId={workflowId} workspaceId={workspaceId} />
        </main>
    );
}
