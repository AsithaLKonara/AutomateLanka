
// Marketplace API endpoints
const MarketplaceAPI = {
    baseURL: '/api/marketplace',
    
    // Get marketplace statistics
    async getStats() {
        const response = await fetch(`${this.baseURL}/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get categories
    async getCategories() {
        const response = await fetch(`${this.baseURL}/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get featured listings
    async getFeaturedListings(limit = 10) {
        const response = await fetch(`${this.baseURL}/featured?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get listings by category
    async getCategoryListings(category, limit = 20) {
        const response = await fetch(`${this.baseURL}/category/${category}?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get listing details
    async getListingDetails(listingId) {
        const response = await fetch(`${this.baseURL}/listing/${listingId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Purchase listing
    async purchaseListing(listingId, paymentData) {
        const response = await fetch(`${this.baseURL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listingId,
                ...paymentData
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Get user purchases
    async getUserPurchases(userId) {
        const response = await fetch(`${this.baseURL}/purchases/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Create listing
    async createListing(listingData) {
        const response = await fetch(`${this.baseURL}/listings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listingData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Update listing
    async updateListing(listingId, listingData) {
        const response = await fetch(`${this.baseURL}/listings/${listingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listingData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },
    
    // Delete listing
    async deleteListing(listingId) {
        const response = await fetch(`${this.baseURL}/listings/${listingId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};

// Export for use in marketplace
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketplaceAPI;
} else if (typeof window !== 'undefined') {
    window.MarketplaceAPI = MarketplaceAPI;
}
        