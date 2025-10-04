#!/usr/bin/env python3
"""
Enterprise Security & Compliance - Add enterprise-grade security features
"""

import json
import sqlite3
import os
import hashlib
import secrets
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

class EnterpriseSecurity:
    """Enterprise security and compliance features"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.static_dir = Path("static")
        self.static_dir.mkdir(exist_ok=True)
        
        # Initialize security database
        self.init_security_database()
    
    def init_security_database(self):
        """Initialize security database tables"""
        conn = sqlite3.connect(self.db_path)
        
        # User roles and permissions
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role_name TEXT NOT NULL UNIQUE,
                description TEXT,
                permissions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User access control
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_access (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                role_id INTEGER,
                organization_id TEXT,
                department TEXT,
                access_level TEXT DEFAULT 'standard',
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES user_roles (id)
            )
        """)
        
        # Audit logs
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                ip_address TEXT,
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details TEXT
            )
        """)
        
        # Security policies
        conn.execute("""
            CREATE TABLE IF NOT EXISTS security_policies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                policy_name TEXT NOT NULL UNIQUE,
                policy_type TEXT NOT NULL,
                policy_content TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Data classification
        conn.execute("""
            CREATE TABLE IF NOT EXISTS data_classification (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workflow_filename TEXT NOT NULL,
                classification_level TEXT NOT NULL,
                sensitivity_tags TEXT,
                data_owner TEXT,
                retention_period INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_access_user ON user_access(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_classification_workflow ON data_classification(workflow_filename)")
        
        conn.commit()
        conn.close()
    
    def create_default_roles(self):
        """Create default enterprise roles"""
        roles = [
            {
                'role_name': 'Admin',
                'description': 'Full system access',
                'permissions': json.dumps(['read', 'write', 'delete', 'admin', 'audit'])
            },
            {
                'role_name': 'Manager',
                'description': 'Management access',
                'permissions': json.dumps(['read', 'write', 'approve', 'audit'])
            },
            {
                'role_name': 'Developer',
                'description': 'Development access',
                'permissions': json.dumps(['read', 'write', 'execute'])
            },
            {
                'role_name': 'Viewer',
                'description': 'Read-only access',
                'permissions': json.dumps(['read'])
            },
            {
                'role_name': 'Auditor',
                'description': 'Audit and compliance access',
                'permissions': json.dumps(['read', 'audit', 'export'])
            }
        ]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            for role in roles:
                conn.execute("""
                    INSERT OR IGNORE INTO user_roles (role_name, description, permissions)
                    VALUES (?, ?, ?)
                """, (role['role_name'], role['description'], role['permissions']))
            
            conn.commit()
            print("✅ Default enterprise roles created")
            
        except Exception as e:
            print(f"Error creating default roles: {e}")
        
        conn.close()
    
    def create_security_policies(self):
        """Create default security policies"""
        policies = [
            {
                'policy_name': 'Password Policy',
                'policy_type': 'authentication',
                'policy_content': json.dumps({
                    'min_length': 12,
                    'require_uppercase': True,
                    'require_lowercase': True,
                    'require_numbers': True,
                    'require_special_chars': True,
                    'max_age_days': 90,
                    'history_count': 5
                })
            },
            {
                'policy_name': 'Session Policy',
                'policy_type': 'session',
                'policy_content': json.dumps({
                    'timeout_minutes': 30,
                    'max_concurrent_sessions': 3,
                    'require_reauth_for_sensitive': True
                })
            },
            {
                'policy_name': 'Data Classification Policy',
                'policy_type': 'data_protection',
                'policy_content': json.dumps({
                    'levels': ['public', 'internal', 'confidential', 'restricted'],
                    'default_level': 'internal',
                    'encryption_required': ['confidential', 'restricted']
                })
            },
            {
                'policy_name': 'Audit Policy',
                'policy_type': 'compliance',
                'policy_content': json.dumps({
                    'log_all_actions': True,
                    'retention_days': 2555,  # 7 years
                    'real_time_monitoring': True,
                    'alert_on_suspicious': True
                })
            }
        ]
        
        conn = sqlite3.connect(self.db_path)
        
        try:
            for policy in policies:
                conn.execute("""
                    INSERT OR IGNORE INTO security_policies (policy_name, policy_type, policy_content)
                    VALUES (?, ?, ?)
                """, (policy['policy_name'], policy['policy_type'], policy['policy_content']))
            
            conn.commit()
            print("✅ Security policies created")
            
        except Exception as e:
            print(f"Error creating security policies: {e}")
        
        conn.close()
    
    def log_audit_event(self, user_id: str, action: str, resource_type: str = None, 
                       resource_id: str = None, ip_address: str = None, 
                       user_agent: str = None, details: Dict = None):
        """Log security audit event"""
        conn = sqlite3.connect(self.db_path)
        
        try:
            conn.execute("""
                INSERT INTO audit_logs 
                (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, action, resource_type, resource_id,
                ip_address, user_agent,
                json.dumps(details) if details else None
            ))
            
            conn.commit()
            
        except Exception as e:
            print(f"Error logging audit event: {e}")
        
        conn.close()
    
    def get_audit_logs(self, user_id: str = None, days: int = 30, limit: int = 100) -> List[Dict[str, Any]]:
        """Get audit logs"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        logs = []
        
        try:
            since_date = datetime.now() - timedelta(days=days)
            
            if user_id:
                cursor = conn.execute("""
                    SELECT * FROM audit_logs
                    WHERE user_id = ? AND timestamp >= ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                """, (user_id, since_date, limit))
            else:
                cursor = conn.execute("""
                    SELECT * FROM audit_logs
                    WHERE timestamp >= ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                """, (since_date, limit))
            
            logs = [dict(row) for row in cursor.fetchall()]
            
        except Exception as e:
            print(f"Error getting audit logs: {e}")
        
        conn.close()
        return logs
    
    def classify_workflow_data(self, workflow_filename: str, classification_level: str,
                              sensitivity_tags: List[str] = None, data_owner: str = None,
                              retention_period: int = 2555) -> bool:
        """Classify workflow data for compliance"""
        conn = sqlite3.connect(self.db_path)
        
        try:
            conn.execute("""
                INSERT OR REPLACE INTO data_classification 
                (workflow_filename, classification_level, sensitivity_tags, data_owner, retention_period)
                VALUES (?, ?, ?, ?, ?)
            """, (
                workflow_filename, classification_level,
                json.dumps(sensitivity_tags) if sensitivity_tags else None,
                data_owner, retention_period
            ))
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error classifying workflow data: {e}")
            return False
        
        conn.close()
    
    def get_security_dashboard(self) -> Dict[str, Any]:
        """Get security dashboard data"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        dashboard = {
            'total_users': 0,
            'active_sessions': 0,
            'security_events': 0,
            'compliance_score': 0,
            'recent_audit_events': [],
            'security_alerts': [],
            'data_classification_summary': {}
        }
        
        try:
            # Get user count
            cursor = conn.execute("SELECT COUNT(DISTINCT user_id) as count FROM user_access WHERE status = 'active'")
            user_count = cursor.fetchone()
            if user_count:
                dashboard['total_users'] = user_count['count']
            
            # Get recent audit events
            cursor = conn.execute("""
                SELECT action, COUNT(*) as count
                FROM audit_logs
                WHERE timestamp >= datetime('now', '-24 hours')
                GROUP BY action
                ORDER BY count DESC
                LIMIT 10
            """)
            
            recent_events = cursor.fetchall()
            dashboard['recent_audit_events'] = [dict(row) for row in recent_events]
            
            # Get data classification summary
            cursor = conn.execute("""
                SELECT classification_level, COUNT(*) as count
                FROM data_classification
                GROUP BY classification_level
            """)
            
            classification_data = cursor.fetchall()
            dashboard['data_classification_summary'] = {row['classification_level']: row['count'] for row in classification_data}
            
            # Calculate compliance score
            total_policies = conn.execute("SELECT COUNT(*) FROM security_policies WHERE is_active = TRUE").fetchone()[0]
            active_policies = conn.execute("SELECT COUNT(*) FROM security_policies WHERE is_active = TRUE").fetchone()[0]
            
            if total_policies > 0:
                dashboard['compliance_score'] = round((active_policies / total_policies) * 100, 1)
            
        except Exception as e:
            print(f"Error getting security dashboard: {e}")
        
        conn.close()
        return dashboard
    
    def create_security_dashboard(self) -> str:
        """Create enterprise security dashboard"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Security Dashboard</title>
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
            background: linear-gradient(135deg, #d32f2f, #b71c1c);
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
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #d32f2f;
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
        
        .security-alert {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .security-alert.high {
            background: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        
        .compliance-score {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        
        .compliance-score.good {
            background: #d4edda;
            color: #155724;
        }
        
        .compliance-score.warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .compliance-score.danger {
            background: #f8d7da;
            color: #721c24;
        }
        
        @media (max-width: 768px) {
            .tables-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🔒 Enterprise Security Dashboard</h1>
            <p>Comprehensive security monitoring and compliance management</p>
        </div>
        
        <div class="metrics-grid" id="metrics-grid">
            <div class="loading">Loading security metrics...</div>
        </div>
        
        <div class="tables-grid">
            <div class="table-container">
                <div class="table-title">📊 Recent Audit Events</div>
                <table class="table" id="audit-events-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Count (24h)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="2" class="loading">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div class="table-container">
                <div class="table-title">🏷️ Data Classification</div>
                <table class="table" id="classification-table">
                    <thead>
                        <tr>
                            <th>Classification Level</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td colspan="2" class="loading">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        async function loadSecurityData() {
            try {
                const response = await fetch('/api/security/dashboard');
                const data = await response.json();
                renderDashboard(data);
            } catch (error) {
                console.error('Error loading security data:', error);
                document.getElementById('metrics-grid').innerHTML = `
                    <div class="empty-state">
                        <div>⚠️ Failed to load security data</div>
                    </div>
                `;
            }
        }
        
        function renderDashboard(data) {
            renderMetrics(data);
            renderTables(data);
        }
        
        function renderMetrics(data) {
            const metricsGrid = document.getElementById('metrics-grid');
            
            let complianceClass = 'good';
            if (data.compliance_score < 70) complianceClass = 'danger';
            else if (data.compliance_score < 90) complianceClass = 'warning';
            
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-value">${data.total_users || 0}</div>
                    <div class="metric-label">Active Users</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.active_sessions || 0}</div>
                    <div class="metric-label">Active Sessions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${data.security_events || 0}</div>
                    <div class="metric-label">Security Events</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">
                        <span class="compliance-score ${complianceClass}">${data.compliance_score || 0}%</span>
                    </div>
                    <div class="metric-label">Compliance Score</div>
                </div>
            `;
        }
        
        function renderTables(data) {
            renderAuditEvents(data.recent_audit_events || []);
            renderClassification(data.data_classification_summary || {});
        }
        
        function renderAuditEvents(events) {
            const tbody = document.querySelector('#audit-events-table tbody');
            
            if (events.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">No recent events</td></tr>';
                return;
            }
            
            tbody.innerHTML = events.map(event => `
                <tr>
                    <td>${event.action}</td>
                    <td>${event.count}</td>
                </tr>
            `).join('');
        }
        
        function renderClassification(classification) {
            const tbody = document.querySelector('#classification-table tbody');
            
            if (Object.keys(classification).length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">No data classified</td></tr>';
                return;
            }
            
            tbody.innerHTML = Object.entries(classification).map(([level, count]) => `
                <tr>
                    <td>${level}</td>
                    <td>${count}</td>
                </tr>
            `).join('');
        }
        
        // Initialize dashboard
        loadSecurityData();
        
        // Auto-refresh every 5 minutes
        setInterval(loadSecurityData, 5 * 60 * 1000);
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = self.static_dir / "security_dashboard.html"
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def generate_compliance_report(self) -> Dict[str, Any]:
        """Generate compliance report"""
        dashboard = self.get_security_dashboard()
        audit_logs = self.get_audit_logs(days=30, limit=1000)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'compliance_score': dashboard['compliance_score'],
            'total_audit_events': len(audit_logs),
            'security_metrics': dashboard,
            'recommendations': []
        }
        
        # Generate recommendations
        if dashboard['compliance_score'] < 90:
            report['recommendations'].append("Improve compliance score by implementing additional security policies")
        
        if len(audit_logs) < 100:
            report['recommendations'].append("Increase audit logging for better security monitoring")
        
        if not dashboard['data_classification_summary']:
            report['recommendations'].append("Implement data classification for all workflows")
        
        return report

def main():
    """Main execution function"""
    security = EnterpriseSecurity()
    
    print("🔒 ENTERPRISE SECURITY & COMPLIANCE")
    print("=" * 40)
    
    # Create default roles
    print("👥 Creating default enterprise roles...")
    security.create_default_roles()
    
    # Create security policies
    print("📋 Creating security policies...")
    security.create_security_policies()
    
    # Create dashboard
    print("📊 Creating security dashboard...")
    dashboard_path = security.create_security_dashboard()
    
    # Generate report
    print("📋 Generating compliance report...")
    report = security.generate_compliance_report()
    
    # Display summary
    print(f"\n📊 SECURITY & COMPLIANCE REPORT")
    print("=" * 35)
    print(f"🔒 Compliance Score: {report['compliance_score']}%")
    print(f"📊 Total Audit Events: {report['total_audit_events']}")
    print(f"👥 Active Users: {report['security_metrics']['total_users']}")
    
    print(f"\n🎯 Recommendations:")
    for recommendation in report['recommendations']:
        print(f"  • {recommendation}")
    
    print(f"\n🎉 Enterprise security implementation complete!")
    print(f"📊 Dashboard: {dashboard_path}")

if __name__ == "__main__":
    main()
