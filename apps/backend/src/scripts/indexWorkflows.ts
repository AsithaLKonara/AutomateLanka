/**
 * Index all workflows into the database
 * Run with: tsx src/scripts/indexWorkflows.ts
 */

import { WorkflowDatabase } from '../services/workflowDatabase';
import { join } from 'path';

async function main() {
  console.log('🚀 N8N Workflows Indexer');
  console.log('='.repeat(50));

  const dbPath = process.env.WORKFLOW_DB_PATH || join(process.cwd(), '../../database/workflows.db');
  const workflowsDir = join(process.cwd(), '../../workflows');

  console.log(`📂 Database: ${dbPath}`);
  console.log(`📂 Workflows directory: ${workflowsDir}`);
  console.log('');

  console.log('🔄 Initializing database...');
  const db = new WorkflowDatabase(dbPath, workflowsDir);

  console.log('📚 Indexing workflows...');
  const result = db.indexAllWorkflows(true);

  console.log('');
  console.log('✅ Indexing complete!');
  console.log('='.repeat(50));
  console.log(`📊 Processed: ${result.processed}`);
  console.log(`✅ Added/Updated: ${result.added}`);
  console.log(`❌ Errors: ${result.errors}`);
  console.log('');

  const stats = db.getStats();
  console.log('📈 Database Statistics:');
  console.log(`  Total workflows: ${stats.total}`);
  console.log(`  Active: ${stats.active}`);
  console.log(`  Inactive: ${stats.inactive}`);
  console.log(`  Total nodes: ${stats.total_nodes}`);
  console.log(`  Unique integrations: ${stats.unique_integrations}`);
  console.log('');

  console.log('Trigger types:');
  Object.entries(stats.triggers).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('');
  console.log('Complexity:');
  Object.entries(stats.complexity).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });

  db.close();
  console.log('');
  console.log('👋 Done!');
}

main().catch(console.error);

