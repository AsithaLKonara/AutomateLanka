#!/usr/bin/env python3
"""
Analytics Dashboard - Create comprehensive analytics and monitoring
"""

import json
import sqlite3
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

class AnalyticsDashboard:
    """Create comprehensive analytics dashboard"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.static_dir = Path("static")
        self.static_dir.mkdir(exist_ok=True)
        
        self.init_analytics_database()
    
    def init_analytics_database(self):
        """Initialize analytics database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # Analytics events table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                workflow_filename TEXT,
                user_id TEXT,
                session_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                ip_address TEXT,
                user_agent TEXT
            )
        """)
        
        # Performance metrics table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS performance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL NOT NULL,
                workflow_filename TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        """)
        
        # User sessions table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration INTEGER,
                page_views INTEGER DEFAULT 0,
                workflows_viewed INTEGER DEFAULT 0,
                workflows_downloaded INTEGER DEFAULT 0,
                ip_address TEXT,
                user_agent TEXT
            )
        """)
        
        # Workflow performance table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflow_performance (
                workflow_filename TEXT PRIMARY KEY,
                total_views INTEGER DEFAULT 0,
                total_downloads INTEGER DEFAULT 0,
                total_imports INTEGER DEFAULT 0,
                total_executions INTEGER DEFAULT 0,
                average_rating REAL DEFAULT 0,
                total_ratings INTEGER DEFAULT 0,
                last_viewed TIMESTAMP,
                last_downloaded TIMESTAMP,
                performance_score REAL DEFAULT 0
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_performance_metric ON performance_metrics(metric_name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)")
        
        conn.commit()
        conn.close()
    
    def track_event(self, event_type: str, workflow_filename: str = None, 
                   user_id: str = None, session_id: str = None, 
                   metadata: Dict = None, ip_address: str = None, 
                   user_agent: str = None) -> bool:
        """Track analytics event"""
        try:
            conn = sqlite3.connect(self.db_path)
            
            conn.execute("""
                INSERT INTO analytics_events 
                (event_type, workflow_filename, user_id, session_id, metadata, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                event_type, workflow_filename, user_id, session_id,
                json.dumps(metadata) if metadata else None,
                ip_address, user_agent
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error tracking event: {e}")
            return False
    
    def track_performance_metric(self, metric_name: str, metric_value: float,
                               workflow_filename: str = None, metadata: Dict = None) -> bool:
        """Track performance metric"""
        try:
            conn = sqlite3.connect(self.db_path)
            
            conn.execute("""
                INSERT INTO performance_metrics 
                (metric_name, metric_value, workflow_filename, metadata)
                VALUES (?, ?, ?, ?)
            """, (
                metric_name, metric_value, workflow_filename,
                json.dumps(metadata) if metadata else None
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error tracking performance metric: {e}")
            return False
    
    def get_analytics_summary(self, days: int = 30) -> Dict[str, Any]:
        """Get analytics summary for specified days"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        since_date = datetime.now() - timedelta(days=days)
        
        summary = {
            'period_days': days,
            'since_date': since_date.isoformat(),
            'total_events': 0,
            'unique_users': 0,
            'unique_sessions': 0,
            'total_page_views': 0,
            'total_downloads': 0,
            'top_workflows': [],
            'event_types': {},
            'daily_stats': [],
            'user_engagement': {},
            'performance_metrics': {}
        }
        
        try:
            # Total events
            cursor = conn.execute("""
                SELECT COUNT(*) as count
                FROM analytics_events
                WHERE timestamp >= ?
            """, (since_date,))
            
            total_events = cursor.fetchone()
            if total_events:
                summary['total_events'] = total_events['count']
            
            # Unique users and sessions
            cursor = conn.execute("""
                SELECT 
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT session_id) as unique_sessions
                FROM analytics_events
                WHERE timestamp >= ?
            """, (since_date,))
            
            user_stats = cursor.fetchone()
            if user_stats:
                summary['unique_users'] = user_stats['unique_users']
                summary['unique_sessions'] = user_stats['unique_sessions']
            
            # Event types breakdown
            cursor = conn.execute("""
                SELECT event_type, COUNT(*) as count
                FROM analytics_events
                WHERE timestamp >= ?
                GROUP BY event_type
                ORDER BY count DESC
            """, (since_date,))
            
            event_types = cursor.fetchall()
            summary['event_types'] = {row['event_type']: row['count'] for row in event_types}
            
            # Top workflows
            cursor = conn.execute("""
                SELECT 
                    workflow_filename,
                    COUNT(*) as views
                FROM analytics_events
                WHERE timestamp >= ? AND event_type = 'workflow_view'
                GROUP BY workflow_filename
                ORDER BY views DESC
                LIMIT 10
            """, (since_date,))
            
            top_workflows = cursor.fetchall()
            summary['top_workflows'] = [dict(row) for row in top_workflows]
            
            # Daily stats
            cursor = conn.execute("""
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as events,
                    COUNT(DISTINCT user_id) as users,
                    COUNT(DISTINCT session_id) as sessions
                FROM analytics_events
                WHERE timestamp >= ?
                GROUP BY DATE(timestamp)
                ORDER BY date
            """, (since_date,))
            
            daily_stats = cursor.fetchall()
            summary['daily_stats'] = [dict(row) for row in daily_stats]
            
            # Performance metrics
            cursor = conn.execute("""
                SELECT 
                    metric_name,
                    AVG(metric_value) as avg_value,
                    MIN(metric_value) as min_value,
                    MAX(metric_value) as max_value,
                    COUNT(*) as count
                FROM performance_metrics
                WHERE timestamp >= ?
                GROUP BY metric_name
            """, (since_date,))
            
            perf_metrics = cursor.fetchall()
            summary['performance_metrics'] = {
                row['metric_name']: {
                    'average': round(row['avg_value'], 2),
                    'minimum': round(row['min_value'], 2),
                    'maximum': round(row['max_value'], 2),
                    'count': row['count']
                } for row in perf_metrics
            }
            
        except Exception as e:
            print(f"Error getting analytics summary: {e}")
        
        conn.close()
        return summary
    
    def get_workflow_analytics(self, workflow_filename: str) -> Dict[str, Any]:
        """Get detailed analytics for a specific workflow"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        analytics = {
            'workflow_filename': workflow_filename,
            'total_views': 0,
            'total_downloads': 0,
            'total_imports': 0,
            'unique_viewers': 0,
            'view_timeline': [],
            'user_engagement': {},
            'performance_metrics': {},
            'conversion_rate': 0
        }
        
        try:
            # Basic stats
            cursor = conn.execute("""
                SELECT 
                    event_type,
                    COUNT(*) as count,
                    COUNT(DISTINCT user_id) as unique_users
                FROM analytics_events
                WHERE workflow_filename = ?
                GROUP BY event_type
            """, (workflow_filename,))
            
            event_stats = cursor.fetchall()
            for row in event_stats:
                if row['event_type'] == 'workflow_view':
                    analytics['total_views'] = row['count']
                    analytics['unique_viewers'] = row['unique_users']
                elif row['event_type'] == 'workflow_download':
                    analytics['total_downloads'] = row['count']
                elif row['event_type'] == 'workflow_import':
                    analytics['total_imports'] = row['count']
            
            # View timeline (last 30 days)
            since_date = datetime.now() - timedelta(days=30)
            cursor = conn.execute("""
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as views
                FROM analytics_events
                WHERE workflow_filename = ? AND event_type = 'workflow_view' AND timestamp >= ?
                GROUP BY DATE(timestamp)
                ORDER BY date
            """, (workflow_filename, since_date))
            
            view_timeline = cursor.fetchall()
            analytics['view_timeline'] = [dict(row) for row in view_timeline]
            
            # Calculate conversion rate
            if analytics['total_views'] > 0:
                analytics['conversion_rate'] = round(
                    (analytics['total_downloads'] + analytics['total_imports']) / analytics['total_views'] * 100, 2
                )
            
        except Exception as e:
            print(f"Error getting workflow analytics: {e}")
        
        conn.close()
        return analytics
    
    def create_analytics_dashboard(self) -> str:
        """Create comprehensive analytics dashboard"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N Workflows Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            color: #666;
            font-size: 1rem;
        }
        
        .chart-container {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .chart-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .chart {
            height: 400px;
            position: relative;
        }
        
        .tables-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .table-container {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .table-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #555;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-active {
            background: #4caf50;
        }
        
        .status-inactive {
            background: #f44336;
        }
        
        .trend-up {
            color: #4caf50;
        }
        
        .trend-down {
            color: #f44336;
        }
        
        .trend-neutral {
            color: #666;
        }
        
        .refresh-button {
            background: #1976d2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 1rem;
        }
        
        .refresh-button:hover {
            background: #1565c0;
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .dashboard {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .tables-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>📊 Analytics Dashboard</h1>
            <p>Comprehensive insights into N8N Workflows platform usage and performance</p>
        </div>
        
        <button class="refresh-button" onclick="refreshDashboard()">🔄 Refresh Data</button>
        
        <div class="metrics-grid" id="metrics-grid">
            <div class="loading">Loading metrics...</div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">📈 Daily Activity Trends</div>
            <div class="chart">
                <canvas id="dailyTrendsChart"></canvas>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">🎯 Event Types Distribution</div>
            <div class="chart">
                <canvas id="eventTypesChart"></canvas>
            </div>
        </div>
        
        <div class="tables-grid">
            <div class="table-container">
                <div class="chart-title">⭐ Top Workflows</div>
                <table class="table" id="top-workflows-table">
                    <thead>
                        <tr>
                            <th>Workflow</th>
                            <th>Views</th>
                            <th>Downloads</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" class="loading">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div class="table-container">
                <div class="chart-title">⚡ Performance Metrics</div>
                <table class="table" id="performance-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Average</th>
                            <th>Min</th>
                            <th>Max</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="4" class="loading">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        let analyticsData = {};
        
        // Load analytics data
        async function loadAnalyticsData() {
            try {
                const response = await fetch('/api/analytics/summary');
                analyticsData = await response.json();
                renderDashboard();
            } catch (error) {
                console.error('Error loading analytics data:', error);
                document.getElementById('metrics-grid').innerHTML = `
                    <div class="loading">
                        <div>⚠️ Failed to load analytics data</div>
                        <button onclick="loadAnalyticsData()" style="margin-top: 16px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px;">Retry</button>
                    </div>
                `;
            }
        }
        
        // Render dashboard
        function renderDashboard() {
            renderMetrics();
            renderCharts();
            renderTables();
        }
        
        // Render metrics
        function renderMetrics() {
            const metricsGrid = document.getElementById('metrics-grid');
            const data = analyticsData;
            
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-value">${data.total_events || 0}</div>
                    <div class="metric-label">Total Events</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.unique_users || 0}</div>
                    <div class="metric-label">Unique Users</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.unique_sessions || 0}</div>
                    <div class="metric-label">Sessions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.total_page_views || 0}</div>
                    <div class="metric-label">Page Views</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.total_downloads || 0}</div>
                    <div class="metric-label">Downloads</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.period_days || 30}</div>
                    <div class="metric-label">Days Analyzed</div>
                </div>
            `;
        }
        
        // Render charts
        function renderCharts() {
            renderDailyTrendsChart();
            renderEventTypesChart();
        }
        
        // Daily trends chart
        function renderDailyTrendsChart() {
            const ctx = document.getElementById('dailyTrendsChart').getContext('2d');
            const data = analyticsData.daily_stats || [];
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => new Date(d.date).toLocaleDateString()),
                    datasets: [{
                        label: 'Events',
                        data: data.map(d => d.events),
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Users',
                        data: data.map(d => d.users),
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Event types chart
        function renderEventTypesChart() {
            const ctx = document.getElementById('eventTypesChart').getContext('2d');
            const data = analyticsData.event_types || {};
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: [
                            '#1976d2',
                            '#4caf50',
                            '#ff9800',
                            '#f44336',
                            '#9c27b0',
                            '#00bcd4'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Render tables
        function renderTables() {
            renderTopWorkflowsTable();
            renderPerformanceTable();
        }
        
        // Top workflows table
        function renderTopWorkflowsTable() {
            const tbody = document.querySelector('#top-workflows-table tbody');
            const workflows = analyticsData.top_workflows || [];
            
            if (workflows.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
                return;
            }
            
            tbody.innerHTML = workflows.map(workflow => `
                <tr>
                    <td>${workflow.workflow_filename}</td>
                    <td>${workflow.views}</td>
                    <td>${workflow.downloads || 0}</td>
                    <td>${workflow.rating || 'N/A'}</td>
                </tr>
            `).join('');
        }
        
        // Performance table
        function renderPerformanceTable() {
            const tbody = document.querySelector('#performance-table tbody');
            const metrics = analyticsData.performance_metrics || {};
            
            if (Object.keys(metrics).length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
                return;
            }
            
            tbody.innerHTML = Object.entries(metrics).map(([name, data]) => `
                <tr>
                    <td>${name}</td>
                    <td>${data.average}</td>
                    <td>${data.minimum}</td>
                    <td>${data.maximum}</td>
                </tr>
            `).join('');
        }
        
        // Refresh dashboard
        function refreshDashboard() {
            loadAnalyticsData();
        }
        
        // Initialize dashboard
        loadAnalyticsData();
        
        // Auto-refresh every 5 minutes
        setInterval(loadAnalyticsData, 5 * 60 * 1000);
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = self.static_dir / "analytics_dashboard.html"
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def seed_sample_analytics(self):
        """Seed sample analytics data for demonstration"""
        sample_events = [
            'workflow_view', 'workflow_download', 'workflow_import', 
            'page_view', 'search', 'filter_change'
        ]
        
        sample_workflows = []
        workflows_dir = Path("workflows")
        if workflows_dir.exists():
            workflow_files = list(workflows_dir.rglob("*.json"))[:50]
            sample_workflows = [f.name for f in workflow_files]
        
        sample_users = [f'user_{i}' for i in range(1, 21)]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            # Generate sample events for the last 30 days
            for days_ago in range(30):
                date = datetime.now() - timedelta(days=days_ago)
                
                # Generate 10-50 events per day
                daily_events = random.randint(10, 50)
                
                for _ in range(daily_events):
                    event_type = random.choice(sample_events)
                    user_id = random.choice(sample_users)
                    session_id = f'session_{user_id}_{random.randint(1000, 9999)}'
                    workflow_filename = random.choice(sample_workflows) if sample_workflows else None
                    
                    # Add some randomness to timestamp
                    event_time = date + timedelta(
                        hours=random.randint(0, 23),
                        minutes=random.randint(0, 59),
                        seconds=random.randint(0, 59)
                    )
                    
                    conn.execute("""
                        INSERT INTO analytics_events 
                        (event_type, workflow_filename, user_id, session_id, timestamp)
                        VALUES (?, ?, ?, ?, ?)
                    """, (event_type, workflow_filename, user_id, session_id, event_time))
            
            # Generate sample performance metrics
            for days_ago in range(30):
                date = datetime.now() - timedelta(days=days_ago)
                
                # Generate performance metrics
                metrics = [
                    ('response_time', random.uniform(0.1, 2.0)),
                    ('search_time', random.uniform(0.05, 1.0)),
                    ('load_time', random.uniform(0.5, 3.0)),
                    ('error_rate', random.uniform(0.0, 0.05))
                ]
                
                for metric_name, metric_value in metrics:
                    conn.execute("""
                        INSERT INTO performance_metrics 
                        (metric_name, metric_value, timestamp)
                        VALUES (?, ?, ?)
                    """, (metric_name, metric_value, date))
            
            conn.commit()
            print("✅ Sample analytics data seeded successfully")
            
        except Exception as e:
            print(f"❌ Error seeding sample analytics data: {e}")
        
        conn.close()
    
    def generate_analytics_report(self) -> Dict[str, Any]:
        """Generate comprehensive analytics report"""
        summary = self.get_analytics_summary(30)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'period_days': 30,
            'summary': summary,
            'insights': [],
            'recommendations': []
        }
        
        # Generate insights
        if summary['total_events'] > 0:
            report['insights'].append(f"Total of {summary['total_events']} events tracked in the last 30 days")
        
        if summary['unique_users'] > 0:
            report['insights'].append(f"{summary['unique_users']} unique users engaged with the platform")
        
        if summary['top_workflows']:
            top_workflow = summary['top_workflows'][0]
            report['insights'].append(f"Most popular workflow: {top_workflow['workflow_filename']} with {top_workflow['views']} views")
        
        # Generate recommendations
        if summary['total_events'] < 100:
            report['recommendations'].append("Consider implementing more comprehensive analytics tracking")
        
        if summary['unique_users'] < 10:
            report['recommendations'].append("Focus on user acquisition and engagement strategies")
        
        if summary['performance_metrics']:
            avg_response_time = summary['performance_metrics'].get('response_time', {}).get('average', 0)
            if avg_response_time > 1.0:
                report['recommendations'].append("Optimize response times for better user experience")
        
        return report

def main():
    """Main execution function"""
    dashboard = AnalyticsDashboard()
    
    print("📊 ANALYTICS DASHBOARD")
    print("=" * 30)
    
    # Seed sample data
    print("🌱 Seeding sample analytics data...")
    dashboard.seed_sample_analytics()
    
    # Create dashboard
    print("📈 Creating analytics dashboard...")
    dashboard_path = dashboard.create_analytics_dashboard()
    
    # Generate report
    print("📋 Generating analytics report...")
    report = dashboard.generate_analytics_report()
    
    # Display summary
    print("\n📊 ANALYTICS SUMMARY")
    print("=" * 25)
    summary = report['summary']
    
    print(f"📈 Total Events: {summary['total_events']}")
    print(f"👥 Unique Users: {summary['unique_users']}")
    print(f"🔄 Unique Sessions: {summary['unique_sessions']}")
    print(f"📅 Period: {summary['period_days']} days")
    
    print(f"\n🎯 Top Event Types:")
    for event_type, count in list(summary['event_types'].items())[:5]:
        print(f"  • {event_type}: {count}")
    
    print(f"\n⭐ Top Workflows:")
    for i, workflow in enumerate(summary['top_workflows'][:5], 1):
        print(f"  {i}. {workflow['workflow_filename']} - {workflow['views']} views")
    
    print(f"\n💡 Insights:")
    for insight in report['insights']:
        print(f"  • {insight}")
    
    print(f"\n🎯 Recommendations:")
    for recommendation in report['recommendations']:
        print(f"  • {recommendation}")
    
    print(f"\n🎉 Analytics dashboard complete!")
    print(f"📊 Dashboard: {dashboard_path}")

if __name__ == "__main__":
    main()
