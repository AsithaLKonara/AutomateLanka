
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔌 Verifying database connection...');
    try {
        await prisma.$connect();
        console.log('✅ Database connection successful!');

        // Optional: Check if migrations table exists or run a simple query
        const userCount = await prisma.user.count();
        console.log(`📊 Current user count: ${userCount}`);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
