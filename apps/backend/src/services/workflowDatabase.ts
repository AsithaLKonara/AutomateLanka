/**
 * Workflow Database Service
 * SQLite-based workflow indexer and search engine using better-sqlite3
 */

import Database from 'better-sqlite3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { createHash } from 'crypto';

export interface WorkflowMetadata {
  id?: number;
  filename: string;
  name: string;
  workflow_id?: string;
  active: boolean;
  description: string;
  trigger_type: string;
  complexity: string;
  node_count: number;
  integrations: string[];
  tags: string[];
  created_at?: string;
  updated_at?: string;
  file_hash?: string;
  file_size?: number;
  analyzed_at?: string;
}

export interface WorkflowStats {
  total: number;
  active: number;
  inactive: number;
  triggers: Record<string, number>;
  complexity: Record<string, number>;
  total_nodes: number;
  unique_integrations: number;
  last_indexed: string;
}

export interface SearchOptions {
  query?: string;
  trigger?: string;
  complexity?: string;
  active_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface SearchResult {
  workflows: WorkflowMetadata[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export class WorkflowDatabase {
  private db: Database.Database;
  private workflowsDir: string;

  constructor(dbPath: string = 'database/workflows.db', workflowsDir: string = 'workflows') {
    this.db = new Database(dbPath);
    this.workflowsDir = workflowsDir;
    this.initDatabase();
  }

  /**
   * Initialize database with optimized schema and indexes
   */
  private initDatabase(): void {
    // Enable performance optimizations
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 10000');
    this.db.pragma('temp_store = MEMORY');

    // Create main workflows table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        workflow_id TEXT,
        active BOOLEAN DEFAULT 0,
        description TEXT,
        trigger_type TEXT,
        complexity TEXT,
        node_count INTEGER DEFAULT 0,
        integrations TEXT,
        tags TEXT,
        created_at TEXT,
        updated_at TEXT,
        file_hash TEXT,
        file_size INTEGER,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS workflows_fts USING fts5(
        filename,
        name,
        description,
        integrations,
        tags,
        content=workflows,
        content_rowid=id
      )
    `);

    // Create indexes for fast filtering
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trigger_type ON workflows(trigger_type);
      CREATE INDEX IF NOT EXISTS idx_complexity ON workflows(complexity);
      CREATE INDEX IF NOT EXISTS idx_active ON workflows(active);
      CREATE INDEX IF NOT EXISTS idx_node_count ON workflows(node_count);
      CREATE INDEX IF NOT EXISTS idx_filename ON workflows(filename);
    `);

    // Create triggers to keep FTS table in sync
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS workflows_ai AFTER INSERT ON workflows BEGIN
        INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
        VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
      END;

      CREATE TRIGGER IF NOT EXISTS workflows_ad AFTER DELETE ON workflows BEGIN
        INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
        VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
      END;

      CREATE TRIGGER IF NOT EXISTS workflows_au AFTER UPDATE ON workflows BEGIN
        INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
        VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
        INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
        VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
      END;
    `);
  }

  /**
   * Analyze a single workflow file
   */
  private analyzeWorkflow(filePath: string): WorkflowMetadata | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const workflow = JSON.parse(content);
      const stats = statSync(filePath);

      // Get basic metadata
      const name = workflow.name || basename(filePath, '.json');
      const active = workflow.active ?? workflow.meta?.status === 'active' ?? false;
      const description = workflow.description || workflow.meta?.description || '';

      // Count nodes and extract integrations
      const nodes = workflow.nodes || [];
      const nodeCount = nodes.length;
      const integrations = [...new Set(
        nodes
          .map((node: any) => node.type?.replace('n8n-nodes-base.', '') || '')
          .filter((type: string) => type)
      )];

      // Determine trigger type
      let triggerType = 'Manual';
      const triggerNode = nodes.find((node: any) => 
        node.type?.includes('trigger') || 
        node.type?.includes('webhook')
      );

      if (triggerNode) {
        if (triggerNode.type?.includes('webhook')) {
          triggerType = 'Webhook';
        } else if (triggerNode.type?.includes('schedule') || triggerNode.type?.includes('cron')) {
          triggerType = 'Scheduled';
        } else if (nodes.length > 3 && integrations.length > 2) {
          triggerType = 'Complex';
        }
      }

      // Determine complexity
      let complexity = 'low';
      if (nodeCount > 10 || integrations.length > 5) {
        complexity = 'high';
      } else if (nodeCount > 5 || integrations.length > 2) {
        complexity = 'medium';
      }

      // Extract tags
      const tags = workflow.tags || workflow.meta?.category ? [workflow.meta.category] : [];

      // Calculate file hash
      const fileHash = createHash('md5').update(content).digest('hex');

      return {
        filename: basename(filePath),
        name,
        workflow_id: workflow.id || workflow.meta?.instanceId,
        active,
        description,
        trigger_type: triggerType,
        complexity,
        node_count: nodeCount,
        integrations,
        tags,
        created_at: workflow.createdAt || workflow.meta?.createdAt || new Date().toISOString(),
        updated_at: workflow.updatedAt || workflow.meta?.updatedAt || new Date().toISOString(),
        file_hash: fileHash,
        file_size: stats.size,
      };
    } catch (error) {
      console.error(`Error analyzing workflow ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Index all workflows from the workflows directory
   */
  public indexAllWorkflows(forceReindex: boolean = false): { processed: number; added: number; updated: number; errors: number } {
    const stats = { processed: 0, added: 0, updated: 0, errors: 0 };

    const insertStmt = this.db.prepare(`
      INSERT INTO workflows (
        filename, name, workflow_id, active, description, trigger_type,
        complexity, node_count, integrations, tags, created_at, updated_at,
        file_hash, file_size
      ) VALUES (
        @filename, @name, @workflow_id, @active, @description, @trigger_type,
        @complexity, @node_count, @integrations, @tags, @created_at, @updated_at,
        @file_hash, @file_size
      )
      ON CONFLICT(filename) DO UPDATE SET
        name = @name,
        workflow_id = @workflow_id,
        active = @active,
        description = @description,
        trigger_type = @trigger_type,
        complexity = @complexity,
        node_count = @node_count,
        integrations = @integrations,
        tags = @tags,
        updated_at = @updated_at,
        file_hash = @file_hash,
        file_size = @file_size,
        analyzed_at = CURRENT_TIMESTAMP
    `);

    const findWorkflows = (dir: string): string[] => {
      const results: string[] = [];
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findWorkflows(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          results.push(fullPath);
        }
      }

      return results;
    };

    const workflowFiles = findWorkflows(this.workflowsDir);

    const transaction = this.db.transaction((files: string[]) => {
      for (const file of files) {
        try {
          const metadata = this.analyzeWorkflow(file);
          if (metadata) {
            insertStmt.run({
              ...metadata,
              active: metadata.active ? 1 : 0, // Convert boolean to integer
              integrations: JSON.stringify(metadata.integrations),
              tags: JSON.stringify(metadata.tags),
            });
            stats.processed++;
            stats.added++;
          } else {
            stats.errors++;
          }
        } catch (error) {
          console.error(`Error indexing ${file}:`, error);
          stats.errors++;
        }
      }
    });

    transaction(workflowFiles);

    return stats;
  }

  /**
   * Search workflows with filters and pagination
   */
  public search(options: SearchOptions): SearchResult {
    const {
      query = '',
      trigger = 'all',
      complexity = 'all',
      active_only = false,
      page = 1,
      per_page = 20,
    } = options;

    let sql = 'SELECT * FROM workflows WHERE 1=1';
    const params: any = {};

    // Full-text search
    if (query) {
      sql = `
        SELECT w.* FROM workflows w
        INNER JOIN workflows_fts fts ON w.id = fts.rowid
        WHERE workflows_fts MATCH @query
      `;
      params.query = query;
    }

    // Filters
    if (trigger && trigger !== 'all') {
      sql += ' AND trigger_type = @trigger';
      params.trigger = trigger.charAt(0).toUpperCase() + trigger.slice(1);
    }

    if (complexity && complexity !== 'all') {
      sql += ' AND complexity = @complexity';
      params.complexity = complexity;
    }

    if (active_only) {
      sql += ' AND active = 1';
    }

    // Count total results
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const countResult = this.db.prepare(countSql).get(params) as { total: number };
    const total = countResult.total;

    // Add pagination
    sql += ' ORDER BY active DESC, node_count DESC LIMIT @limit OFFSET @offset';
    params.limit = per_page;
    params.offset = (page - 1) * per_page;

    // Execute query
    const rows = this.db.prepare(sql).all(params) as any[];

    const workflows: WorkflowMetadata[] = rows.map(row => ({
      ...row,
      active: Boolean(row.active),
      integrations: JSON.parse(row.integrations || '[]'),
      tags: JSON.parse(row.tags || '[]'),
    }));

    return {
      workflows,
      total,
      page,
      per_page,
      pages: Math.ceil(total / per_page),
    };
  }

  /**
   * Get workflow by filename
   */
  public getWorkflow(filename: string): WorkflowMetadata | null {
    const row = this.db
      .prepare('SELECT * FROM workflows WHERE filename = ?')
      .get(filename) as any;

    if (!row) return null;

    return {
      ...row,
      active: Boolean(row.active),
      integrations: JSON.parse(row.integrations || '[]'),
      tags: JSON.parse(row.tags || '[]'),
    };
  }

  /**
   * Get database statistics
   */
  public getStats(): WorkflowStats {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM workflows').get() as { count: number };
    const active = this.db.prepare('SELECT COUNT(*) as count FROM workflows WHERE active = 1').get() as { count: number };
    const inactive = this.db.prepare('SELECT COUNT(*) as count FROM workflows WHERE active = 0').get() as { count: number };

    const triggers = this.db.prepare('SELECT trigger_type, COUNT(*) as count FROM workflows GROUP BY trigger_type').all() as { trigger_type: string; count: number }[];
    const complexities = this.db.prepare('SELECT complexity, COUNT(*) as count FROM workflows GROUP BY complexity').all() as { complexity: string; count: number }[];

    const nodes = this.db.prepare('SELECT SUM(node_count) as total FROM workflows').get() as { total: number };

    // Get unique integrations count
    const allIntegrations = this.db.prepare('SELECT integrations FROM workflows').all() as { integrations: string }[];
    const uniqueIntegrations = new Set();
    allIntegrations.forEach(row => {
      const integrations = JSON.parse(row.integrations || '[]');
      integrations.forEach((integration: string) => uniqueIntegrations.add(integration));
    });

    const lastIndexed = this.db.prepare('SELECT MAX(analyzed_at) as last FROM workflows').get() as { last: string };

    return {
      total: total.count,
      active: active.count,
      inactive: inactive.count,
      triggers: triggers.reduce((acc, row) => ({ ...acc, [row.trigger_type]: row.count }), {}),
      complexity: complexities.reduce((acc, row) => ({ ...acc, [row.complexity]: row.count }), {}),
      total_nodes: nodes.total || 0,
      unique_integrations: uniqueIntegrations.size,
      last_indexed: lastIndexed.last || new Date().toISOString(),
    };
  }

  /**
   * Close database connection
   */
  public close(): void {
    this.db.close();
  }
}

