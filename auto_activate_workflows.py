#!/usr/bin/env python3
"""
Automated Workflow Activator - Activate high-quality workflows automatically
"""

import json
import os
import glob
from pathlib import Path
from typing import Dict, List, Any

def activate_high_quality_workflows():
    """Activate workflows with quality score >= 80"""
    
    workflows_dir = Path("workflows")
    json_files = list(workflows_dir.rglob("*.json"))
    
    activated_count = 0
    total_processed = 0
    
    print(f"🚀 Automatically activating high-quality workflows...")
    print(f"📊 Processing {len(json_files)} workflows...")
    
    for file_path in json_files:
        total_processed += 1
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            continue
        
        # Check if workflow is already active
        if data.get('active', False):
            continue
        
        # Basic quality checks
        nodes = data.get('nodes', [])
        connections = data.get('connections', {})
        name = data.get('name', '')
        description = data.get('description', '')
        
        # Quality scoring
        quality_score = 0
        max_score = 100
        
        # Node count check (20 points)
        node_count = len(nodes)
        if 3 <= node_count <= 50:
            quality_score += 20
        elif node_count > 0:
            quality_score += 10
        
        # Has connections (20 points)
        if connections and isinstance(connections, dict):
            quality_score += 20
        
        # Has meaningful name (20 points)
        if name and not name.startswith('My workflow') and len(name) > 5:
            quality_score += 20
        
        # Has description (20 points)
        if description and len(description.strip()) > 10:
            quality_score += 20
        
        # Has required fields (20 points)
        if 'nodes' in data and 'connections' in data:
            quality_score += 20
        
        # Activate if quality score >= 80
        if quality_score >= 80:
            data['active'] = True
            
            # Save updated workflow
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            activated_count += 1
            
            if activated_count <= 10:  # Show first 10 activations
                print(f"✅ Activated: {file_path.name} (Score: {quality_score})")
            elif activated_count == 11:
                print("... (showing first 10 activations, continuing silently)")
        
        # Progress indicator
        if total_processed % 500 == 0:
            print(f"📈 Processed {total_processed}/{len(json_files)} workflows...")
    
    print(f"\n🎉 ACTIVATION COMPLETE!")
    print(f"📊 Total workflows processed: {total_processed}")
    print(f"✅ Workflows activated: {activated_count}")
    print(f"📈 Activation rate: {(activated_count/total_processed)*100:.1f}%")
    
    return activated_count

def update_database_stats():
    """Update database with new activation statistics"""
    try:
        # Reindex the database to reflect changes
        from workflow_db import WorkflowDatabase
        
        db = WorkflowDatabase()
        stats = db.get_stats()
        
        print(f"\n📊 Updated Database Statistics:")
        print(f"   Total workflows: {stats['total']}")
        print(f"   Active workflows: {stats['active']}")
        print(f"   Active rate: {(stats['active']/stats['total'])*100:.1f}%")
        
    except Exception as e:
        print(f"⚠️  Could not update database stats: {e}")

def main():
    """Main execution function"""
    print("🎯 AUTOMATED WORKFLOW ACTIVATION")
    print("=" * 40)
    
    # Activate high-quality workflows
    activated_count = activate_high_quality_workflows()
    
    # Update database
    update_database_stats()
    
    print(f"\n✨ SUCCESS: {activated_count} workflows have been activated!")
    print("🔄 The workflow database will be updated on next server restart.")

if __name__ == "__main__":
    main()
