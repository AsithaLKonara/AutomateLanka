#!/usr/bin/env python3
"""
AI-Powered Workflow Recommendations - Simplified Version
"""

import json
import sqlite3
import os
import random
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

class SimpleAIRecommendationEngine:
    """Simplified AI-powered workflow recommendation system"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.workflows_dir = Path("workflows")
        self.static_dir = Path("static")
        self.static_dir.mkdir(exist_ok=True)
        
        # Initialize recommendation database
        self.init_recommendation_database()
        
        # Load workflow data
        self.workflows_data = self.load_workflows_data()
    
    def init_recommendation_database(self):
        """Initialize recommendation database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # User interactions table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                workflow_filename TEXT NOT NULL,
                interaction_type TEXT NOT NULL,
                rating INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Recommendations table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                workflow_filename TEXT NOT NULL,
                recommendation_score REAL NOT NULL,
                recommendation_reason TEXT,
                recommendation_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id)")
        
        conn.commit()
        conn.close()
    
    def load_workflows_data(self) -> Dict[str, Any]:
        """Load and process workflow data for recommendations"""
        workflows_data = {}
        
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            
            cursor = conn.execute("""
                SELECT filename, name, description, trigger_type, complexity, 
                       node_count, integrations, active
                FROM workflows
                LIMIT 100
            """)
            
            for row in cursor.fetchall():
                workflow = dict(row)
                workflow['integrations'] = json.loads(workflow['integrations'] or '[]')
                workflows_data[workflow['filename']] = workflow
            
            conn.close()
            
        except Exception as e:
            print(f"Error loading workflows data: {e}")
        
        return workflows_data
    
    def get_user_interactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user interaction history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        interactions = []
        
        try:
            cursor = conn.execute("""
                SELECT workflow_filename, interaction_type, rating, timestamp
                FROM user_interactions
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT 20
            """, (user_id,))
            
            interactions = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting user interactions: {e}")
        
        conn.close()
        return interactions
    
    def generate_simple_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate simple recommendations based on user preferences"""
        user_interactions = self.get_user_interactions(user_id)
        interacted_workflows = {i['workflow_filename'] for i in user_interactions}
        
        recommendations = []
        
        # Get user's preferred integrations and complexity
        preferred_integrations = set()
        preferred_complexity = []
        preferred_triggers = []
        
        for interaction in user_interactions:
            workflow_filename = interaction['workflow_filename']
            if workflow_filename in self.workflows_data:
                workflow = self.workflows_data[workflow_filename]
                preferred_integrations.update(workflow['integrations'])
                if workflow['complexity'] not in preferred_complexity:
                    preferred_complexity.append(workflow['complexity'])
                if workflow['trigger_type'] not in preferred_triggers:
                    preferred_triggers.append(workflow['trigger_type'])
        
        # Generate recommendations
        for workflow_filename, workflow in self.workflows_data.items():
            if workflow_filename in interacted_workflows:
                continue
            
            score = 0.0
            reasons = []
            
            # Score based on preferred integrations
            integration_matches = len(set(workflow['integrations']).intersection(preferred_integrations))
            if integration_matches > 0:
                score += integration_matches * 0.3
                reasons.append(f"Uses {integration_matches} preferred integrations")
            
            # Score based on preferred complexity
            if workflow['complexity'] in preferred_complexity:
                score += 0.2
                reasons.append(f"Matches preferred complexity: {workflow['complexity']}")
            
            # Score based on preferred trigger types
            if workflow['trigger_type'] in preferred_triggers:
                score += 0.2
                reasons.append(f"Uses preferred trigger: {workflow['trigger_type']}")
            
            # Score based on workflow quality
            if workflow['active']:
                score += 0.1
                reasons.append("Active workflow")
            
            # Score based on node count (prefer moderate complexity)
            if 5 <= workflow['node_count'] <= 20:
                score += 0.1
                reasons.append("Optimal complexity")
            
            if score > 0:
                recommendations.append({
                    'workflow_filename': workflow_filename,
                    'workflow': workflow,
                    'score': score,
                    'reasons': reasons,
                    'type': 'preference_based'
                })
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:limit]
    
    def generate_popular_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate popularity-based recommendations"""
        user_interactions = self.get_user_interactions(user_id)
        interacted_workflows = {i['workflow_filename'] for i in user_interactions}
        
        recommendations = []
        
        # Get popular workflows from analytics
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        try:
            cursor = conn.execute("""
                SELECT 
                    workflow_filename,
                    COUNT(*) as popularity_score
                FROM analytics_events
                WHERE event_type IN ('workflow_view', 'workflow_download')
                GROUP BY workflow_filename
                ORDER BY popularity_score DESC
                LIMIT 50
            """)
            
            for row in cursor.fetchall():
                workflow_filename = row['workflow_filename']
                popularity_score = row['popularity_score']
                
                if workflow_filename not in interacted_workflows and workflow_filename in self.workflows_data:
                    workflow = self.workflows_data[workflow_filename]
                    
                    # Normalize popularity score
                    normalized_score = min(popularity_score / 100.0, 1.0)
                    
                    recommendations.append({
                        'workflow_filename': workflow_filename,
                        'workflow': workflow,
                        'score': normalized_score,
                        'reasons': [f"Popular workflow ({popularity_score} interactions)"],
                        'type': 'popularity_based'
                    })
            
        except Exception as e:
            print(f"Error getting popular workflows: {e}")
        
        conn.close()
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:limit]
    
    def generate_hybrid_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate hybrid recommendations"""
        # Get recommendations from different methods
        preference_based = self.generate_simple_recommendations(user_id, limit * 2)
        popularity_based = self.generate_popular_recommendations(user_id, limit * 2)
        
        # Combine and score recommendations
        combined_recommendations = {}
        
        # Preference-based recommendations (weight: 0.6)
        for rec in preference_based:
            workflow_filename = rec['workflow_filename']
            if workflow_filename not in combined_recommendations:
                combined_recommendations[workflow_filename] = {
                    'workflow_filename': workflow_filename,
                    'workflow': rec['workflow'],
                    'score': 0.0,
                    'reasons': [],
                    'type': 'hybrid'
                }
            combined_recommendations[workflow_filename]['score'] += rec['score'] * 0.6
            combined_recommendations[workflow_filename]['reasons'].extend(rec['reasons'])
        
        # Popularity-based recommendations (weight: 0.4)
        for rec in popularity_based:
            workflow_filename = rec['workflow_filename']
            if workflow_filename not in combined_recommendations:
                combined_recommendations[workflow_filename] = {
                    'workflow_filename': workflow_filename,
                    'workflow': rec['workflow'],
                    'score': 0.0,
                    'reasons': [],
                    'type': 'hybrid'
                }
            combined_recommendations[workflow_filename]['score'] += rec['score'] * 0.4
            combined_recommendations[workflow_filename]['reasons'].extend(rec['reasons'])
        
        # Sort by score and return top recommendations
        recommendations = list(combined_recommendations.values())
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return recommendations[:limit]
    
    def save_recommendations(self, user_id: str, recommendations: List[Dict[str, Any]]):
        """Save recommendations to database"""
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Clear existing recommendations for user
            conn.execute("DELETE FROM recommendations WHERE user_id = ?", (user_id,))
            
            # Save new recommendations
            for rec in recommendations:
                conn.execute("""
                    INSERT INTO recommendations 
                    (user_id, workflow_filename, recommendation_score, recommendation_reason, recommendation_type)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    user_id,
                    rec['workflow_filename'],
                    rec['score'],
                    '; '.join(rec['reasons'][:3]),  # Limit reasons
                    rec['type']
                ))
            
            conn.commit()
            
        except Exception as e:
            print(f"Error saving recommendations: {e}")
        
        conn.close()
    
    def get_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recommendations for a user"""
        # Check for existing valid recommendations
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        existing_recommendations = []
        
        try:
            cursor = conn.execute("""
                SELECT workflow_filename, recommendation_score, recommendation_reason, recommendation_type
                FROM recommendations
                WHERE user_id = ?
                ORDER BY recommendation_score DESC
                LIMIT ?
            """, (user_id, limit))
            
            existing_recommendations = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting existing recommendations: {e}")
        
        conn.close()
        
        # If no valid recommendations exist, generate new ones
        if not existing_recommendations:
            recommendations = self.generate_hybrid_recommendations(user_id, limit)
            self.save_recommendations(user_id, recommendations)
            return recommendations
        
        # Return existing recommendations with workflow data
        result = []
        for rec in existing_recommendations:
            workflow_filename = rec['workflow_filename']
            if workflow_filename in self.workflows_data:
                result.append({
                    'workflow_filename': workflow_filename,
                    'workflow': self.workflows_data[workflow_filename],
                    'score': rec['recommendation_score'],
                    'reasons': rec['recommendation_reason'].split('; '),
                    'type': rec['recommendation_type']
                })
        
        return result
    
    def create_recommendation_dashboard(self) -> str:
        """Create recommendation dashboard"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-Powered Workflow Recommendations</title>
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
        
        .dashboard {
            max-width: 1200px;
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
        
        .user-input {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .input-group {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .input-group input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
        }
        
        .input-group input:focus {
            border-color: #1976d2;
        }
        
        .btn {
            background: #1976d2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #1565c0;
        }
        
        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
        }
        
        .recommendation-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        
        .recommendation-card:hover {
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .workflow-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .recommendation-score {
            background: #4caf50;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .workflow-description {
            color: #666;
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        
        .workflow-meta {
            display: flex;
            gap: 8px;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .meta-tag {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        
        .recommendation-reasons {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .reasons-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .reason-item {
            color: #666;
            font-size: 14px;
            margin-bottom: 0.25rem;
        }
        
        .card-actions {
            display: flex;
            gap: 8px;
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
        
        .recommendation-type {
            background: #ff9800;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🤖 AI-Powered Recommendations</h1>
            <p>Discover workflows tailored to your preferences and usage patterns</p>
        </div>
        
        <div class="user-input">
            <div class="input-group">
                <input type="text" id="user-id-input" placeholder="Enter user ID (e.g., user_123)" value="demo_user">
                <button class="btn" onclick="getRecommendations()">Get Recommendations</button>
            </div>
        </div>
        
        <div id="recommendations-container">
            <div class="empty-state">
                <div class="empty-state-icon">🤖</div>
                <div>Enter a user ID to get personalized workflow recommendations</div>
            </div>
        </div>
    </div>
    
    <script>
        async function getRecommendations() {
            const userId = document.getElementById('user-id-input').value.trim();
            
            if (!userId) {
                alert('Please enter a user ID');
                return;
            }
            
            const container = document.getElementById('recommendations-container');
            container.innerHTML = '<div class="loading">Loading recommendations...</div>';
            
            try {
                const response = await fetch(`/api/recommendations/${userId}`);
                const recommendations = await response.json();
                
                if (recommendations.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <div>No recommendations found for this user</div>
                            <div style="font-size: 14px; margin-top: 8px;">Try a different user ID or check back later</div>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = `
                    <div class="recommendations-grid">
                        ${recommendations.map(rec => `
                            <div class="recommendation-card">
                                <div class="card-header">
                                    <div>
                                        <div class="workflow-title">${rec.workflow.name}</div>
                                        <span class="recommendation-type">${rec.type}</span>
                                    </div>
                                    <div class="recommendation-score">${Math.round(rec.score * 100)}% match</div>
                                </div>
                                
                                <div class="workflow-description">
                                    ${rec.workflow.description || 'No description available'}
                                </div>
                                
                                <div class="workflow-meta">
                                    <span class="meta-tag">${rec.workflow.trigger_type}</span>
                                    <span class="meta-tag">${rec.workflow.complexity}</span>
                                    <span class="meta-tag">${rec.workflow.node_count} nodes</span>
                                    ${rec.workflow.active ? '<span class="meta-tag">Active</span>' : ''}
                                </div>
                                
                                <div class="recommendation-reasons">
                                    <div class="reasons-title">Why this recommendation?</div>
                                    ${rec.reasons.map(reason => `<div class="reason-item">• ${reason}</div>`).join('')}
                                </div>
                                
                                <div class="card-actions">
                                    <button class="btn" onclick="viewWorkflow('${rec.workflow_filename}')">View Workflow</button>
                                    <button class="btn-secondary" onclick="downloadWorkflow('${rec.workflow_filename}')">Download</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
            } catch (error) {
                console.error('Error getting recommendations:', error);
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <div>Failed to load recommendations</div>
                        <button onclick="getRecommendations()" style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px;">Retry</button>
                    </div>
                `;
            }
        }
        
        function viewWorkflow(filename) {
            window.open(`/api/workflows/${filename}`, '_blank');
        }
        
        function downloadWorkflow(filename) {
            window.open(`/api/workflows/${filename}/download`, '_blank');
        }
        
        // Load recommendations for demo user on page load
        window.addEventListener('load', () => {
            getRecommendations();
        });
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = self.static_dir / "recommendations_dashboard.html"
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def seed_sample_data(self):
        """Seed sample recommendation data"""
        sample_users = [f'demo_user_{i}' for i in range(1, 6)]
        sample_workflows = list(self.workflows_data.keys())[:20]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Generate sample user interactions
            for user_id in sample_users:
                # Generate 5-15 interactions per user
                num_interactions = random.randint(5, 15)
                
                for _ in range(num_interactions):
                    workflow_filename = random.choice(sample_workflows)
                    interaction_type = random.choice(['workflow_view', 'workflow_download', 'workflow_import'])
                    rating = random.randint(3, 5) if interaction_type == 'workflow_view' else None
                    
                    conn.execute("""
                        INSERT INTO user_interactions 
                        (user_id, workflow_filename, interaction_type, rating)
                        VALUES (?, ?, ?, ?)
                    """, (user_id, workflow_filename, interaction_type, rating))
            
            conn.commit()
            print("✅ Sample recommendation data seeded successfully")
            
        except Exception as e:
            print(f"❌ Error seeding sample recommendation data: {e}")
        
        conn.close()

def main():
    """Main execution function"""
    engine = SimpleAIRecommendationEngine()
    
    print("🤖 AI-POWERED RECOMMENDATION ENGINE (Simplified)")
    print("=" * 50)
    
    # Seed sample data
    print("🌱 Seeding sample recommendation data...")
    engine.seed_sample_data()
    
    # Create dashboard
    print("📊 Creating recommendation dashboard...")
    dashboard_path = engine.create_recommendation_dashboard()
    
    # Test recommendations
    print("🧪 Testing recommendation system...")
    test_user = "demo_user_1"
    recommendations = engine.get_recommendations(test_user, 5)
    
    print(f"\n📊 RECOMMENDATION SYSTEM REPORT")
    print("=" * 35)
    print(f"✅ Sample data seeded")
    print(f"✅ Recommendation dashboard created")
    print(f"✅ Test recommendations generated for {test_user}")
    
    print(f"\n🎯 Top Recommendations for {test_user}:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec['workflow']['name']}")
        print(f"     Score: {rec['score']:.2f} ({rec['type']})")
        print(f"     Reasons: {', '.join(rec['reasons'][:2])}")
        print()
    
    print(f"🎉 AI recommendation system complete!")
    print(f"📊 Dashboard: {dashboard_path}")

if __name__ == "__main__":
    main()
