#!/usr/bin/env python3
"""
Workflow Activator - Analyze and activate workflows
"""

import json
import os
import glob
from pathlib import Path
from typing import Dict, List, Any

class WorkflowActivator:
    """Analyze and activate workflows based on quality and completeness"""
    
    def __init__(self):
        self.workflows_dir = Path("workflows")
        self.activation_criteria = {
            'min_nodes': 3,
            'max_nodes': 50,
            'required_fields': ['nodes', 'connections'],
            'quality_indicators': [
                'has_description',
                'has_meaningful_name',
                'has_proper_connections',
                'has_valid_nodes',
                'no_hardcoded_credentials'
            ]
        }
    
    def analyze_workflow_quality(self, file_path: Path) -> Dict[str, Any]:
        """Analyze a workflow file for quality and activation potential"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {'quality_score': 0, 'issues': ['Invalid JSON or file not found']}
        
        analysis = {
            'filename': file_path.name,
            'quality_score': 0,
            'issues': [],
            'strengths': [],
            'activation_recommended': False
        }
        
        # Check basic structure
        if not isinstance(data, dict):
            analysis['issues'].append('Invalid workflow structure')
            return analysis
        
        # Check required fields
        for field in self.activation_criteria['required_fields']:
            if field not in data:
                analysis['issues'].append(f'Missing required field: {field}')
            else:
                analysis['strengths'].append(f'Has {field}')
        
        # Analyze nodes
        nodes = data.get('nodes', [])
        node_count = len(nodes)
        
        if node_count < self.activation_criteria['min_nodes']:
            analysis['issues'].append(f'Too few nodes: {node_count}')
        elif node_count > self.activation_criteria['max_nodes']:
            analysis['issues'].append(f'Too many nodes: {node_count}')
        else:
            analysis['strengths'].append(f'Good node count: {node_count}')
        
        # Check for meaningful name
        workflow_name = data.get('name', '')
        if workflow_name and not workflow_name.startswith('My workflow'):
            analysis['strengths'].append('Has meaningful name')
        else:
            analysis['issues'].append('Generic or missing name')
        
        # Check for description
        description = data.get('description', '')
        if description and len(description.strip()) > 10:
            analysis['strengths'].append('Has description')
        else:
            analysis['issues'].append('Missing or short description')
        
        # Check connections
        connections = data.get('connections', {})
        if connections and isinstance(connections, dict):
            analysis['strengths'].append('Has connections')
        else:
            analysis['issues'].append('Missing or invalid connections')
        
        # Check for hardcoded credentials (basic check)
        workflow_str = json.dumps(data).lower()
        suspicious_patterns = ['password', 'secret', 'key=', 'token=', 'api_key']
        has_hardcoded = any(pattern in workflow_str for pattern in suspicious_patterns)
        
        if has_hardcoded:
            analysis['issues'].append('Potential hardcoded credentials')
        else:
            analysis['strengths'].append('No obvious hardcoded credentials')
        
        # Calculate quality score
        total_checks = len(self.activation_criteria['quality_indicators']) + 2  # +2 for node count and structure
        passed_checks = len(analysis['strengths'])
        analysis['quality_score'] = (passed_checks / total_checks) * 100
        
        # Determine if activation is recommended
        analysis['activation_recommended'] = (
            analysis['quality_score'] >= 70 and
            len(analysis['issues']) <= 2 and
            node_count >= self.activation_criteria['min_nodes']
        )
        
        return analysis
    
    def analyze_all_workflows(self) -> Dict[str, Any]:
        """Analyze all workflows in the directory"""
        json_files = list(self.workflows_dir.rglob("*.json"))
        
        results = {
            'total_workflows': len(json_files),
            'analysis_results': [],
            'activation_stats': {
                'recommended_for_activation': 0,
                'needs_improvement': 0,
                'high_quality': 0,
                'low_quality': 0
            },
            'quality_distribution': {
                '90-100': 0,
                '80-89': 0,
                '70-79': 0,
                '60-69': 0,
                'below_60': 0
            }
        }
        
        print(f"🔍 Analyzing {len(json_files)} workflows...")
        
        for file_path in json_files:
            analysis = self.analyze_workflow_quality(file_path)
            results['analysis_results'].append(analysis)
            
            # Update statistics
            score = analysis['quality_score']
            if analysis['activation_recommended']:
                results['activation_stats']['recommended_for_activation'] += 1
            else:
                results['activation_stats']['needs_improvement'] += 1
            
            if score >= 90:
                results['activation_stats']['high_quality'] += 1
                results['quality_distribution']['90-100'] += 1
            elif score >= 80:
                results['quality_distribution']['80-89'] += 1
            elif score >= 70:
                results['quality_distribution']['70-79'] += 1
            elif score >= 60:
                results['quality_distribution']['60-69'] += 1
            else:
                results['activation_stats']['low_quality'] += 1
                results['quality_distribution']['below_60'] += 1
        
        return results
    
    def generate_activation_report(self, results: Dict[str, Any]) -> str:
        """Generate a comprehensive activation report"""
        report = []
        report.append("🎯 WORKFLOW ACTIVATION ANALYSIS REPORT")
        report.append("=" * 50)
        report.append(f"📊 Total Workflows Analyzed: {results['total_workflows']}")
        report.append("")
        
        # Activation recommendations
        report.append("🚀 ACTIVATION RECOMMENDATIONS")
        report.append("-" * 30)
        recommended = results['activation_stats']['recommended_for_activation']
        total = results['total_workflows']
        percentage = (recommended / total) * 100
        report.append(f"✅ Recommended for Activation: {recommended} ({percentage:.1f}%)")
        report.append(f"⚠️  Needs Improvement: {results['activation_stats']['needs_improvement']}")
        report.append("")
        
        # Quality distribution
        report.append("📈 QUALITY DISTRIBUTION")
        report.append("-" * 25)
        for range_name, count in results['quality_distribution'].items():
            percentage = (count / total) * 100
            report.append(f"{range_name}%: {count} workflows ({percentage:.1f}%)")
        report.append("")
        
        # Top recommendations
        report.append("⭐ TOP ACTIVATION CANDIDATES")
        report.append("-" * 30)
        
        # Sort by quality score and get top 20
        sorted_workflows = sorted(
            results['analysis_results'],
            key=lambda x: x['quality_score'],
            reverse=True
        )
        
        for i, workflow in enumerate(sorted_workflows[:20]):
            if workflow['activation_recommended']:
                report.append(f"{i+1:2d}. {workflow['filename']} (Score: {workflow['quality_score']:.1f})")
        
        report.append("")
        
        # Common issues
        report.append("🔧 COMMON ISSUES TO ADDRESS")
        report.append("-" * 30)
        
        all_issues = []
        for workflow in results['analysis_results']:
            all_issues.extend(workflow['issues'])
        
        issue_counts = {}
        for issue in all_issues:
            issue_counts[issue] = issue_counts.get(issue, 0) + 1
        
        sorted_issues = sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)
        
        for issue, count in sorted_issues[:10]:
            percentage = (count / total) * 100
            report.append(f"• {issue}: {count} workflows ({percentage:.1f}%)")
        
        return "\n".join(report)
    
    def activate_workflows(self, threshold_score: float = 70.0) -> List[str]:
        """Activate workflows that meet the quality threshold"""
        json_files = list(self.workflows_dir.rglob("*.json"))
        activated_workflows = []
        
        print(f"🚀 Activating workflows with score >= {threshold_score}...")
        
        for file_path in json_files:
            analysis = self.analyze_workflow_quality(file_path)
            
            if analysis['quality_score'] >= threshold_score and analysis['activation_recommended']:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Set active flag
                    data['active'] = True
                    
                    # Save updated workflow
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    activated_workflows.append(file_path.name)
                    print(f"✅ Activated: {file_path.name} (Score: {analysis['quality_score']:.1f})")
                    
                except Exception as e:
                    print(f"❌ Failed to activate {file_path.name}: {e}")
        
        return activated_workflows

def main():
    """Main execution function"""
    activator = WorkflowActivator()
    
    print("🔍 Starting workflow activation analysis...")
    
    # Analyze all workflows
    results = activator.analyze_all_workflows()
    
    # Generate report
    report = activator.generate_activation_report(results)
    print(report)
    
    # Save report to file
    with open('workflow_activation_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📄 Report saved to: workflow_activation_report.txt")
    
    # Ask if user wants to activate workflows
    print("\n" + "=" * 50)
    print("🎯 ACTIVATION OPTIONS")
    print("=" * 50)
    print("1. Activate high-quality workflows (score >= 90)")
    print("2. Activate good workflows (score >= 80)")
    print("3. Activate recommended workflows (score >= 70)")
    print("4. Show detailed analysis for specific workflows")
    print("5. Exit")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == "1":
        activated = activator.activate_workflows(90.0)
        print(f"\n🎉 Activated {len(activated)} high-quality workflows!")
    elif choice == "2":
        activated = activator.activate_workflows(80.0)
        print(f"\n🎉 Activated {len(activated)} good workflows!")
    elif choice == "3":
        activated = activator.activate_workflows(70.0)
        print(f"\n🎉 Activated {len(activated)} recommended workflows!")
    elif choice == "4":
        print("\n📋 Detailed Analysis for Top 10 Workflows:")
        print("-" * 40)
        sorted_workflows = sorted(
            results['analysis_results'],
            key=lambda x: x['quality_score'],
            reverse=True
        )
        
        for i, workflow in enumerate(sorted_workflows[:10]):
            print(f"\n{i+1}. {workflow['filename']}")
            print(f"   Score: {workflow['quality_score']:.1f}")
            print(f"   Recommended: {'Yes' if workflow['activation_recommended'] else 'No'}")
            print(f"   Strengths: {', '.join(workflow['strengths'])}")
            if workflow['issues']:
                print(f"   Issues: {', '.join(workflow['issues'])}")
    else:
        print("👋 Analysis complete. No workflows activated.")

if __name__ == "__main__":
    main()
