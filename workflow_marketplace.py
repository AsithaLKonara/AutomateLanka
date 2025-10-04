#!/usr/bin/env python3
"""
Workflow Marketplace - Create marketplace features for workflow sharing and monetization
"""

import json
import sqlite3
import os
import random
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

class WorkflowMarketplace:
    """Workflow marketplace for sharing and monetizing workflows"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.workflows_dir = Path("workflows")
        self.static_dir = Path("static")
        self.marketplace_dir = Path("marketplace")
        self.static_dir.mkdir(exist_ok=True)
        self.marketplace_dir.mkdir(exist_ok=True)
        
        # Initialize marketplace database
        self.init_marketplace_database()
        
        # Load workflow data
        self.workflows_data = self.load_workflows_data()
    
    def init_marketplace_database(self):
        """Initialize marketplace database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # Marketplace listings table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_filename TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL DEFAULT 0.0,
                currency TEXT DEFAULT 'USD',
                category TEXT NOT NULL,
                tags TEXT,
                author_id TEXT NOT NULL,
                author_name TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                featured BOOLEAN DEFAULT FALSE,
                download_count INTEGER DEFAULT 0,
                rating_average REAL DEFAULT 0.0,
                rating_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Marketplace purchases table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listing_id INTEGER NOT NULL,
                buyer_id TEXT NOT NULL,
                buyer_email TEXT,
                amount_paid REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                payment_method TEXT,
                transaction_id TEXT,
                status TEXT DEFAULT 'completed',
                purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES marketplace_listings (id)
            )
        """)
        
        # Marketplace reviews table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listing_id INTEGER NOT NULL,
                reviewer_id TEXT NOT NULL,
                reviewer_name TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                helpful_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES marketplace_listings (id)
            )
        """)
        
        # Marketplace categories table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS marketplace_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                parent_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES marketplace_categories (id)
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_category ON marketplace_listings(category)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_author ON marketplace_listings(author_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON marketplace_purchases(buyer_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_listing ON marketplace_reviews(listing_id)")
        
        conn.commit()
        conn.close()
    
    def load_workflows_data(self) -> Dict[str, Any]:
        """Load and process workflow data for marketplace"""
        workflows_data = {}
        
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            
            cursor = conn.execute("""
                SELECT filename, name, description, trigger_type, complexity, 
                       node_count, integrations, active
                FROM workflows
                LIMIT 200
            """)
            
            for row in cursor.fetchall():
                workflow = dict(row)
                workflow['integrations'] = json.loads(workflow['integrations'] or '[]')
                workflows_data[workflow['filename']] = workflow
            
            conn.close()
            
        except Exception as e:
            print(f"Error loading workflows data: {e}")
        
        return workflows_data
    
    def create_marketplace_categories(self):
        """Create marketplace categories"""
        categories = [
            {'name': 'Automation', 'description': 'Business process automation workflows', 'icon': '⚙️'},
            {'name': 'Data Processing', 'description': 'Data transformation and analysis workflows', 'icon': '📊'},
            {'name': 'Communication', 'description': 'Messaging and notification workflows', 'icon': '💬'},
            {'name': 'E-commerce', 'description': 'Online store and payment workflows', 'icon': '🛒'},
            {'name': 'Social Media', 'description': 'Social media management workflows', 'icon': '📱'},
            {'name': 'Project Management', 'description': 'Task and project tracking workflows', 'icon': '📋'},
            {'name': 'Marketing', 'description': 'Marketing automation and campaigns', 'icon': '📢'},
            {'name': 'Customer Support', 'description': 'Support ticket and help desk workflows', 'icon': '🎧'},
            {'name': 'Analytics', 'description': 'Reporting and analytics workflows', 'icon': '📈'},
            {'name': 'Security', 'description': 'Security monitoring and compliance workflows', 'icon': '🔒'}
        ]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            for category in categories:
                conn.execute("""
                    INSERT OR IGNORE INTO marketplace_categories (name, description, icon)
                    VALUES (?, ?, ?)
                """, (category['name'], category['description'], category['icon']))
            
            conn.commit()
            print("✅ Marketplace categories created")
            
        except Exception as e:
            print(f"Error creating categories: {e}")
        
        conn.close()
    
    def create_sample_listings(self):
        """Create sample marketplace listings"""
        sample_authors = [
            {'id': 'author_1', 'name': 'Alice Johnson', 'email': 'alice@example.com'},
            {'id': 'author_2', 'name': 'Bob Smith', 'email': 'bob@example.com'},
            {'id': 'author_3', 'name': 'Carol Davis', 'email': 'carol@example.com'},
            {'id': 'author_4', 'name': 'David Wilson', 'email': 'david@example.com'},
            {'id': 'author_5', 'name': 'Eva Brown', 'email': 'eva@example.com'}
        ]
        
        categories = ['Automation', 'Data Processing', 'Communication', 'E-commerce', 'Social Media']
        sample_workflows = list(self.workflows_data.keys())[:30]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            for i, workflow_filename in enumerate(sample_workflows):
                if workflow_filename in self.workflows_data:
                    workflow = self.workflows_data[workflow_filename]
                    author = random.choice(sample_authors)
                    category = random.choice(categories)
                    
                    # Determine pricing
                    if workflow['node_count'] > 20:
                        price = random.uniform(15.0, 50.0)
                    elif workflow['node_count'] > 10:
                        price = random.uniform(5.0, 25.0)
                    else:
                        price = random.uniform(0.0, 15.0)
                    
                    # Create listing
                    conn.execute("""
                        INSERT OR IGNORE INTO marketplace_listings 
                        (workflow_filename, title, description, price, category, tags, author_id, author_name, featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        workflow_filename,
                        workflow['name'],
                        workflow['description'] or f"Automated workflow for {workflow['trigger_type']} processing",
                        price,
                        category,
                        json.dumps(workflow['integrations'][:5]),  # Top 5 integrations as tags
                        author['id'],
                        author['name'],
                        random.choice([True, False])  # Random featured status
                    ))
            
            conn.commit()
            print("✅ Sample marketplace listings created")
            
        except Exception as e:
            print(f"Error creating sample listings: {e}")
        
        conn.close()
    
    def create_sample_reviews(self):
        """Create sample marketplace reviews"""
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Get listings
            cursor = conn.execute("SELECT id FROM marketplace_listings LIMIT 20")
            listing_ids = [row[0] for row in cursor.fetchall()]
            
            sample_reviewers = [
                {'id': 'reviewer_1', 'name': 'John Doe'},
                {'id': 'reviewer_2', 'name': 'Jane Smith'},
                {'id': 'reviewer_3', 'name': 'Mike Johnson'},
                {'id': 'reviewer_4', 'name': 'Sarah Wilson'},
                {'id': 'reviewer_5', 'name': 'Tom Brown'}
            ]
            
            review_templates = [
                "Great workflow! Saved me hours of manual work.",
                "Excellent automation solution. Highly recommended!",
                "Works perfectly for my use case. Easy to customize.",
                "Good workflow but could use better documentation.",
                "Amazing! This workflow transformed my business process.",
                "Very useful automation. Worth every penny.",
                "Solid workflow with good performance.",
                "Helped me automate a complex process. Thank you!",
                "Good quality workflow. Easy to implement.",
                "Fantastic automation solution. Will buy more from this author."
            ]
            
            for listing_id in listing_ids:
                # Create 2-5 reviews per listing
                num_reviews = random.randint(2, 5)
                
                for _ in range(num_reviews):
                    reviewer = random.choice(sample_reviewers)
                    rating = random.randint(3, 5)
                    review_text = random.choice(review_templates)
                    
                    conn.execute("""
                        INSERT INTO marketplace_reviews 
                        (listing_id, reviewer_id, reviewer_name, rating, review_text)
                        VALUES (?, ?, ?, ?, ?)
                    """, (listing_id, reviewer['id'], reviewer['name'], rating, review_text))
            
            # Update listing ratings
            conn.execute("""
                UPDATE marketplace_listings 
                SET rating_average = (
                    SELECT AVG(rating) FROM marketplace_reviews 
                    WHERE listing_id = marketplace_listings.id
                ),
                rating_count = (
                    SELECT COUNT(*) FROM marketplace_reviews 
                    WHERE listing_id = marketplace_listings.id
                )
            """)
            
            conn.commit()
            print("✅ Sample marketplace reviews created")
            
        except Exception as e:
            print(f"Error creating sample reviews: {e}")
        
        conn.close()
    
    def get_marketplace_stats(self) -> Dict[str, Any]:
        """Get marketplace statistics"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        stats = {
            'total_listings': 0,
            'total_categories': 0,
            'total_reviews': 0,
            'total_purchases': 0,
            'total_revenue': 0.0,
            'average_rating': 0.0,
            'featured_listings': 0
        }
        
        try:
            # Total listings
            cursor = conn.execute("SELECT COUNT(*) as count FROM marketplace_listings WHERE status = 'active'")
            total_listings = cursor.fetchone()
            if total_listings:
                stats['total_listings'] = total_listings['count']
            
            # Total categories
            cursor = conn.execute("SELECT COUNT(*) as count FROM marketplace_categories")
            total_categories = cursor.fetchone()
            if total_categories:
                stats['total_categories'] = total_categories['count']
            
            # Total reviews
            cursor = conn.execute("SELECT COUNT(*) as count FROM marketplace_reviews")
            total_reviews = cursor.fetchone()
            if total_reviews:
                stats['total_reviews'] = total_reviews['count']
            
            # Total purchases and revenue
            cursor = conn.execute("SELECT COUNT(*) as count, SUM(amount_paid) as revenue FROM marketplace_purchases WHERE status = 'completed'")
            purchase_data = cursor.fetchone()
            if purchase_data:
                stats['total_purchases'] = purchase_data['count']
                stats['total_revenue'] = purchase_data['revenue'] or 0.0
            
            # Average rating
            cursor = conn.execute("SELECT AVG(rating_average) as avg_rating FROM marketplace_listings WHERE rating_count > 0")
            avg_rating = cursor.fetchone()
            if avg_rating and avg_rating['avg_rating']:
                stats['average_rating'] = round(avg_rating['avg_rating'], 2)
            
            # Featured listings
            cursor = conn.execute("SELECT COUNT(*) as count FROM marketplace_listings WHERE featured = TRUE AND status = 'active'")
            featured_listings = cursor.fetchone()
            if featured_listings:
                stats['featured_listings'] = featured_listings['count']
            
        except Exception as e:
            print(f"Error getting marketplace stats: {e}")
        
        conn.close()
        return stats
    
    def get_featured_listings(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get featured marketplace listings"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        listings = []
        
        try:
            cursor = conn.execute("""
                SELECT 
                    l.*,
                    c.name as category_name,
                    c.icon as category_icon
                FROM marketplace_listings l
                LEFT JOIN marketplace_categories c ON l.category = c.name
                WHERE l.featured = TRUE AND l.status = 'active'
                ORDER BY l.rating_average DESC, l.download_count DESC
                LIMIT ?
            """, (limit,))
            
            listings = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting featured listings: {e}")
        
        conn.close()
        return listings
    
    def get_category_listings(self, category: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get listings by category"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        listings = []
        
        try:
            cursor = conn.execute("""
                SELECT 
                    l.*,
                    c.name as category_name,
                    c.icon as category_icon
                FROM marketplace_listings l
                LEFT JOIN marketplace_categories c ON l.category = c.name
                WHERE l.category = ? AND l.status = 'active'
                ORDER BY l.rating_average DESC, l.download_count DESC
                LIMIT ?
            """, (category, limit))
            
            listings = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting category listings: {e}")
        
        conn.close()
        return listings
    
    def create_marketplace_dashboard(self) -> str:
        """Create marketplace dashboard"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N Workflow Marketplace</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .marketplace {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #1976d2, #1565c0);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            color: #666;
            font-size: 1rem;
        }
        
        .categories-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #333;
        }
        
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .category-card {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        
        .category-card:hover {
            border-color: #1976d2;
            transform: translateY(-2px);
        }
        
        .category-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .category-name {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .category-description {
            color: #666;
            font-size: 0.9rem;
        }
        
        .featured-section {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .listings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .listing-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .listing-card:hover {
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .listing-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .listing-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .listing-price {
            background: #4caf50;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .listing-description {
            color: #666;
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        
        .listing-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .listing-author {
            color: #666;
            font-size: 0.9rem;
        }
        
        .listing-rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .stars {
            color: #ffc107;
        }
        
        .listing-tags {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        
        .tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
        }
        
        .listing-actions {
            display: flex;
            gap: 8px;
        }
        
        .btn {
            background: #1976d2;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #1565c0;
        }
        
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #666;
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="marketplace">
        <div class="header">
            <h1>🛒 N8N Workflow Marketplace</h1>
            <p>Discover, purchase, and share powerful automation workflows</p>
        </div>
        
        <div class="stats-grid" id="stats-grid">
            <div class="loading">Loading marketplace statistics...</div>
        </div>
        
        <div class="categories-section">
            <div class="section-title">📂 Browse Categories</div>
            <div class="categories-grid" id="categories-grid">
                <div class="loading">Loading categories...</div>
            </div>
        </div>
        
        <div class="featured-section">
            <div class="section-title">⭐ Featured Workflows</div>
            <div class="listings-grid" id="featured-listings">
                <div class="loading">Loading featured listings...</div>
            </div>
        </div>
    </div>
    
    <script>
        // Load marketplace data
        async function loadMarketplaceData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/marketplace/stats');
                const stats = await statsResponse.json();
                renderStats(stats);
                
                // Load categories
                const categoriesResponse = await fetch('/api/marketplace/categories');
                const categories = await categoriesResponse.json();
                renderCategories(categories);
                
                // Load featured listings
                const featuredResponse = await fetch('/api/marketplace/featured');
                const featured = await featuredResponse.json();
                renderFeaturedListings(featured);
                
            } catch (error) {
                console.error('Error loading marketplace data:', error);
                document.getElementById('stats-grid').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <div>Failed to load marketplace data</div>
                    </div>
                `;
            }
        }
        
        // Render statistics
        function renderStats(stats) {
            const statsGrid = document.getElementById('stats-grid');
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${stats.total_listings}</div>
                    <div class="stat-label">Active Listings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_categories}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_reviews}</div>
                    <div class="stat-label">Reviews</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">$${stats.total_revenue.toFixed(2)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.average_rating}</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.featured_listings}</div>
                    <div class="stat-label">Featured</div>
                </div>
            `;
        }
        
        // Render categories
        function renderCategories(categories) {
            const categoriesGrid = document.getElementById('categories-grid');
            categoriesGrid.innerHTML = categories.map(category => `
                <div class="category-card" onclick="browseCategory('${category.name}')">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-description">${category.description}</div>
                </div>
            `).join('');
        }
        
        // Render featured listings
        function renderFeaturedListings(listings) {
            const featuredListings = document.getElementById('featured-listings');
            
            if (listings.length === 0) {
                featuredListings.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <div>No featured listings available</div>
                    </div>
                `;
                return;
            }
            
            featuredListings.innerHTML = listings.map(listing => `
                <div class="listing-card" onclick="viewListing(${listing.id})">
                    <div class="listing-header">
                        <div>
                            <div class="listing-title">${listing.title}</div>
                        </div>
                        <div class="listing-price">$${listing.price.toFixed(2)}</div>
                    </div>
                    
                    <div class="listing-description">
                        ${listing.description}
                    </div>
                    
                    <div class="listing-meta">
                        <div class="listing-author">by ${listing.author_name}</div>
                        <div class="listing-rating">
                            <span class="stars">${'★'.repeat(Math.floor(listing.rating_average))}</span>
                            <span>${listing.rating_average.toFixed(1)} (${listing.rating_count})</span>
                        </div>
                    </div>
                    
                    <div class="listing-tags">
                        ${JSON.parse(listing.tags || '[]').map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="listing-actions">
                        <button class="btn" onclick="event.stopPropagation(); purchaseListing(${listing.id})">Purchase</button>
                        <button class="btn-secondary" onclick="event.stopPropagation(); viewListing(${listing.id})">Preview</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Browse category
        function browseCategory(categoryName) {
            // Implement category browsing
            console.log('Browsing category:', categoryName);
        }
        
        // View listing
        function viewListing(listingId) {
            // Implement listing view
            console.log('Viewing listing:', listingId);
        }
        
        // Purchase listing
        function purchaseListing(listingId) {
            // Implement purchase flow
            console.log('Purchasing listing:', listingId);
        }
        
        // Initialize marketplace
        loadMarketplaceData();
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = self.static_dir / "marketplace_dashboard.html"
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def create_marketplace_api_endpoints(self) -> str:
        """Create marketplace API endpoints"""
        api_js = """
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
        """
        
        api_path = self.static_dir / "marketplace-api.js"
        with open(api_path, 'w', encoding='utf-8') as f:
            f.write(api_js)
        
        return str(api_path)
    
    def generate_marketplace_report(self) -> Dict[str, Any]:
        """Generate marketplace report"""
        stats = self.get_marketplace_stats()
        featured_listings = self.get_featured_listings(5)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'marketplace_stats': stats,
            'featured_listings': featured_listings,
            'insights': [],
            'recommendations': []
        }
        
        # Generate insights
        if stats['total_listings'] > 0:
            report['insights'].append(f"Marketplace has {stats['total_listings']} active listings")
        
        if stats['total_revenue'] > 0:
            report['insights'].append(f"Total revenue generated: ${stats['total_revenue']:.2f}")
        
        if stats['average_rating'] > 0:
            report['insights'].append(f"Average rating: {stats['average_rating']}")
        
        if stats['featured_listings'] > 0:
            report['insights'].append(f"{stats['featured_listings']} featured listings")
        
        # Generate recommendations
        if stats['total_listings'] < 50:
            report['recommendations'].append("Consider adding more listings to increase marketplace variety")
        
        if stats['average_rating'] < 4.0:
            report['recommendations'].append("Focus on improving workflow quality to increase ratings")
        
        if stats['total_revenue'] < 100:
            report['recommendations'].append("Implement marketing strategies to increase sales")
        
        return report

def main():
    """Main execution function"""
    marketplace = WorkflowMarketplace()
    
    print("🛒 WORKFLOW MARKETPLACE")
    print("=" * 30)
    
    # Create categories
    print("📂 Creating marketplace categories...")
    marketplace.create_marketplace_categories()
    
    # Create sample listings
    print("📦 Creating sample marketplace listings...")
    marketplace.create_sample_listings()
    
    # Create sample reviews
    print("⭐ Creating sample marketplace reviews...")
    marketplace.create_sample_reviews()
    
    # Create dashboard
    print("📊 Creating marketplace dashboard...")
    dashboard_path = marketplace.create_marketplace_dashboard()
    
    # Create API endpoints
    print("🔌 Creating marketplace API...")
    api_path = marketplace.create_marketplace_api_endpoints()
    
    # Generate report
    print("📋 Generating marketplace report...")
    report = marketplace.generate_marketplace_report()
    
    # Display summary
    print(f"\n📊 MARKETPLACE REPORT")
    print("=" * 25)
    stats = report['marketplace_stats']
    
    print(f"📦 Total Listings: {stats['total_listings']}")
    print(f"📂 Total Categories: {stats['total_categories']}")
    print(f"⭐ Total Reviews: {stats['total_reviews']}")
    print(f"💰 Total Revenue: ${stats['total_revenue']:.2f}")
    print(f"📊 Average Rating: {stats['average_rating']}")
    print(f"🌟 Featured Listings: {stats['featured_listings']}")
    
    print(f"\n💡 Insights:")
    for insight in report['insights']:
        print(f"  • {insight}")
    
    print(f"\n🎯 Recommendations:")
    for recommendation in report['recommendations']:
        print(f"  • {recommendation}")
    
    print(f"\n🎉 Workflow marketplace complete!")
    print(f"📊 Dashboard: {dashboard_path}")
    print(f"🔌 API: {api_path}")

if __name__ == "__main__":
    main()
