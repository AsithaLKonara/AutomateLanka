#!/usr/bin/env python3
"""
Documentation Enhancement Tool - Improve workflow documentation
"""

import json
import os
import glob
from pathlib import Path
from typing import Dict, List, Any
import re

class DocumentationEnhancer:
    """Enhance workflow documentation and descriptions"""
    
    def __init__(self):
        self.workflows_dir = Path("workflows")
        self.template_descriptions = {
            'webhook': "Webhook-triggered automation that processes incoming requests and executes automated tasks.",
            'manual': "Manual workflow that can be triggered on-demand to perform specific automation tasks.",
            'scheduled': "Scheduled automation that runs at predefined intervals to execute recurring tasks.",
            'telegram': "Telegram bot integration that handles messaging, notifications, and automated responses.",
            'slack': "Slack integration for team communication, notifications, and workflow automation.",
            'discord': "Discord bot automation for community management and automated interactions.",
            'gmail': "Gmail integration for email processing, automation, and communication workflows.",
            'googlesheets': "Google Sheets integration for data processing, analysis, and spreadsheet automation.",
            'airtable': "Airtable integration for database operations, record management, and data workflows.",
            'openai': "OpenAI integration for AI-powered text generation, analysis, and intelligent automation.",
            'stripe': "Stripe payment processing integration for financial transactions and billing automation.",
            'shopify': "Shopify e-commerce integration for order processing, inventory management, and sales automation."
        }
    
    def generate_description(self, workflow_data: Dict, filename: str) -> str:
        """Generate an enhanced description for a workflow"""
        
        # Extract key information
        name = workflow_data.get('name', '')
        nodes = workflow_data.get('nodes', [])
        connections = workflow_data.get('connections', {})
        
        # Analyze nodes to understand the workflow
        node_types = []
        integrations = []
        
        for node in nodes:
            node_type = node.get('type', '')
            if node_type:
                # Extract service name from node type
                if 'n8n-nodes-base.' in node_type:
                    service = node_type.replace('n8n-nodes-base.', '').lower()
                    service = re.sub(r'trigger$', '', service)
                    integrations.append(service)
                node_types.append(node_type)
        
        # Generate description based on analysis
        description_parts = []
        
        # Determine trigger type
        trigger_type = "Manual"
        if any('webhook' in nt.lower() for nt in node_types):
            trigger_type = "Webhook"
        elif any('cron' in nt.lower() or 'schedule' in nt.lower() for nt in node_types):
            trigger_type = "Scheduled"
        
        # Start with trigger description
        if trigger_type == "Webhook":
            description_parts.append("Webhook-triggered automation that")
        elif trigger_type == "Scheduled":
            description_parts.append("Scheduled automation that")
        else:
            description_parts.append("Manual workflow that")
        
        # Add functionality based on integrations
        if integrations:
            # Get unique integrations
            unique_integrations = list(set(integrations))
            main_services = unique_integrations[:3]
            
            if len(main_services) == 1:
                description_parts.append(f"integrates with {main_services[0].title()}")
            elif len(main_services) == 2:
                description_parts.append(f"connects {main_services[0].title()} and {main_services[1].title()}")
            else:
                description_parts.append(f"orchestrates {', '.join([s.title() for s in main_services[:-1]])}, and {main_services[-1].title()}")
        
        # Add purpose based on filename and name
        purpose_hints = []
        filename_lower = filename.lower()
        name_lower = name.lower()
        
        if any(word in filename_lower for word in ['create', 'generate', 'make']):
            purpose_hints.append("to create new records")
        elif any(word in filename_lower for word in ['update', 'modify', 'edit']):
            purpose_hints.append("to update existing data")
        elif any(word in filename_lower for word in ['sync', 'synchronize']):
            purpose_hints.append("to synchronize data")
        elif any(word in filename_lower for word in ['notification', 'alert', 'notify']):
            purpose_hints.append("for notifications and alerts")
        elif any(word in filename_lower for word in ['backup', 'export']):
            purpose_hints.append("for data backup operations")
        elif any(word in filename_lower for word in ['monitor', 'track']):
            purpose_hints.append("for monitoring and reporting")
        elif any(word in filename_lower for word in ['process', 'analyze']):
            purpose_hints.append("for data processing")
        else:
            purpose_hints.append("for automated task execution")
        
        if purpose_hints:
            description_parts.append(purpose_hints[0])
        
        # Add node count information
        node_count = len(nodes)
        description_parts.append(f"using {node_count} processing nodes")
        
        # Add integration count if multiple
        if len(integrations) > 3:
            description_parts.append(f"across {len(set(integrations))} different services")
        
        # Join and format description
        description = " ".join(description_parts) + "."
        
        # Capitalize first letter
        description = description[0].upper() + description[1:]
        
        return description
    
    def enhance_workflow(self, file_path: Path) -> Dict[str, Any]:
        """Enhance a single workflow file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {'success': False, 'error': 'Invalid JSON or file not found'}
        
        enhancements = {
            'filename': file_path.name,
            'success': True,
            'changes': []
        }
        
        # Check if description needs enhancement
        current_description = data.get('description', '')
        
        # Generate new description if current one is missing or too short
        if not current_description or len(current_description.strip()) < 20:
            new_description = self.generate_description(data, file_path.name)
            data['description'] = new_description
            enhancements['changes'].append('Added description')
        
        # Ensure workflow has a meaningful name
        current_name = data.get('name', '')
        if not current_name or current_name.startswith('My workflow'):
            # Generate name from filename
            name_parts = file_path.stem.split('_')
            if len(name_parts) > 1 and name_parts[0].isdigit():
                name_parts = name_parts[1:]
            
            # Format name
            formatted_parts = []
            for part in name_parts:
                if part.lower() == 'http':
                    formatted_parts.append('HTTP')
                elif part.lower() == 'api':
                    formatted_parts.append('API')
                else:
                    formatted_parts.append(part.title())
            
            new_name = ' '.join(formatted_parts)
            data['name'] = new_name
            enhancements['changes'].append('Enhanced name')
        
        # Add tags if missing
        if 'tags' not in data or not data['tags']:
            # Generate tags based on integrations
            nodes = data.get('nodes', [])
            tags = []
            
            for node in nodes:
                node_type = node.get('type', '')
                if 'n8n-nodes-base.' in node_type:
                    service = node_type.replace('n8n-nodes-base.', '').lower()
                    service = re.sub(r'trigger$', '', service)
                    if service not in tags:
                        tags.append(service)
            
            if tags:
                data['tags'] = tags
                enhancements['changes'].append('Added tags')
        
        # Save enhanced workflow if changes were made
        if enhancements['changes']:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            except Exception as e:
                enhancements['success'] = False
                enhancements['error'] = f'Failed to save: {e}'
        
        return enhancements
    
    def enhance_all_workflows(self, limit: int = None) -> Dict[str, Any]:
        """Enhance all workflows in the directory"""
        json_files = list(self.workflows_dir.rglob("*.json"))
        
        if limit:
            json_files = json_files[:limit]
        
        results = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'enhanced': 0,
            'enhancements': []
        }
        
        print(f"📚 Enhancing documentation for {len(json_files)} workflows...")
        
        for i, file_path in enumerate(json_files):
            results['total_processed'] += 1
            
            enhancement = self.enhance_workflow(file_path)
            results['enhancements'].append(enhancement)
            
            if enhancement['success']:
                results['successful'] += 1
                if enhancement['changes']:
                    results['enhanced'] += 1
                    print(f"✅ Enhanced: {file_path.name} - {', '.join(enhancement['changes'])}")
            else:
                results['failed'] += 1
                print(f"❌ Failed: {file_path.name} - {enhancement.get('error', 'Unknown error')}")
            
            # Progress indicator
            if (i + 1) % 100 == 0:
                print(f"📈 Progress: {i + 1}/{len(json_files)} workflows processed...")
        
        return results
    
    def generate_enhancement_report(self, results: Dict[str, Any]) -> str:
        """Generate an enhancement report"""
        report = []
        report.append("📚 WORKFLOW DOCUMENTATION ENHANCEMENT REPORT")
        report.append("=" * 50)
        report.append(f"📊 Total Workflows Processed: {results['total_processed']}")
        report.append(f"✅ Successfully Enhanced: {results['enhanced']}")
        report.append(f"✅ Successfully Processed: {results['successful']}")
        report.append(f"❌ Failed: {results['failed']}")
        report.append("")
        
        # Enhancement statistics
        enhancement_types = {}
        for enhancement in results['enhancements']:
            for change in enhancement.get('changes', []):
                enhancement_types[change] = enhancement_types.get(change, 0) + 1
        
        if enhancement_types:
            report.append("🔧 ENHANCEMENT TYPES")
            report.append("-" * 25)
            for enhancement_type, count in sorted(enhancement_types.items(), key=lambda x: x[1], reverse=True):
                percentage = (count / results['total_processed']) * 100
                report.append(f"• {enhancement_type}: {count} workflows ({percentage:.1f}%)")
            report.append("")
        
        # Top enhanced workflows
        enhanced_workflows = [e for e in results['enhancements'] if e.get('changes')]
        if enhanced_workflows:
            report.append("⭐ TOP ENHANCED WORKFLOWS")
            report.append("-" * 30)
            for i, workflow in enumerate(enhanced_workflows[:20]):
                changes = ', '.join(workflow['changes'])
                report.append(f"{i+1:2d}. {workflow['filename']} - {changes}")
        
        return "\n".join(report)

def main():
    """Main execution function"""
    enhancer = DocumentationEnhancer()
    
    print("📚 Starting workflow documentation enhancement...")
    print("=" * 50)
    
    # Enhance all workflows
    results = enhancer.enhance_all_workflows()
    
    # Generate report
    report = enhancer.generate_enhancement_report(results)
    print("\n" + report)
    
    # Save report to file
    with open('documentation_enhancement_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📄 Report saved to: documentation_enhancement_report.txt")
    print(f"🎉 Documentation enhancement complete!")

if __name__ == "__main__":
    main()
