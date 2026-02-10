import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { glob } from 'glob';

/**
 * Ingest Marketplace Workflows
 * Reads JSON workflow definitions from a directory and imports them into the DB
 */
async function ingestMarketplace() {
    console.log('🚀 Starting marketplace ingestion...');

    const marketplaceDir = path.join(__dirname, '../../../../workflows/marketplace');

    if (!fs.existsSync(marketplaceDir)) {
        console.error(`❌ Marketplace directory not found: ${marketplaceDir}`);
        return;
    }

    const files = await glob('**/*.json', { cwd: marketplaceDir });
    console.log(`📂 Found ${files.length} workflows to ingest.`);

    // Get a system user to "own" these workflows (e.g., the first admin)
    const systemUser = await prisma.user.findFirst({
        where: { role: 'admin' }
    });

    if (!systemUser) {
        console.error('❌ No admin user found to own workflows. Please create an admin user first.');
        return;
    }

    // Get the default workspace for the system user
    const workspace = await prisma.workspace.findFirst({
        where: { ownerId: systemUser.id }
    });

    if (!workspace) {
        console.error(`❌ No workspace found for admin user ${systemUser.id}`);
        return;
    }

    let count = 0;
    for (const file of files) {
        try {
            const filePath = path.join(marketplaceDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const workflowJson = JSON.parse(content);

            const name = workflowJson.name || path.basename(file, '.json');
            const nodes = workflowJson.nodes || [];
            const nodeTypes = Array.from(new Set(nodes.map((n: any) => n.type)));

            // Basic category detection
            let category = 'Utility';
            if (nodeTypes.includes('n8n-nodes-base.googleSheets')) category = 'Productivity';
            if (nodeTypes.includes('n8n-nodes-base.slack')) category = 'Communication';
            if (nodeTypes.includes('n8n-nodes-base.openAi')) category = 'AI';
            if (nodeTypes.includes('n8n-nodes-base.httpRequest')) category = 'API';

            await prisma.workflow.upsert({
                where: { id: workflowJson.id || undefined }, // Use ID if present, otherwise let Prisma generate
                update: {
                    name,
                    json: content,
                    nodesCount: nodes.length,
                    integrations: JSON.stringify(nodeTypes),
                    category,
                    active: false,
                    public: true,
                },
                create: {
                    id: workflowJson.id || undefined,
                    workspaceId: workspace.id,
                    name,
                    json: content,
                    nodesCount: nodes.length,
                    integrations: JSON.stringify(nodeTypes),
                    category,
                    createdBy: systemUser.id,
                    active: false,
                    public: true,
                    popularity: Math.floor(Math.random() * 100), // Random popularity for demo
                }
            });

            console.log(`✅ Ingested: ${name}`);
            count++;
        } catch (error) {
            console.error(`❌ Failed to ingest ${file}:`, error);
        }
    }

    console.log(`\n✨ Ingestion complete! ${count} workflows added/updated.`);
}

ingestMarketplace()
    .catch(err => {
        console.error('Fatal error during ingestion:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
