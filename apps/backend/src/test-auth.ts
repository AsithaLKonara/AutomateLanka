/**
 * Quick test script to verify database and authentication setup
 */
import { PrismaClient } from '@prisma/client';
import { authService } from './services/authService';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function testDatabaseSetup() {
  console.log('\n🔍 Testing Database Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');

    // Test 2: Check Plans Table
    console.log('2. Checking plans table...');
    const plans = await prisma.plan.findMany();
    console.log(`   ✅ Found ${plans.length} plans:`);
    plans.forEach(plan => {
      console.log(`      - ${plan.name}: $${plan.priceMonthly}/month`);
    });
    console.log();

    // Test 3: Register a Test User
    console.log('3. Testing user registration...');
    const testEmail = `test${Date.now()}@autolanka.com`;
    const registrationResult = await authService.register({
      email: testEmail,
      password: 'SecurePassword123!',
      name: 'Test User',
      workspaceName: 'Test Workspace',
    });

    console.log('   ✅ User registered successfully!');
    console.log(`      User ID: ${registrationResult.user.id}`);
    console.log(`      Email: ${registrationResult.user.email}`);
    console.log(`      Workspace: ${registrationResult.workspace.name}`);
    console.log(`      Workspace ID: ${registrationResult.workspace.id}`);
    console.log();

    // Test 4: Login with the User
    console.log('4. Testing user login...');
    const loginResult = await authService.login({
      email: testEmail,
      password: 'SecurePassword123!',
    });

    console.log('   ✅ User logged in successfully!');
    console.log(`      Access Token: ${loginResult.accessToken.substring(0, 30)}...`);
    console.log(`      Refresh Token: ${loginResult.refreshToken.substring(0, 30)}...`);
    console.log(`      Workspace ID: ${loginResult.workspace.id}`);
    console.log();

    // Test 5: Verify Token Refresh
    console.log('5. Testing token refresh...');
    const refreshResult = await authService.refreshToken(loginResult.refreshToken);

    console.log('   ✅ Token refreshed successfully!');
    console.log(`      New Access Token: ${refreshResult.accessToken.substring(0, 30)}...`);
    console.log();

    // Test 6: Get User Count
    console.log('6. Checking database stats...');
    const userCount = await prisma.user.count();
    const workspaceCount = await prisma.workspace.count();
    console.log(`   ✅ Total users: ${userCount}`);
    console.log(`   ✅ Total workspaces: ${workspaceCount}`);
    console.log();

    console.log('🎉 All tests passed! Authentication system is working correctly.\n');
    console.log('✅ Ready to start the server and test via API endpoints.\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testDatabaseSetup()
  .then(() => {
    console.log('✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });

