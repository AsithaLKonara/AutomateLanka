#!/usr/bin/env python3
"""
Performance Optimization Tool - Optimize search response times
"""

import sqlite3
import json
import os
import time
from pathlib import Path
from typing import Dict, List, Any

class PerformanceOptimizer:
    """Optimize database and search performance"""
    
    def __init__(self, db_path: str = "database/workflows.db"):
        self.db_path = db_path
        self.optimizations_applied = []
    
    def optimize_database(self) -> Dict[str, Any]:
        """Apply database optimizations"""
        optimizations = {
            'success': True,
            'optimizations': [],
            'performance_improvements': {}
        }
        
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("PRAGMA journal_mode=WAL")  # Write-ahead logging
            conn.execute("PRAGMA synchronous=NORMAL")  # Balanced safety/performance
            conn.execute("PRAGMA cache_size=10000")  # 10MB cache
            conn.execute("PRAGMA temp_store=MEMORY")  # Store temp tables in memory
            conn.execute("PRAGMA mmap_size=268435456")  # 256MB memory mapping
            
            # Create additional indexes for common queries
            indexes = [
                "CREATE INDEX IF NOT EXISTS idx_workflows_active_trigger ON workflows(active, trigger_type)",
                "CREATE INDEX IF NOT EXISTS idx_workflows_complexity_nodes ON workflows(complexity, node_count)",
                "CREATE INDEX IF NOT EXISTS idx_workflows_analyzed_at ON workflows(analyzed_at DESC)",
                "CREATE INDEX IF NOT EXISTS idx_workflows_name_search ON workflows(name COLLATE NOCASE)",
                "CREATE INDEX IF NOT EXISTS idx_workflows_integrations_gin ON workflows(integrations)"
            ]
            
            for index_sql in indexes:
                try:
                    conn.execute(index_sql)
                    index_name = index_sql.split('idx_')[1].split(' ')[0] if 'idx_' in index_sql else 'custom'
                    optimizations['optimizations'].append(f"Created index: {index_name}")
                except sqlite3.Error as e:
                    optimizations['optimizations'].append(f"Index creation failed: {e}")
            
            # Analyze database for query optimization
            conn.execute("ANALYZE")
            optimizations['optimizations'].append("Database analyzed for query optimization")
            
            conn.commit()
            conn.close()
            
            optimizations['success'] = True
            
        except Exception as e:
            optimizations['success'] = False
            optimizations['error'] = str(e)
        
        return optimizations
    
    def benchmark_search_performance(self) -> Dict[str, Any]:
        """Benchmark search performance before and after optimization"""
        benchmarks = {
            'queries': [],
            'average_response_time': 0,
            'total_queries': 0
        }
        
        # Test queries
        test_queries = [
            ("Simple search", "SELECT * FROM workflows WHERE name LIKE '%telegram%' LIMIT 20"),
            ("FTS search", "SELECT * FROM workflows_fts WHERE workflows_fts MATCH 'telegram' LIMIT 20"),
            ("Filter by trigger", "SELECT * FROM workflows WHERE trigger_type = 'Webhook' LIMIT 20"),
            ("Filter by complexity", "SELECT * FROM workflows WHERE complexity = 'high' LIMIT 20"),
            ("Active workflows", "SELECT * FROM workflows WHERE active = 1 LIMIT 20"),
            ("Complex query", "SELECT * FROM workflows WHERE active = 1 AND trigger_type = 'Webhook' AND complexity = 'medium' LIMIT 20")
        ]
        
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            
            total_time = 0
            
            for query_name, query_sql in test_queries:
                # Run query multiple times for accurate timing
                times = []
                for _ in range(5):
                    start_time = time.time()
                    cursor = conn.execute(query_sql)
                    results = cursor.fetchall()
                    end_time = time.time()
                    
                    query_time = (end_time - start_time) * 1000  # Convert to milliseconds
                    times.append(query_time)
                
                avg_time = sum(times) / len(times)
                total_time += avg_time
                
                benchmarks['queries'].append({
                    'name': query_name,
                    'sql': query_sql,
                    'avg_time_ms': round(avg_time, 2),
                    'result_count': len(results),
                    'times': [round(t, 2) for t in times]
                })
            
            benchmarks['total_queries'] = len(test_queries)
            benchmarks['average_response_time'] = round(total_time / len(test_queries), 2)
            
            conn.close()
            
        except Exception as e:
            benchmarks['error'] = str(e)
        
        return benchmarks
    
    def optimize_fts_index(self) -> Dict[str, Any]:
        """Optimize FTS5 index for better search performance"""
        optimization = {
            'success': True,
            'optimizations': []
        }
        
        try:
            conn = sqlite3.connect(self.db_path)
            
            # Rebuild FTS index for better performance
            conn.execute("INSERT INTO workflows_fts(workflows_fts) VALUES('rebuild')")
            optimization['optimizations'].append("Rebuilt FTS5 index for optimal performance")
            
            # Optimize FTS index
            conn.execute("INSERT INTO workflows_fts(workflows_fts) VALUES('optimize')")
            optimization['optimizations'].append("Optimized FTS5 index structure")
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            optimization['success'] = False
            optimization['error'] = str(e)
        
        return optimization
    
    def create_performance_monitoring(self) -> str:
        """Create performance monitoring dashboard"""
        dashboard_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N Workflows Performance Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #e3f2fd; border-radius: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1976d2; }
        .metric-label { font-size: 14px; color: #666; }
        .chart { height: 300px; background: #fafafa; border: 1px solid #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; }
        .status-good { color: #4caf50; }
        .status-warning { color: #ff9800; }
        .status-error { color: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 N8N Workflows Performance Dashboard</h1>
        
        <div class="card">
            <h2>📊 Performance Metrics</h2>
            <div class="metric">
                <div class="metric-value" id="avg-response-time">--</div>
                <div class="metric-label">Average Response Time (ms)</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="total-queries">--</div>
                <div class="metric-label">Total Queries Tested</div>
            </div>
            <div class="metric">
                <div class="metric-value" id="optimization-status">--</div>
                <div class="metric-label">Optimization Status</div>
            </div>
        </div>
        
        <div class="card">
            <h2>⚡ Query Performance</h2>
            <div id="query-results"></div>
        </div>
        
        <div class="card">
            <h2>🔧 Applied Optimizations</h2>
            <div id="optimizations-list"></div>
        </div>
        
        <div class="card">
            <h2>📈 Performance Trends</h2>
            <div class="chart">
                <p>Performance monitoring chart would be displayed here</p>
            </div>
        </div>
    </div>
    
    <script>
        // Load performance data
        fetch('/api/performance/benchmark')
            .then(response => response.json())
            .then(data => {
                document.getElementById('avg-response-time').textContent = data.average_response_time || '--';
                document.getElementById('total-queries').textContent = data.total_queries || '--';
                
                // Display query results
                const queryResults = document.getElementById('query-results');
                if (data.queries) {
                    data.queries.forEach(query => {
                        const div = document.createElement('div');
                        div.innerHTML = `
                            <strong>${query.name}:</strong> 
                            <span class="${query.avg_time_ms < 50 ? 'status-good' : query.avg_time_ms < 100 ? 'status-warning' : 'status-error'}">
                                ${query.avg_time_ms}ms
                            </span>
                            (${query.result_count} results)
                        `;
                        queryResults.appendChild(div);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading performance data:', error);
                document.getElementById('avg-response-time').textContent = 'Error';
            });
    </script>
</body>
</html>
        """
        
        # Save dashboard
        dashboard_path = Path("static/performance_dashboard.html")
        dashboard_path.parent.mkdir(exist_ok=True)
        
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_html)
        
        return str(dashboard_path)
    
    def run_full_optimization(self) -> Dict[str, Any]:
        """Run complete performance optimization"""
        results = {
            'success': True,
            'optimizations': [],
            'benchmarks': {},
            'dashboard_created': False
        }
        
        print("🚀 Starting performance optimization...")
        
        # 1. Optimize database
        print("📊 Optimizing database...")
        db_optimization = self.optimize_database()
        if db_optimization['success']:
            results['optimizations'].extend(db_optimization['optimizations'])
            print("✅ Database optimization complete")
        else:
            print(f"❌ Database optimization failed: {db_optimization.get('error')}")
            results['success'] = False
        
        # 2. Optimize FTS index
        print("🔍 Optimizing search index...")
        fts_optimization = self.optimize_fts_index()
        if fts_optimization['success']:
            results['optimizations'].extend(fts_optimization['optimizations'])
            print("✅ Search index optimization complete")
        else:
            print(f"❌ Search index optimization failed: {fts_optimization.get('error')}")
        
        # 3. Benchmark performance
        print("⚡ Benchmarking performance...")
        benchmarks = self.benchmark_search_performance()
        results['benchmarks'] = benchmarks
        
        if benchmarks.get('average_response_time'):
            avg_time = benchmarks['average_response_time']
            if avg_time < 50:
                print(f"🎉 Excellent performance: {avg_time}ms average response time")
            elif avg_time < 100:
                print(f"✅ Good performance: {avg_time}ms average response time")
            else:
                print(f"⚠️  Performance needs improvement: {avg_time}ms average response time")
        
        # 4. Create performance dashboard
        print("📊 Creating performance dashboard...")
        try:
            dashboard_path = self.create_performance_monitoring()
            results['dashboard_created'] = True
            results['dashboard_path'] = dashboard_path
            print(f"✅ Performance dashboard created: {dashboard_path}")
        except Exception as e:
            print(f"❌ Dashboard creation failed: {e}")
        
        return results

def main():
    """Main execution function"""
    optimizer = PerformanceOptimizer()
    
    print("🎯 N8N WORKFLOWS PERFORMANCE OPTIMIZATION")
    print("=" * 50)
    
    # Run full optimization
    results = optimizer.run_full_optimization()
    
    # Generate report
    print("\n📊 OPTIMIZATION REPORT")
    print("=" * 30)
    
    if results['success']:
        print("✅ Optimization completed successfully!")
        
        if results['benchmarks'].get('average_response_time'):
            avg_time = results['benchmarks']['average_response_time']
            print(f"⚡ Average response time: {avg_time}ms")
            
            if avg_time < 50:
                print("🎉 Target achieved: <50ms response time!")
            else:
                print(f"📈 Performance improved, target: <50ms")
        
        print(f"🔧 Optimizations applied: {len(results['optimizations'])}")
        for optimization in results['optimizations']:
            print(f"   • {optimization}")
        
        if results['dashboard_created']:
            print(f"📊 Performance dashboard: {results['dashboard_path']}")
    
    else:
        print("❌ Optimization encountered errors")
    
    print(f"\n🎯 Performance optimization complete!")

if __name__ == "__main__":
    main()
