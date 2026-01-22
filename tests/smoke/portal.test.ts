#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	loadEnv,
	createMcpClient,
	callTool,
	parseToolResponse,
	logTestStart,
	logTestSuccess,
	logTestFailure,
	cleanup,
	wait,
} from './utils.js';

async function testListPortals(client: Client) {
	const testName = 'list_portals';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_portals');
		const data = parseToolResponse(response);

		// Validate response structure
		// Response is an array of portals directly
		if (!Array.isArray(data)) {
			throw new Error('Expected array of portals in response');
		}

		if (data.length === 0) {
			throw new Error('Expected at least one portal');
		}

		// Log portal information
		console.log(`\nFound ${data.length} portal(s):`);
		data.forEach((portal: any, index: number) => {
			console.log(`  ${index + 1}. ${portal.portal_name} (ID: ${portal.id})`);
		});

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPortal(client: Client, portalId: string) {
	const testName = 'get_portal';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_portal', { portal_id: portalId });
		const data = parseToolResponse(response);

		// Validate response structure
		// Response should be an object with portal_details property
		if (!data.portal_details) {
			throw new Error('Expected portal_details in response');
		}

		const portal = data.portal_details;

		// Validate portal has required fields
		if (!portal.id || !portal.name) {
			throw new Error('Portal missing required fields (id, name)');
		}

		// Verify portal ID matches
		if (portal.id.toString() !== portalId) {
			throw new Error(`Portal ID mismatch: expected ${portalId}, got ${portal.id}`);
		}

		// Log portal details
		console.log('\nPortal Details:');
		console.log(`  Name: ${portal.name}`);
		console.log(`  Organization: ${portal.org_name || 'N/A'}`);
		console.log(`  ID: ${portal.id}`);
		console.log(`  Owner: ${portal.owner?.full_name || 'N/A'}`);
		console.log(`  Timezone: ${portal.timezone || 'N/A'}`);
		console.log(`  Plan: ${portal.plan_details?.projects_service_plan || 'N/A'}`);

		if (portal.business_details) {
			console.log(`  Time Format: ${portal.business_details.time_format || 'N/A'}`);
			console.log(`  Date Format: ${portal.business_details.date_format || 'N/A'}`);
			console.log(
				`  Business Hours: ${portal.business_details.start_time} - ${portal.business_details.end_time}`,
			);
		}

		logTestSuccess(testName, { portalId: portal.id, name: portal.name });
		return portal;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function runPortalSmokeTests() {
	console.log('\n🚀 Starting Portal Smoke Tests\n');

	let client: Client | null = null;

	try {
		// Load environment variables
		console.log('📋 Loading environment variables...');
		const env = loadEnv();
		console.log(`✅ Environment loaded (Portal ID: ${env.portalId})`);

		// Build the project first
		console.log('\n🔨 Ensuring project is built...');
		await wait(500);

		// Create MCP client
		console.log('\n🔌 Connecting to MCP server...');
		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Test 1: List all portals
		const portals = await testListPortals(client);
		await wait(500);

		// Test 2: Get specific portal
		await testGetPortal(client, env.portalId);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All Portal Smoke Tests Passed!');
		console.log('='.repeat(60));
		console.log(`\n📊 Test Summary:`);
		console.log(`   Total Tests: 2`);
		console.log(`   Passed: 2`);
		console.log(`   Failed: 0`);
		console.log(`   Portal Validated: ${env.portalId}`);

		// Cleanup
		if (client) {
			await cleanup(client);
		}

		// Exit successfully
		process.exit(0);
	} catch (error) {
		console.error('\n' + '='.repeat(60));
		console.error('💥 Smoke Tests Failed');
		console.error('='.repeat(60));
		console.error('\nError:', error);

		// Cleanup
		if (client) {
			await cleanup(client);
		}

		// Exit with error
		process.exit(1);
	}
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runPortalSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runPortalSmokeTests };
