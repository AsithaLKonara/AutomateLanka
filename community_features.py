#!/usr/bin/env python3
"""
Community Features Implementation - Rating and Review System
"""

import json
import os
import sqlite3
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

class CommunityFeatures:
    """Implement community features like ratings and reviews"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.workflows_dir = Path("workflows")
        self.community_dir = Path("community")
        self.community_dir.mkdir(exist_ok=True)
        
        self.init_community_database()
    
    def init_community_database(self):
        """Initialize community database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # Ratings table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflow_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_filename TEXT NOT NULL,
                user_id TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(workflow_filename, user_id)
            )
        """)
        
        # Reviews table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflow_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_filename TEXT NOT NULL,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                helpful_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Usage statistics table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflow_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_filename TEXT NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL, -- 'view', 'download', 'import', 'execute'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User profiles table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT,
                avatar_url TEXT,
                bio TEXT,
                join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_contributions INTEGER DEFAULT 0,
                reputation_score INTEGER DEFAULT 0
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ratings_workflow ON workflow_ratings(workflow_filename)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ratings_user ON workflow_ratings(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_workflow ON workflow_reviews(workflow_filename)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_reviews_user ON workflow_reviews(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_usage_workflow ON workflow_usage(workflow_filename)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_usage_user ON workflow_usage(user_id)")
        
        conn.commit()
        conn.close()
    
    def add_rating(self, workflow_filename: str, user_id: str, rating: int, review_text: str = None) -> bool:
        """Add or update a rating for a workflow"""
        if not (1 <= rating <= 5):
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            
            # Insert or update rating
            conn.execute("""
                INSERT OR REPLACE INTO workflow_ratings 
                (workflow_filename, user_id, rating, review_text, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (workflow_filename, user_id, rating, review_text))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error adding rating: {e}")
            return False
    
    def add_review(self, workflow_filename: str, user_id: str, title: str, content: str, rating: int) -> bool:
        """Add a review for a workflow"""
        if not (1 <= rating <= 5) or not title.strip() or not content.strip():
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            
            conn.execute("""
                INSERT INTO workflow_reviews 
                (workflow_filename, user_id, title, content, rating)
                VALUES (?, ?, ?, ?, ?)
            """, (workflow_filename, user_id, title, content, rating))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error adding review: {e}")
            return False
    
    def track_usage(self, workflow_filename: str, user_id: str, action: str) -> bool:
        """Track workflow usage"""
        valid_actions = ['view', 'download', 'import', 'execute']
        if action not in valid_actions:
            return False
        
        try:
            conn = sqlite3.connect(self.db_path)
            
            conn.execute("""
                INSERT INTO workflow_usage (workflow_filename, user_id, action)
                VALUES (?, ?, ?)
            """, (workflow_filename, user_id, action))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error tracking usage: {e}")
            return False
    
    def get_workflow_stats(self, workflow_filename: str) -> Dict[str, Any]:
        """Get comprehensive stats for a workflow"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        stats = {
            'workflow_filename': workflow_filename,
            'average_rating': 0,
            'total_ratings': 0,
            'total_reviews': 0,
            'usage_stats': {},
            'recent_reviews': [],
            'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }
        
        try:
            # Get rating statistics
            cursor = conn.execute("""
                SELECT 
                    AVG(rating) as avg_rating,
                    COUNT(*) as total_ratings,
                    rating,
                    COUNT(*) as count
                FROM workflow_ratings 
                WHERE workflow_filename = ?
                GROUP BY rating
            """, (workflow_filename,))
            
            ratings_data = cursor.fetchall()
            if ratings_data:
                total_ratings = sum(row['count'] for row in ratings_data)
                if total_ratings > 0:
                    avg_rating = sum(row['rating'] * row['count'] for row in ratings_data) / total_ratings
                    stats['average_rating'] = round(avg_rating, 2)
                    stats['total_ratings'] = total_ratings
                    
                    # Rating distribution
                    for row in ratings_data:
                        stats['rating_distribution'][row['rating']] = row['count']
            
            # Get review count
            cursor = conn.execute("""
                SELECT COUNT(*) as total_reviews
                FROM workflow_reviews 
                WHERE workflow_filename = ?
            """, (workflow_filename,))
            
            review_count = cursor.fetchone()
            if review_count:
                stats['total_reviews'] = review_count['total_reviews']
            
            # Get recent reviews
            cursor = conn.execute("""
                SELECT 
                    r.title,
                    r.content,
                    r.rating,
                    r.helpful_count,
                    r.created_at,
                    p.username
                FROM workflow_reviews r
                LEFT JOIN user_profiles p ON r.user_id = p.user_id
                WHERE r.workflow_filename = ?
                ORDER BY r.created_at DESC
                LIMIT 5
            """, (workflow_filename,))
            
            recent_reviews = cursor.fetchall()
            stats['recent_reviews'] = [dict(row) for row in recent_reviews]
            
            # Get usage statistics
            cursor = conn.execute("""
                SELECT 
                    action,
                    COUNT(*) as count
                FROM workflow_usage 
                WHERE workflow_filename = ?
                GROUP BY action
            """, (workflow_filename,))
            
            usage_data = cursor.fetchall()
            stats['usage_stats'] = {row['action']: row['count'] for row in usage_data}
            
        except Exception as e:
            print(f"Error getting workflow stats: {e}")
        
        conn.close()
        return stats
    
    def get_popular_workflows(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get most popular workflows based on usage and ratings"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        popular_workflows = []
        
        try:
            cursor = conn.execute("""
                SELECT 
                    w.filename,
                    w.name,
                    w.description,
                    w.active,
                    w.trigger_type,
                    w.complexity,
                    w.node_count,
                    COALESCE(AVG(r.rating), 0) as avg_rating,
                    COUNT(DISTINCT r.user_id) as total_ratings,
                    COUNT(DISTINCT u.id) as total_usage,
                    COUNT(DISTINCT rev.id) as total_reviews
                FROM workflows w
                LEFT JOIN workflow_ratings r ON w.filename = r.workflow_filename
                LEFT JOIN workflow_usage u ON w.filename = u.workflow_filename
                LEFT JOIN workflow_reviews rev ON w.filename = rev.workflow_filename
                GROUP BY w.filename
                HAVING total_usage > 0 OR total_ratings > 0
                ORDER BY 
                    (total_usage * 0.3 + total_ratings * 0.4 + total_reviews * 0.3) DESC,
                    avg_rating DESC
                LIMIT ?
            """, (limit,))
            
            popular_workflows = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting popular workflows: {e}")
        
        conn.close()
        return popular_workflows
    
    def get_user_contributions(self, user_id: str) -> Dict[str, Any]:
        """Get user contribution statistics"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        contributions = {
            'user_id': user_id,
            'total_ratings': 0,
            'total_reviews': 0,
            'total_usage': 0,
            'average_rating_given': 0,
            'reputation_score': 0
        }
        
        try:
            # Get rating statistics
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_ratings,
                    AVG(rating) as avg_rating
                FROM workflow_ratings 
                WHERE user_id = ?
            """, (user_id,))
            
            rating_data = cursor.fetchone()
            if rating_data:
                contributions['total_ratings'] = rating_data['total_ratings']
                contributions['average_rating_given'] = round(rating_data['avg_rating'] or 0, 2)
            
            # Get review count
            cursor = conn.execute("""
                SELECT COUNT(*) as total_reviews
                FROM workflow_reviews 
                WHERE user_id = ?
            """, (user_id,))
            
            review_data = cursor.fetchone()
            if review_data:
                contributions['total_reviews'] = review_data['total_reviews']
            
            # Get usage count
            cursor = conn.execute("""
                SELECT COUNT(*) as total_usage
                FROM workflow_usage 
                WHERE user_id = ?
            """, (user_id,))
            
            usage_data = cursor.fetchone()
            if usage_data:
                contributions['total_usage'] = usage_data['total_usage']
            
            # Calculate reputation score
            reputation = (
                contributions['total_ratings'] * 2 +
                contributions['total_reviews'] * 5 +
                contributions['total_usage'] * 1
            )
            contributions['reputation_score'] = reputation
            
        except Exception as e:
            print(f"Error getting user contributions: {e}")
        
        conn.close()
        return contributions
    
    def generate_community_report(self) -> Dict[str, Any]:
        """Generate comprehensive community report"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        report = {
            'total_workflows': 0,
            'total_ratings': 0,
            'total_reviews': 0,
            'total_users': 0,
            'average_rating': 0,
            'most_popular_workflows': [],
            'top_contributors': [],
            'rating_distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            'usage_statistics': {}
        }
        
        try:
            # Get total workflows
            cursor = conn.execute("SELECT COUNT(*) as count FROM workflows")
            total_workflows = cursor.fetchone()
            if total_workflows:
                report['total_workflows'] = total_workflows['count']
            
            # Get total ratings and average
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_ratings,
                    AVG(rating) as avg_rating
                FROM workflow_ratings
            """)
            
            rating_stats = cursor.fetchone()
            if rating_stats:
                report['total_ratings'] = rating_stats['total_ratings']
                report['average_rating'] = round(rating_stats['avg_rating'] or 0, 2)
            
            # Get total reviews
            cursor = conn.execute("SELECT COUNT(*) as count FROM workflow_reviews")
            total_reviews = cursor.fetchone()
            if total_reviews:
                report['total_reviews'] = total_reviews['count']
            
            # Get total users
            cursor = conn.execute("SELECT COUNT(DISTINCT user_id) as count FROM user_profiles")
            total_users = cursor.fetchone()
            if total_users:
                report['total_users'] = total_users['count']
            
            # Get rating distribution
            cursor = conn.execute("""
                SELECT rating, COUNT(*) as count
                FROM workflow_ratings
                GROUP BY rating
                ORDER BY rating
            """)
            
            rating_dist = cursor.fetchall()
            for row in rating_dist:
                report['rating_distribution'][row['rating']] = row['count']
            
            # Get most popular workflows
            report['most_popular_workflows'] = self.get_popular_workflows(10)
            
            # Get top contributors
            cursor = conn.execute("""
                SELECT 
                    user_id,
                    username,
                    total_contributions,
                    reputation_score
                FROM user_profiles
                ORDER BY reputation_score DESC
                LIMIT 10
            """)
            
            top_contributors = cursor.fetchall()
            report['top_contributors'] = [dict(row) for row in top_contributors]
            
            # Get usage statistics
            cursor = conn.execute("""
                SELECT 
                    action,
                    COUNT(*) as count
                FROM workflow_usage
                GROUP BY action
            """)
            
            usage_stats = cursor.fetchall()
            report['usage_statistics'] = {row['action']: row['count'] for row in usage_stats}
            
        except Exception as e:
            print(f"Error generating community report: {e}")
        
        conn.close()
        return report
    
    def create_community_dashboard(self) -> str:
        """Create community dashboard HTML"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N Workflows Community Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e3f2fd; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1976d2; }
        .metric-label { font-size: 14px; color: #666; }
        .rating-stars { color: #ffc107; }
        .popular-item { padding: 10px; border-bottom: 1px solid #eee; }
        .popular-item:last-child { border-bottom: none; }
        .contributor { display: flex; justify-content: space-between; align-items: center; padding: 10px; }
        .reputation { background: #4caf50; color: white; padding: 5px 10px; border-radius: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌟 N8N Workflows Community Dashboard</h1>
        
        <div class="card">
            <h2>📊 Community Statistics</h2>
            <div class="metric">
                <div class="metric-value" id="total-workflows">--</div>
                <div class="metric-label">Total Workflows</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="total-ratings">--</div>
                <div class="metric-label">Total Ratings</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="total-reviews">--</div>
                <div class="metric-label">Total Reviews</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="total-users">--</div>
                <div class="metric-label">Active Users</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="avg-rating">--</div>
                <div class="metric-label">Average Rating</div>
            </div>
        </div>
        
        <div class="card">
            <h2>⭐ Most Popular Workflows</h2>
            <div id="popular-workflows"></div>
        </div>
        
        <div class="card">
            <h2>🏆 Top Contributors</h2>
            <div id="top-contributors"></div>
        </div>
        
        <div class="card">
            <h2>📈 Rating Distribution</h2>
            <div id="rating-distribution"></div>
        </div>
        
        <div class="card">
            <h2>📊 Usage Statistics</h2>
            <div id="usage-stats"></div>
        </div>
    </div>
    
    <script>
        // Load community data
        fetch('/api/community/report')
            .then(response => response.json())
            .then(data => {
                // Update metrics
                document.getElementById('total-workflows').textContent = data.total_workflows || '0';
                document.getElementById('total-ratings').textContent = data.total_ratings || '0';
                document.getElementById('total-reviews').textContent = data.total_reviews || '0';
                document.getElementById('total-users').textContent = data.total_users || '0';
                document.getElementById('avg-rating').textContent = data.average_rating || '0.0';
                
                // Display popular workflows
                const popularWorkflows = document.getElementById('popular-workflows');
                if (data.most_popular_workflows) {
                    data.most_popular_workflows.forEach((workflow, index) => {
                        const div = document.createElement('div');
                        div.className = 'popular-item';
                        div.innerHTML = `
                            <strong>${index + 1}. ${workflow.name}</strong><br>
                            <small>Rating: ${workflow.avg_rating} ⭐ | Usage: ${workflow.total_usage} | Reviews: ${workflow.total_reviews}</small>
                        `;
                        popularWorkflows.appendChild(div);
                    });
                }
                
                // Display top contributors
                const topContributors = document.getElementById('top-contributors');
                if (data.top_contributors) {
                    data.top_contributors.forEach(contributor => {
                        const div = document.createElement('div');
                        div.className = 'contributor';
                        div.innerHTML = `
                            <span><strong>${contributor.username}</strong></span>
                            <span class="reputation">${contributor.reputation_score} points</span>
                        `;
                        topContributors.appendChild(div);
                    });
                }
                
                // Display rating distribution
                const ratingDist = document.getElementById('rating-distribution');
                if (data.rating_distribution) {
                    for (let rating = 5; rating >= 1; rating--) {
                        const count = data.rating_distribution[rating] || 0;
                        const div = document.createElement('div');
                        div.innerHTML = `${rating} ⭐: ${count} ratings`;
                        ratingDist.appendChild(div);
                    }
                }
                
                // Display usage statistics
                const usageStats = document.getElementById('usage-stats');
                if (data.usage_statistics) {
                    Object.entries(data.usage_statistics).forEach(([action, count]) => {
                        const div = document.createElement('div');
                        div.innerHTML = `<strong>${action}:</strong> ${count}`;
                        usageStats.appendChild(div);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading community data:', error);
            });
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = Path("static/community_dashboard.html")
        dashboard_path.parent.mkdir(exist_ok=True)
        
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def seed_sample_data(self):
        """Seed sample community data for demonstration"""
        sample_users = [
            {'user_id': 'user1', 'username': 'Alice Johnson', 'email': 'alice@example.com'},
            {'user_id': 'user2', 'username': 'Bob Smith', 'email': 'bob@example.com'},
            {'user_id': 'user3', 'username': 'Carol Davis', 'email': 'carol@example.com'},
            {'user_id': 'user4', 'username': 'David Wilson', 'email': 'david@example.com'},
            {'user_id': 'user5', 'username': 'Eva Brown', 'email': 'eva@example.com'}
        ]
        
        # Get some workflow filenames
        workflow_files = list(self.workflows_dir.rglob("*.json"))[:20]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Insert sample users
            for user in sample_users:
                conn.execute("""
                    INSERT OR IGNORE INTO user_profiles (user_id, username, email)
                    VALUES (?, ?, ?)
                """, (user['user_id'], user['username'], user['email']))
            
            # Add sample ratings and reviews
            import random
            
            for i, workflow_file in enumerate(workflow_files):
                filename = workflow_file.name
                user = sample_users[i % len(sample_users)]
                
                # Add rating
                rating = random.randint(3, 5)
                self.add_rating(filename, user['user_id'], rating, f"Great workflow for {filename.split('_')[1] if '_' in filename else 'automation'}")
                
                # Add review
                if random.random() > 0.5:  # 50% chance of review
                    title = f"Excellent {filename.split('_')[1] if '_' in filename else 'workflow'}"
                    content = f"This workflow is very helpful for automating {filename.split('_')[1] if '_' in filename else 'tasks'}. Highly recommended!"
                    self.add_review(filename, user['user_id'], title, content, rating)
                
                # Track usage
                actions = ['view', 'download', 'import']
                for action in random.sample(actions, random.randint(1, 3)):
                    self.track_usage(filename, user['user_id'], action)
            
            conn.commit()
            print("✅ Sample community data seeded successfully")
            
        except Exception as e:
            print(f"❌ Error seeding sample data: {e}")
        
        conn.close()

def main():
    """Main execution function"""
    community = CommunityFeatures()
    
    print("🌟 COMMUNITY FEATURES IMPLEMENTATION")
    print("=" * 40)
    
    # Seed sample data
    print("🌱 Seeding sample community data...")
    community.seed_sample_data()
    
    # Generate community report
    print("📊 Generating community report...")
    report = community.generate_community_report()
    
    # Create dashboard
    print("📈 Creating community dashboard...")
    dashboard_path = community.create_community_dashboard()
    
    # Display report
    print("\n📊 COMMUNITY REPORT")
    print("=" * 25)
    print(f"📈 Total Workflows: {report['total_workflows']}")
    print(f"⭐ Total Ratings: {report['total_ratings']}")
    print(f"📝 Total Reviews: {report['total_reviews']}")
    print(f"👥 Total Users: {report['total_users']}")
    print(f"📊 Average Rating: {report['average_rating']}")
    
    print(f"\n🏆 Top Contributors:")
    for i, contributor in enumerate(report['top_contributors'][:5], 1):
        print(f"  {i}. {contributor['username']} - {contributor['reputation_score']} points")
    
    print(f"\n⭐ Most Popular Workflows:")
    for i, workflow in enumerate(report['most_popular_workflows'][:5], 1):
        print(f"  {i}. {workflow['name']} - Rating: {workflow['avg_rating']}")
    
    print(f"\n📈 Rating Distribution:")
    for rating in range(5, 0, -1):
        count = report['rating_distribution'].get(rating, 0)
        print(f"  {rating} ⭐: {count} ratings")
    
    print(f"\n🎉 Community features implementation complete!")
    print(f"📊 Community dashboard: {dashboard_path}")

if __name__ == "__main__":
    main()
