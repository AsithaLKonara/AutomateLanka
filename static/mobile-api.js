
// Mobile API endpoints for N8N Workflows
const MobileAPI = {
    baseURL: '/api',
    
    // Get workflows with mobile optimization
    async getWorkflows(params = {}) {
        const defaultParams = {
            per_page: 50,
            page: 1,
            ...params
        };
        
        const queryString = new URLSearchParams(defaultParams).toString();
        const response = await fetch(`${this.baseURL}/workflows?${queryString}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Get workflow details
    async getWorkflow(filename) {
        const response = await fetch(`${this.baseURL}/workflows/${filename}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Download workflow
    async downloadWorkflow(filename) {
        const response = await fetch(`${this.baseURL}/workflows/${filename}/download`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.blob();
    },
    
    // Get workflow diagram
    async getWorkflowDiagram(filename) {
        const response = await fetch(`${this.baseURL}/workflows/${filename}/diagram`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Search workflows
    async searchWorkflows(query, filters = {}) {
        const params = {
            q: query,
            ...filters
        };
        
        return await this.getWorkflows(params);
    },
    
    // Get categories
    async getCategories() {
        const response = await fetch(`${this.baseURL}/categories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // Get stats
    async getStats() {
        const response = await fetch(`${this.baseURL}/stats`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
};

// Export for use in mobile app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileAPI;
} else if (typeof window !== 'undefined') {
    window.MobileAPI = MobileAPI;
}
        