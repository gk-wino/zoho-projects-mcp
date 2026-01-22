#!/usr/bin/env npx tsx

/**
 * Test the initializeTestEnvironment utility
 */

import { loadEnv, createMcpClient, initializeTestEnvironment, cleanup } from './utils.js';

async function testInitEnvironment() {
	console.log('🧪 Testing Test Environment Initialization\n');

	try {
		// Load environment
		console.log('Loading environment...');
		loadEnv();
		console.log('✅ Environment loaded\n');

		// Create MCP client
		console.log('Connecting to MCP server...');
		const client = await createMcpClient();
		console.log('✅ Connected to MCP server\n');

		// Test initialization (should create or find cached project)
		console.log('Initializing test environment...');
		const testProject = await initializeTestEnvironment(client);

		console.log('\n' + '='.repeat(60));
		console.log('✨ Test Project Details');
		console.log('='.repeat(60));
		console.log(`  Name: ${testProject.projectName}`);
		console.log(`  ID: ${testProject.projectId}`);
		if (testProject.projectKey) {
			console.log(`  Key: ${testProject.projectKey}`);
		}
		console.log();

		// Test second call (should use cache)
		console.log('Testing cache (second call)...');
		const cachedProject = await initializeTestEnvironment(client);
		console.log();

		// Verify cache works
		if (
			cachedProject.projectId === testProject.projectId &&
			cachedProject.projectName === testProject.projectName
		) {
			console.log('✅ Cache working correctly - same project returned\n');
		} else {
			console.error('❌ Cache error - different project returned\n');
		}

		// Cleanup
		await cleanup(client);
		console.log('\n✨ Test completed successfully!');
	} catch (error) {
		console.error('\n❌ Test failed:', error);
		process.exit(1);
	}
}

testInitEnvironment();
