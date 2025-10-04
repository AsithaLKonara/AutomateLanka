#!/usr/bin/env python3
"""
AI-Powered Workflow Recommendations - Intelligent workflow suggestions
"""

import json
import sqlite3
import os
import re
import random
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import math

class AIRecommendationEngine:
    """AI-powered workflow recommendation system"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.workflows_dir = Path("workflows")
        self.recommendations_dir = Path("recommendations")
        self.static_dir = Path("static")
        self.recommendations_dir.mkdir(exist_ok=True)
        self.static_dir.mkdir(exist_ok=True)
        
        # Initialize recommendation database
        self.init_recommendation_database()
        
        # Load workflow data
        self.workflows_data = self.load_workflows_data()
        
        # Initialize recommendation models
        self.similarity_weights = {
            'integrations': 0.4,
            'trigger_type': 0.3,
            'complexity': 0.2,
            'node_count': 0.1
        }
    
    def init_recommendation_database(self):
        """Initialize recommendation database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # User preferences table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                preferred_categories TEXT,
                preferred_integrations TEXT,
                preferred_complexity TEXT,
                preferred_trigger_types TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User interactions table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                workflow_filename TEXT NOT NULL,
                interaction_type TEXT NOT NULL,
                rating INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            )
        """)
        
        # Workflow similarity matrix
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflow_similarity (
                workflow1 TEXT NOT NULL,
                workflow2 TEXT NOT NULL,
                similarity_score REAL NOT NULL,
                similarity_factors TEXT,
                PRIMARY KEY (workflow1, workflow2)
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_interactions_workflow ON user_interactions(workflow_filename)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_similarity_workflow1 ON workflow_similarity(workflow1)")
        
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
            """)
            
            for row in cursor.fetchall():
                workflow = dict(row)
                workflow['integrations'] = json.loads(workflow['integrations'] or '[]')
                workflows_data[workflow['filename']] = workflow
            
            conn.close()
            
        except Exception as e:
            print(f"Error loading workflows data: {e}")
        
        return workflows_data
    
    def calculate_workflow_similarity(self, workflow1: str, workflow2: str) -> float:
        """Calculate similarity between two workflows"""
        if workflow1 not in self.workflows_data or workflow2 not in self.workflows_data:
            return 0.0
        
        w1 = self.workflows_data[workflow1]
        w2 = self.workflows_data[workflow2]
        
        similarity_score = 0.0
        
        # Integration similarity (Jaccard similarity)
        integrations1 = set(w1['integrations'])
        integrations2 = set(w2['integrations'])
        
        if integrations1 or integrations2:
            intersection = len(integrations1.intersection(integrations2))
            union = len(integrations1.union(integrations2))
            integration_similarity = intersection / union if union > 0 else 0
            similarity_score += integration_similarity * self.similarity_weights['integrations']
        
        # Trigger type similarity
        if w1['trigger_type'] == w2['trigger_type']:
            similarity_score += self.similarity_weights['trigger_type']
        
        # Complexity similarity
        if w1['complexity'] == w2['complexity']:
            similarity_score += self.similarity_weights['complexity']
        
        # Node count similarity (normalized)
        node_count_diff = abs(w1['node_count'] - w2['node_count'])
        max_nodes = max(w1['node_count'], w2['node_count'], 1)
        node_similarity = 1 - (node_count_diff / max_nodes)
        similarity_score += node_similarity * self.similarity_weights['node_count']
        
        return min(similarity_score, 1.0)
    
    def build_similarity_matrix(self):
        """Build similarity matrix for all workflows"""
        print("🔍 Building workflow similarity matrix...")
        
        workflows = list(self.workflows_data.keys())
        total_pairs = len(workflows) * (len(workflows) - 1) // 2
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Clear existing similarity data
            conn.execute("DELETE FROM workflow_similarity")
            
            processed = 0
            for i, workflow1 in enumerate(workflows):
                for j, workflow2 in enumerate(workflows[i+1:], i+1):
                    similarity = self.calculate_workflow_similarity(workflow1, workflow2)
                    
                    if similarity > 0.1:  # Only store meaningful similarities
                        conn.execute("""
                            INSERT INTO workflow_similarity 
                            (workflow1, workflow2, similarity_score, similarity_factors)
                            VALUES (?, ?, ?, ?)
                        """, (
                            workflow1, workflow2, similarity,
                            json.dumps({
                                'integrations': len(set(self.workflows_data[workflow1]['integrations']).intersection(
                                    set(self.workflows_data[workflow2]['integrations']))),
                                'trigger_type_match': self.workflows_data[workflow1]['trigger_type'] == self.workflows_data[workflow2]['trigger_type'],
                                'complexity_match': self.workflows_data[workflow1]['complexity'] == self.workflows_data[workflow2]['complexity']
                            })
                        ))
                    
                    processed += 1
                    if processed % 1000 == 0:
                        print(f"  Processed {processed}/{total_pairs} pairs...")
            
            conn.commit()
            print(f"✅ Similarity matrix built: {processed} pairs processed")
            
        except Exception as e:
            print(f"Error building similarity matrix: {e}")
        
        conn.close()
    
    def get_user_interactions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user interaction history"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        interactions = []
        
        try:
            cursor = conn.execute("""
                SELECT workflow_filename, interaction_type, rating, timestamp, metadata
                FROM user_interactions
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT 100
            """, (user_id,))
            
            interactions = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting user interactions: {e}")
        
        conn.close()
        return interactions
    
    def analyze_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Analyze user preferences based on interaction history"""
        interactions = self.get_user_interactions(user_id)
        
        preferences = {
            'preferred_categories': [],
            'preferred_integrations': [],
            'preferred_complexity': [],
            'preferred_trigger_types': [],
            'interaction_patterns': {}
        }
        
        # Analyze interactions
        for interaction in interactions:
            workflow_filename = interaction['workflow_filename']
            if workflow_filename in self.workflows_data:
                workflow = self.workflows_data[workflow_filename]
                
                # Track preferred integrations
                for integration in workflow['integrations']:
                    if integration not in preferences['preferred_integrations']:
                        preferences['preferred_integrations'].append(integration)
                
                # Track preferred complexity
                if workflow['complexity'] not in preferences['preferred_complexity']:
                    preferences['preferred_complexity'].append(workflow['complexity'])
                
                # Track preferred trigger types
                if workflow['trigger_type'] not in preferences['preferred_trigger_types']:
                    preferences['preferred_trigger_types'].append(workflow['trigger_type'])
                
                # Track interaction patterns
                interaction_type = interaction['interaction_type']
                if interaction_type not in preferences['interaction_patterns']:
                    preferences['interaction_patterns'][interaction_type] = 0
                preferences['interaction_patterns'][interaction_type] += 1
        
        return preferences
    
    def generate_content_based_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate content-based recommendations"""
        preferences = self.analyze_user_preferences(user_id)
        user_interactions = self.get_user_interactions(user_id)
        
        # Get workflows user has already interacted with
        interacted_workflows = {i['workflow_filename'] for i in user_interactions}
        
        recommendations = []
        
        for workflow_filename, workflow in self.workflows_data.items():
            if workflow_filename in interacted_workflows:
                continue
            
            score = 0.0
            reasons = []
            
            # Score based on preferred integrations
            for integration in workflow['integrations']:
                if integration in preferences['preferred_integrations']:
                    score += 0.3
                    reasons.append(f"Uses preferred integration: {integration}")
            
            # Score based on preferred complexity
            if workflow['complexity'] in preferences['preferred_complexity']:
                score += 0.2
                reasons.append(f"Matches preferred complexity: {workflow['complexity']}")
            
            # Score based on preferred trigger types
            if workflow['trigger_type'] in preferences['preferred_trigger_types']:
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
                    'type': 'content_based'
                })
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:limit]
    
    def generate_collaborative_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate collaborative filtering recommendations"""
        user_interactions = self.get_user_interactions(user_id)
        interacted_workflows = {i['workflow_filename'] for i in user_interactions}
        
        recommendations = []
        
        # Find similar workflows based on user's interaction history
        for interaction in user_interactions:
            workflow_filename = interaction['workflow_filename']
            
            # Get similar workflows
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            
            try:
                cursor = conn.execute("""
                    SELECT workflow2 as similar_workflow, similarity_score, similarity_factors
                    FROM workflow_similarity
                    WHERE workflow1 = ? AND similarity_score > 0.3
                    ORDER BY similarity_score DESC
                    LIMIT 5
                """, (workflow_filename,))
                
                for row in cursor.fetchall():
                    similar_workflow = row['similar_workflow']
                    similarity_score = row['similarity_score']
                    
                    if similar_workflow not in interacted_workflows:
                        # Check if already in recommendations
                        existing = next((r for r in recommendations if r['workflow_filename'] == similar_workflow), None)
                        
                        if existing:
                            existing['score'] += similarity_score * 0.5
                            existing['reasons'].append(f"Similar to {workflow_filename}")
                        else:
                            recommendations.append({
                                'workflow_filename': similar_workflow,
                                'workflow': self.workflows_data.get(similar_workflow, {}),
                                'score': similarity_score * 0.5,
                                'reasons': [f"Similar to {workflow_filename}"],
                                'type': 'collaborative'
                            })
                
            except Exception as e:
                print(f"Error getting similar workflows: {e}")
            
            conn.close()
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:limit]
    
    def generate_popularity_based_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Generate popularity-based recommendations"""
        user_interactions = self.get_user_interactions(user_id)
        interacted_workflows = {i['workflow_filename'] for i in user_interactions}
        
        # Get popular workflows from analytics
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        recommendations = []
        
        try:
            # Get popular workflows based on views and downloads
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
        """Generate hybrid recommendations combining multiple approaches"""
        # Get recommendations from different methods
        content_based = self.generate_content_based_recommendations(user_id, limit * 2)
        collaborative = self.generate_collaborative_recommendations(user_id, limit * 2)
        popularity_based = self.generate_popularity_based_recommendations(user_id, limit * 2)
        
        # Combine and score recommendations
        combined_recommendations = {}
        
        # Content-based recommendations (weight: 0.4)
        for rec in content_based:
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
        
        # Collaborative recommendations (weight: 0.3)
        for rec in collaborative:
            workflow_filename = rec['workflow_filename']
            if workflow_filename not in combined_recommendations:
                combined_recommendations[workflow_filename] = {
                    'workflow_filename': workflow_filename,
                    'workflow': rec['workflow'],
                    'score': 0.0,
                    'reasons': [],
                    'type': 'hybrid'
                }
            combined_recommendations[workflow_filename]['score'] += rec['score'] * 0.3
            combined_recommendations[workflow_filename]['reasons'].extend(rec['reasons'])
        
        # Popularity-based recommendations (weight: 0.3)
        for rec in popularity_based:
            workflow_filename = rec['workflow_filename']
            if workflow_filename not in combined_recommendations:
                combined_recommendations[workflow_filename] = {
                    'workflow_filename': workflow_filename,
                    'workflow': rec['workflow'],
                    'reasons': [],
                    'type': 'hybrid'
                }
            combined_recommendations[workflow_filename]['score'] += rec['score'] * 0.3
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
                    (user_id, workflow_filename, recommendation_score, recommendation_reason, recommendation_type, expires_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    rec['workflow_filename'],
                    rec['score'],
                    '; '.join(rec['reasons'][:3]),  # Limit reasons
                    rec['type'],
                    datetime.now().timestamp() + (7 * 24 * 60 * 60)  # Expire in 7 days
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
                WHERE user_id = ? AND expires_at > ?
                ORDER BY recommendation_score DESC
                LIMIT ?
            """, (user_id, datetime.now().timestamp(), limit))
            
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
    engine = AIRecommendationEngine()
    
    print("🤖 AI-POWERED RECOMMENDATION ENGINE")
    print("=" * 40)
    
    # Build similarity matrix
    print("🔍 Building workflow similarity matrix...")
    engine.build_similarity_matrix()
    
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
    print(f"✅ Similarity matrix built")
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
