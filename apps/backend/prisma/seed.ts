import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Plans
  const plans = [
    {
      name: 'Free',
      slug: 'free',
      priceMonthly: 0,
      priceYearly: 0,
      runsPerMonth: 100,
      maxWorkflows: 5,
      maxMembers: 1,
      features: {
        smartSearch: true,
        publicWorkflows: true,
        basicIntegrations: true,
        emailSupport: false,
        priorityQueue: false,
        customDomain: false,
        sso: false,
        apiAccess: false,
      },
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 29,
      priceYearly: 290, // ~20% discount
      runsPerMonth: 10000,
      maxWorkflows: 100,
      maxMembers: 10,
      features: {
        smartSearch: true,
        publicWorkflows: true,
        basicIntegrations: true,
        premiumIntegrations: true,
        emailSupport: true,
        priorityQueue: true,
        customDomain: false,
        sso: false,
        apiAccess: true,
        webhooks: true,
        scheduledWorkflows: true,
      },
    },
    {
      name: 'Business',
      slug: 'business',
      priceMonthly: 99,
      priceYearly: 990, // ~20% discount
      runsPerMonth: 100000,
      maxWorkflows: -1, // unlimited
      maxMembers: -1, // unlimited
      features: {
        smartSearch: true,
        publicWorkflows: true,
        basicIntegrations: true,
        premiumIntegrations: true,
        emailSupport: true,
        priorityQueue: true,
        customDomain: true,
        sso: true,
        apiAccess: true,
        webhooks: true,
        scheduledWorkflows: true,
        dedicatedSupport: true,
        sla: true,
        customIntegrations: true,
      },
    },
  ];

  for (const plan of plans) {
    const data = {
      ...plan,
      features: JSON.stringify(plan.features),
    };
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: data,
      create: data,
    });
    console.log(`✓ Created/Updated plan: ${plan.name}`);
  }

  console.log('✓ Seeding completed!');

  // Seed Test User for E2E
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: await import('bcryptjs').then(b => b.default.hashSync('SecurePass123!', 10)),
    },
  });
  console.log(`✓ Created/Updated test user: ${testUser.email}`);

  // Create workspace for test user if not exists
  const testWorkspace = await prisma.workspace.upsert({
    where: { slug: 'test-workspace' },
    update: {},
    create: {
      name: 'Test Workspace',
      slug: 'test-workspace',
      ownerId: testUser.id,
    },
  });
  console.log(`✓ Created/Updated test workspace: ${testWorkspace.name}`);

  // Add user to workspace
  await prisma.membership.upsert({
    where: {
      id: 'test-membership-id',
    },
    update: {
      acceptedAt: new Date(),
    },
    create: {
      id: 'test-membership-id',
      workspaceId: testWorkspace.id,
      userId: testUser.id,
      role: 'ADMIN',
      acceptedAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

