import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const prisma = new PrismaClient();

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
}

/**
 * Import all workflows from /workflows directory as public templates
 * Creates a "Public Templates" workspace for these workflows
 */
async function importPublicWorkflows() {
  console.log('🚀 Starting public workflow import...\n');

  const stats: ImportStats = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // 1. Find or create "Public Templates" workspace
    const publicWorkspace = await getOrCreatePublicWorkspace();
    console.log(`✓ Using workspace: ${publicWorkspace.name} (${publicWorkspace.id})\n`);

    // 2. Get workflow files
    const projectRoot = path.resolve(__dirname, '../../../..');
    const workflowsDir = path.join(projectRoot, 'workflows');
    
    if (!fs.existsSync(workflowsDir)) {
      throw new Error(`Workflows directory not found: ${workflowsDir}`);
    }

    // Find all JSON files recursively
    const files = await glob('**/*.json', { cwd: workflowsDir });
    stats.total = files.length;

    console.log(`📂 Found ${files.length} workflow files\n`);
    console.log('Importing workflows (this may take a few minutes)...\n');

    // 3. Import workflows in batches
    const batchSize = 50;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (file) => {
          try {
            const filePath = path.join(workflowsDir, file);
            await importWorkflowFile(
              filePath,
              file,
              publicWorkspace.id,
              publicWorkspace.ownerId
            );
            stats.imported++;
            
            if (stats.imported % 100 === 0) {
              console.log(`  Progress: ${stats.imported}/${stats.total}...`);
            }
          } catch (error: any) {
            stats.errors++;
            console.error(`  ✗ Error importing ${file}: ${error.message}`);
          }
        })
      );
    }

    // 4. Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary');
    console.log('='.repeat(60));
    console.log(`Total files:      ${stats.total}`);
    console.log(`Imported:         ${stats.imported} ✓`);
    console.log(`Errors:           ${stats.errors} ✗`);
    console.log(`Success rate:     ${((stats.imported / stats.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    // 5. Show some stats
    const workflowStats = await prisma.workflow.aggregate({
      where: { workspaceId: publicWorkspace.id },
      _count: true,
      _sum: {
        nodesCount: true,
      },
    });

    const categoryStats = await prisma.workflow.groupBy({
      by: ['category'],
      where: { workspaceId: publicWorkspace.id },
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    console.log('📈 Workflow Statistics:');
    console.log(`  Total workflows: ${workflowStats._count}`);
    console.log(`  Total nodes: ${workflowStats._sum.nodesCount || 0}`);
    console.log(`  Categories:`);
    categoryStats.forEach((cat) => {
      console.log(`    - ${cat.category || 'Uncategorized'}: ${cat._count} workflows`);
    });

    console.log('\n✅ Import completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get or create public templates workspace
 */
async function getOrCreatePublicWorkspace() {
  // Check if workspace exists
  let workspace = await prisma.workspace.findFirst({
    where: { slug: 'public-templates' },
  });

  if (workspace) {
    return workspace;
  }

  // Create system user for public workflows
  let systemUser = await prisma.user.findUnique({
    where: { email: 'system@autolanka.com' },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@autolanka.com',
        passwordHash: 'system', // Not used
        name: 'System',
        role: 'admin',
        isVerified: true,
      },
    });
  }

  // Get free plan
  const freePlan = await prisma.plan.findUnique({
    where: { slug: 'free' },
  });

  // Create workspace and membership
  const result = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name: 'Public Templates',
        slug: 'public-templates',
        ownerId: systemUser!.id,
        planId: freePlan?.id,
      },
    });

    await tx.membership.create({
      data: {
        userId: systemUser!.id,
        workspaceId: ws.id,
        role: 'owner',
        acceptedAt: new Date(),
      },
    });

    return ws;
  });

  return result;
}

/**
 * Import single workflow file
 */
async function importWorkflowFile(
  filePath: string,
  relativeFilePath: string,
  workspaceId: string,
  createdBy: string
) {
  // Read file
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);

  // Extract category from file path (e.g., "Communication/slack.json" -> "Communication")
  const parts = relativeFilePath.split(path.sep);
  const category = parts.length > 1 ? parts[0] : 'General';

  // Get workflow name from JSON or filename
  const name = json.name || path.basename(relativeFilePath, '.json')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  // Analyze workflow
  const analysis = analyzeWorkflow(json);

  // Check if already exists (by filename)
  const existing = await prisma.workflow.findFirst({
    where: {
      workspaceId,
      filename: relativeFilePath,
    },
  });

  if (existing) {
    // Update existing
    await prisma.workflow.update({
      where: { id: existing.id },
      data: {
        json,
        nodesCount: analysis.nodesCount,
        integrations: analysis.integrations,
        updatedAt: new Date(),
      },
    });
    return;
  }

  // Create new workflow
  await prisma.workflow.create({
    data: {
      name,
      filename: relativeFilePath,
      workspaceId,
      createdBy,
      json,
      active: true,
      public: true, // Public template
      category,
      tags: analysis.tags,
      nodesCount: analysis.nodesCount,
      integrations: analysis.integrations,
    },
  });
}

/**
 * Analyze workflow JSON
 */
function analyzeWorkflow(json: any) {
  const nodes = json.nodes || [];
  const nodesCount = nodes.length;

  // Extract integrations
  const integrations = Array.from(
    new Set(
      nodes
        .map((node: any) => {
          const type = node.type || '';
          const match = type.match(/\.([^.]+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    )
  ) as string[];

  // Generate tags
  const tags: string[] = [];
  
  // Add integration-based tags
  integrations.forEach((integration) => {
    tags.push(integration);
  });

  // Add trigger type tag
  const hasTrigger = nodes.some((n: any) => 
    n.type?.includes('trigger') || n.type?.includes('webhook')
  );
  if (hasTrigger) tags.push('trigger');

  // Add automation type tags
  if (integrations.some((i) => ['slack', 'discord', 'telegram'].includes(i))) {
    tags.push('notification');
  }
  if (integrations.some((i) => ['gmail', 'sendgrid', 'outlook'].includes(i))) {
    tags.push('email');
  }
  if (integrations.some((i) => ['sheets', 'airtable'].includes(i))) {
    tags.push('data');
  }

  return {
    nodesCount,
    integrations,
    tags: Array.from(new Set(tags)), // Remove duplicates
  };
}

// Run import
importPublicWorkflows();

