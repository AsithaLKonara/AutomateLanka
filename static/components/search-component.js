
class SearchComponent {
    constructor() {
        this.query = '';
        this.filters = {};
    }
    
    render() {
        return `
            <div class="search-container">
                <input type="text" 
                       class="search-input" 
                       placeholder="Search workflows..."
                       value="${this.query}"
                       oninput="handleSearch(this.value)">
                <div class="filter-chips">
                    <button class="filter-chip ${this.filters.category === 'all' ? 'active' : ''}" 
                            onclick="setFilter('category', 'all')">All</button>
                    <button class="filter-chip ${this.filters.category === 'active' ? 'active' : ''}" 
                            onclick="setFilter('category', 'active')">Active</button>
                    <button class="filter-chip ${this.filters.trigger === 'webhook' ? 'active' : ''}" 
                            onclick="setFilter('trigger', 'webhook')">Webhook</button>
                    <button class="filter-chip ${this.filters.trigger === 'scheduled' ? 'active' : ''}" 
                            onclick="setFilter('trigger', 'scheduled')">Scheduled</button>
                    <button class="filter-chip ${this.filters.trigger === 'manual' ? 'active' : ''}" 
                            onclick="setFilter('trigger', 'manual')">Manual</button>
                </div>
            </div>
        `;
    }
}
        