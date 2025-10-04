
class WorkflowCard {
    constructor(workflow) {
        this.workflow = workflow;
    }
    
    render() {
        return `
            <div class="workflow-card" data-filename="${this.workflow.filename}">
                <div class="workflow-header">
                    <h3 class="workflow-title">${this.workflow.name}</h3>
                    ${this.workflow.active ? '<span class="active-badge">Active</span>' : ''}
                </div>
                <p class="workflow-description">${this.workflow.description || 'No description'}</p>
                <div class="workflow-meta">
                    <span class="trigger-type">${this.workflow.trigger_type}</span>
                    <span class="complexity">${this.workflow.complexity}</span>
                    <span class="node-count">${this.workflow.node_count} nodes</span>
                </div>
                <div class="workflow-actions">
                    <button class="btn-primary" onclick="viewWorkflow('${this.workflow.filename}')">View</button>
                    <button class="btn-secondary" onclick="downloadWorkflow('${this.workflow.filename}')">Download</button>
                </div>
            </div>
        `;
    }
}
        