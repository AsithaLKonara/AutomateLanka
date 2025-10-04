#!/usr/bin/env python3
"""
Workflow Template Generator - Create reusable workflow templates
"""

import json
import os
import glob
from pathlib import Path
from typing import Dict, List, Any
import re

class WorkflowTemplateGenerator:
    """Generate reusable workflow templates from existing workflows"""
    
    def __init__(self):
        self.workflows_dir = Path("workflows")
        self.templates_dir = Path("templates")
        self.templates_dir.mkdir(exist_ok=True)
        
        self.template_categories = {
            'communication': ['telegram', 'discord', 'slack', 'whatsapp', 'email'],
            'data_processing': ['googlesheets', 'airtable', 'postgres', 'mysql'],
            'automation': ['webhook', 'cron', 'schedule', 'manual'],
            'ai_ml': ['openai', 'anthropic', 'huggingface'],
            'ecommerce': ['shopify', 'stripe', 'paypal'],
            'social_media': ['twitter', 'facebook', 'linkedin', 'instagram'],
            'project_management': ['trello', 'asana', 'jira', 'notion'],
            'cloud_storage': ['googledrive', 'dropbox', 'onedrive']
        }
    
    def analyze_workflow_patterns(self) -> Dict[str, List[Dict]]:
        """Analyze workflows to identify common patterns"""
        json_files = list(self.workflows_dir.rglob("*.json"))
        patterns = {
            'webhook_to_notification': [],
            'data_sync': [],
            'form_processing': [],
            'scheduled_backup': [],
            'api_integration': [],
            'conditional_processing': [],
            'batch_operations': [],
            'real_time_monitoring': []
        }
        
        print(f"🔍 Analyzing {len(json_files)} workflows for patterns...")
        
        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                nodes = data.get('nodes', [])
                connections = data.get('connections', {})
                
                # Analyze node types and connections
                node_types = [node.get('type', '') for node in nodes]
                node_names = [node.get('name', '') for node in nodes]
                
                # Pattern detection
                if self._is_webhook_to_notification(nodes, node_types):
                    patterns['webhook_to_notification'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_data_sync(nodes, node_types):
                    patterns['data_sync'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_form_processing(nodes, node_types):
                    patterns['form_processing'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_scheduled_backup(nodes, node_types):
                    patterns['scheduled_backup'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_api_integration(nodes, node_types):
                    patterns['api_integration'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_conditional_processing(nodes, node_types):
                    patterns['conditional_processing'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_batch_operations(nodes, node_types):
                    patterns['batch_operations'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
                if self._is_real_time_monitoring(nodes, node_types):
                    patterns['real_time_monitoring'].append({
                        'filename': file_path.name,
                        'nodes': len(nodes),
                        'integrations': self._extract_integrations(node_types)
                    })
                
            except Exception as e:
                print(f"⚠️  Error analyzing {file_path.name}: {e}")
                continue
        
        return patterns
    
    def _is_webhook_to_notification(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is webhook to notification pattern"""
        has_webhook = any('webhook' in nt.lower() for nt in node_types)
        has_notification = any(service in ' '.join(node_types).lower() 
                             for service in ['telegram', 'discord', 'slack', 'email', 'notification'])
        return has_webhook and has_notification
    
    def _is_data_sync(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is data synchronization pattern"""
        has_source = any(service in ' '.join(node_types).lower() 
                        for service in ['googlesheets', 'airtable', 'postgres', 'mysql'])
        has_destination = any(service in ' '.join(node_types).lower() 
                             for service in ['googledrive', 'dropbox', 'database'])
        return has_source and has_destination
    
    def _is_form_processing(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is form processing pattern"""
        has_form = any('form' in nt.lower() for nt in node_types)
        has_processing = any(service in ' '.join(node_types).lower() 
                           for service in ['process', 'transform', 'validate'])
        return has_form and has_processing
    
    def _is_scheduled_backup(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is scheduled backup pattern"""
        has_schedule = any('cron' in nt.lower() or 'schedule' in nt.lower() for nt in node_types)
        has_backup = any('backup' in nt.lower() or 'export' in nt.lower() for nt in node_types)
        return has_schedule and has_backup
    
    def _is_api_integration(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is API integration pattern"""
        has_http = any('http' in nt.lower() for nt in node_types)
        has_api = any(service in ' '.join(node_types).lower() 
                     for service in ['api', 'rest', 'graphql'])
        return has_http and has_api
    
    def _is_conditional_processing(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow has conditional processing"""
        return any('if' in nt.lower() or 'switch' in nt.lower() for nt in node_types)
    
    def _is_batch_operations(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow performs batch operations"""
        return any('batch' in nt.lower() or 'split' in nt.lower() for nt in node_types)
    
    def _is_real_time_monitoring(self, nodes: List[Dict], node_types: List[str]) -> bool:
        """Check if workflow is real-time monitoring"""
        has_monitor = any('monitor' in nt.lower() or 'track' in nt.lower() for nt in node_types)
        has_alert = any('alert' in nt.lower() or 'notification' in nt.lower() for nt in node_types)
        return has_monitor and has_alert
    
    def _extract_integrations(self, node_types: List[str]) -> List[str]:
        """Extract integration names from node types"""
        integrations = []
        for nt in node_types:
            if 'n8n-nodes-base.' in nt:
                service = nt.replace('n8n-nodes-base.', '').lower()
                service = re.sub(r'trigger$', '', service)
                if service not in integrations:
                    integrations.append(service)
        return integrations
    
    def create_template_from_pattern(self, pattern_name: str, workflows: List[Dict]) -> Dict[str, Any]:
        """Create a template from a pattern"""
        if not workflows:
            return {}
        
        # Find the most representative workflow
        best_workflow = max(workflows, key=lambda w: len(w['integrations']))
        
        template = {
            'name': f"{pattern_name.replace('_', ' ').title()} Template",
            'description': self._generate_template_description(pattern_name, best_workflow),
            'category': self._get_template_category(pattern_name),
            'pattern': pattern_name,
            'difficulty': self._get_difficulty_level(best_workflow['nodes']),
            'estimated_time': self._estimate_completion_time(best_workflow['nodes']),
            'integrations': best_workflow['integrations'],
            'node_count': best_workflow['nodes'],
            'use_cases': self._get_use_cases(pattern_name),
            'prerequisites': self._get_prerequisites(best_workflow['integrations']),
            'steps': self._generate_template_steps(pattern_name, best_workflow),
            'configuration': self._get_configuration_template(pattern_name),
            'examples': workflows[:5],  # Top 5 examples
            'tags': self._generate_tags(pattern_name, best_workflow['integrations'])
        }
        
        return template
    
    def _generate_template_description(self, pattern_name: str, workflow: Dict) -> str:
        """Generate description for template"""
        descriptions = {
            'webhook_to_notification': "Automatically send notifications when webhook events are received. Perfect for real-time alerts and status updates.",
            'data_sync': "Synchronize data between different systems and platforms. Ideal for keeping databases and spreadsheets in sync.",
            'form_processing': "Process form submissions and route data to appropriate systems. Great for lead management and data collection.",
            'scheduled_backup': "Automatically backup data on a schedule. Essential for data protection and disaster recovery.",
            'api_integration': "Integrate with external APIs to fetch, process, and send data. Perfect for connecting different services.",
            'conditional_processing': "Process data based on conditions and rules. Ideal for business logic automation.",
            'batch_operations': "Process large amounts of data in batches. Great for bulk operations and data migration.",
            'real_time_monitoring': "Monitor systems and send alerts in real-time. Perfect for system health monitoring."
        }
        return descriptions.get(pattern_name, "A reusable workflow template for common automation tasks.")
    
    def _get_template_category(self, pattern_name: str) -> str:
        """Get category for template"""
        categories = {
            'webhook_to_notification': 'Communication & Messaging',
            'data_sync': 'Data Processing & Analysis',
            'form_processing': 'Data Processing & Analysis',
            'scheduled_backup': 'Business Process Automation',
            'api_integration': 'Web Scraping & Data Extraction',
            'conditional_processing': 'Business Process Automation',
            'batch_operations': 'Data Processing & Analysis',
            'real_time_monitoring': 'Technical Infrastructure & DevOps'
        }
        return categories.get(pattern_name, 'Business Process Automation')
    
    def _get_difficulty_level(self, node_count: int) -> str:
        """Get difficulty level based on node count"""
        if node_count <= 5:
            return 'Beginner'
        elif node_count <= 15:
            return 'Intermediate'
        else:
            return 'Advanced'
    
    def _estimate_completion_time(self, node_count: int) -> str:
        """Estimate completion time"""
        if node_count <= 5:
            return '15-30 minutes'
        elif node_count <= 15:
            return '30-60 minutes'
        else:
            return '1-2 hours'
    
    def _get_use_cases(self, pattern_name: str) -> List[str]:
        """Get use cases for pattern"""
        use_cases = {
            'webhook_to_notification': [
                'Real-time alerts and notifications',
                'Status updates and monitoring',
                'Event-driven communications'
            ],
            'data_sync': [
                'Database synchronization',
                'Spreadsheet updates',
                'Cross-platform data sharing'
            ],
            'form_processing': [
                'Lead management',
                'Data collection and validation',
                'Customer onboarding'
            ],
            'scheduled_backup': [
                'Data protection',
                'Disaster recovery',
                'Compliance requirements'
            ],
            'api_integration': [
                'Service connectivity',
                'Data exchange',
                'Third-party integrations'
            ],
            'conditional_processing': [
                'Business rule automation',
                'Data routing and filtering',
                'Decision-based workflows'
            ],
            'batch_operations': [
                'Bulk data processing',
                'Data migration',
                'Large-scale operations'
            ],
            'real_time_monitoring': [
                'System health monitoring',
                'Performance tracking',
                'Alert management'
            ]
        }
        return use_cases.get(pattern_name, ['General automation'])
    
    def _get_prerequisites(self, integrations: List[str]) -> List[str]:
        """Get prerequisites based on integrations"""
        prerequisites = []
        
        if any('telegram' in i for i in integrations):
            prerequisites.append('Telegram Bot Token')
        if any('discord' in i for i in integrations):
            prerequisites.append('Discord Bot Token')
        if any('slack' in i for i in integrations):
            prerequisites.append('Slack App Credentials')
        if any('googlesheets' in i for i in integrations):
            prerequisites.append('Google Sheets API Access')
        if any('airtable' in i for i in integrations):
            prerequisites.append('Airtable API Key')
        if any('webhook' in i for i in integrations):
            prerequisites.append('Webhook URL')
        
        return prerequisites
    
    def _generate_template_steps(self, pattern_name: str, workflow: Dict) -> List[Dict]:
        """Generate step-by-step instructions"""
        steps = []
        
        if pattern_name == 'webhook_to_notification':
            steps = [
                {'step': 1, 'title': 'Set up Webhook Trigger', 'description': 'Configure webhook to receive incoming data'},
                {'step': 2, 'title': 'Process Incoming Data', 'description': 'Parse and validate the webhook payload'},
                {'step': 3, 'title': 'Format Notification', 'description': 'Prepare the message content for notification'},
                {'step': 4, 'title': 'Send Notification', 'description': 'Deliver notification to the target platform'}
            ]
        elif pattern_name == 'data_sync':
            steps = [
                {'step': 1, 'title': 'Connect to Source', 'description': 'Establish connection to the data source'},
                {'step': 2, 'title': 'Fetch Data', 'description': 'Retrieve data from the source system'},
                {'step': 3, 'title': 'Transform Data', 'description': 'Convert data to target format'},
                {'step': 4, 'title': 'Update Destination', 'description': 'Write data to the destination system'}
            ]
        else:
            steps = [
                {'step': 1, 'title': 'Configure Trigger', 'description': 'Set up the workflow trigger'},
                {'step': 2, 'title': 'Process Data', 'description': 'Handle the incoming data'},
                {'step': 3, 'title': 'Apply Logic', 'description': 'Execute business logic'},
                {'step': 4, 'title': 'Complete Action', 'description': 'Perform the final action'}
            ]
        
        return steps
    
    def _get_configuration_template(self, pattern_name: str) -> Dict[str, Any]:
        """Get configuration template"""
        configs = {
            'webhook_to_notification': {
                'webhook_url': 'https://your-domain.com/webhook/endpoint',
                'notification_service': 'telegram',
                'bot_token': 'your_bot_token',
                'chat_id': 'your_chat_id'
            },
            'data_sync': {
                'source_connection': 'source_credentials',
                'destination_connection': 'destination_credentials',
                'sync_interval': 'daily',
                'data_mapping': 'field_mapping_config'
            },
            'form_processing': {
                'form_endpoint': 'https://your-domain.com/form',
                'validation_rules': 'validation_config',
                'routing_rules': 'routing_config'
            }
        }
        return configs.get(pattern_name, {})
    
    def _generate_tags(self, pattern_name: str, integrations: List[str]) -> List[str]:
        """Generate tags for template"""
        tags = [pattern_name.replace('_', '-')]
        tags.extend(integrations[:3])  # Top 3 integrations
        tags.append('template')
        tags.append('reusable')
        return tags
    
    def generate_all_templates(self) -> Dict[str, Any]:
        """Generate all workflow templates"""
        print("🎯 Generating workflow templates...")
        
        # Analyze patterns
        patterns = self.analyze_workflow_patterns()
        
        templates = {}
        template_stats = {
            'total_templates': 0,
            'patterns_analyzed': len(patterns),
            'workflows_analyzed': sum(len(workflows) for workflows in patterns.values())
        }
        
        # Create templates for each pattern
        for pattern_name, workflows in patterns.items():
            if workflows:
                template = self.create_template_from_pattern(pattern_name, workflows)
                if template:
                    templates[pattern_name] = template
                    template_stats['total_templates'] += 1
        
        # Save templates
        self._save_templates(templates)
        
        # Generate template index
        self._generate_template_index(templates)
        
        return {
            'templates': templates,
            'stats': template_stats,
            'patterns': patterns
        }
    
    def _save_templates(self, templates: Dict[str, Any]):
        """Save templates to files"""
        for template_name, template_data in templates.items():
            template_file = self.templates_dir / f"{template_name}_template.json"
            
            with open(template_file, 'w', encoding='utf-8') as f:
                json.dump(template_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Created template: {template_name}")
    
    def _generate_template_index(self, templates: Dict[str, Any]):
        """Generate template index file"""
        index_data = {
            'templates': list(templates.keys()),
            'categories': {},
            'difficulty_levels': {},
            'total_templates': len(templates)
        }
        
        # Organize by category
        for template_name, template_data in templates.items():
            category = template_data.get('category', 'Other')
            if category not in index_data['categories']:
                index_data['categories'][category] = []
            index_data['categories'][category].append(template_name)
            
            # Organize by difficulty
            difficulty = template_data.get('difficulty', 'Unknown')
            if difficulty not in index_data['difficulty_levels']:
                index_data['difficulty_levels'][difficulty] = []
            index_data['difficulty_levels'][difficulty].append(template_name)
        
        # Save index
        index_file = self.templates_dir / "template_index.json"
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Created template index: {index_file}")

def main():
    """Main execution function"""
    generator = WorkflowTemplateGenerator()
    
    print("🎯 WORKFLOW TEMPLATE GENERATOR")
    print("=" * 40)
    
    # Generate templates
    results = generator.generate_all_templates()
    
    # Generate report
    print("\n📊 TEMPLATE GENERATION REPORT")
    print("=" * 35)
    print(f"📈 Total Templates Created: {results['stats']['total_templates']}")
    print(f"🔍 Patterns Analyzed: {results['stats']['patterns_analyzed']}")
    print(f"📋 Workflows Analyzed: {results['stats']['workflows_analyzed']}")
    
    print("\n📚 Generated Templates:")
    for template_name, template_data in results['templates'].items():
        print(f"  • {template_data['name']} ({template_data['difficulty']})")
        print(f"    Category: {template_data['category']}")
        print(f"    Integrations: {', '.join(template_data['integrations'][:3])}")
        print(f"    Examples: {len(template_data['examples'])} workflows")
        print()
    
    print("🎉 Template generation complete!")
    print(f"📁 Templates saved to: {generator.templates_dir}")

if __name__ == "__main__":
    main()
