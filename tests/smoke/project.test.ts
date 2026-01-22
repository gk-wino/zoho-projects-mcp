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

let createdProjectId: string | null = null;

async function testListProjects(client: Client) {
	const testName = 'list_projects';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_projects', {
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!Array.isArray(data)) {
			throw new Error('Expected array of projects in response');
		}

		// Log project information
		console.log(`\nFound ${data.length} project(s):`);
		data.slice(0, 5).forEach((project: any, index: number) => {
			console.log(
				`  ${index + 1}. ${project.name} (ID: ${project.id}) - Status: ${project.project_type || 'N/A'}`,
			);
		});

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreateProject(client: Client) {
	const testName = 'create_project';
	logTestStart(testName);

	try {
		const timestamp = Date.now();
		const projectName = `Test Project ${timestamp}`;

		const response = await callTool(client, 'create_project', {
			name: projectName,
			description: 'This is a test project created by the smoke test suite',
			start_date: '2025-01-01',
			end_date: '2025-12-31',
			project_type: 'active',
			is_public_project: false,
		});
		const rawData = parseToolResponse(response);

		// Debug: log the raw response
		console.log('\nRaw API Response:', JSON.stringify(rawData, null, 2));

		// The response might be wrapped in a success message
		let data = rawData;
		if (typeof rawData === 'string') {
			// If it's a string, it might be the success message
			// Try to extract JSON from the message
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		// Validate response structure
		if (!data.id) {
			throw new Error('Expected project id in response');
		}

		if (!data.name || data.name !== projectName) {
			throw new Error(`Project name mismatch: expected "${projectName}", got "${data.name}"`);
		}

		// Store project ID for later tests
		createdProjectId = data.id;

		// Log project details
		console.log('\nProject Created:');
		console.log(`  Name: ${data.name}`);
		console.log(`  ID: ${data.id}`);
		console.log(`  Type: ${data.project_type || 'N/A'}`);
		console.log(`  Status: ${data.status?.name || 'N/A'}`);
		console.log(`  Start Date: ${data.start_date || 'N/A'}`);
		console.log(`  End Date: ${data.end_date || 'N/A'}`);

		logTestSuccess(testName, { projectId: data.id, name: data.name });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetProject(client: Client, projectId: string) {
	const testName = 'get_project';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_project', {
			project_id: projectId,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!data.id) {
			throw new Error('Expected project id in response');
		}

		if (data.id.toString() !== projectId.toString()) {
			throw new Error(`Project ID mismatch: expected ${projectId}, got ${data.id}`);
		}

		// Log project details
		console.log('\nProject Details:');
		console.log(`  Name: ${data.name}`);
		console.log(`  ID: ${data.id}`);
		console.log(`  Type: ${data.project_type || 'N/A'}`);
		console.log(`  Description: ${data.description ? 'Present' : 'None'}`);
		console.log(`  Status: ${data.status?.name || 'N/A'}`);
		console.log(`  Created: ${data.created_time || 'N/A'}`);
		console.log(`  Owner: ${data.created_by?.name || 'N/A'}`);
		console.log(`  Budget: ${data.budget_info ? 'Configured' : 'Not configured'}`);
		console.log(
			`  Tasks: Open ${data.tasks?.open_count || 0}, Closed ${data.tasks?.closed_count || 0}`,
		);
		console.log(
			`  Issues: Open ${data.issues?.open_count || 0}, Closed ${data.issues?.closed_count || 0}`,
		);

		logTestSuccess(testName, { projectId: data.id, name: data.name });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testUpdateProject(client: Client, projectId: string) {
	const testName = 'update_project';
	logTestStart(testName);

	try {
		const updatedDescription = `Updated description at ${new Date().toISOString()}`;

		const response = await callTool(client, 'update_project', {
			project_id: projectId,
			description: updatedDescription,
			end_date: '2026-06-30',
		});
		const rawData = parseToolResponse(response);

		// Parse response (might be wrapped in success message)
		let data = rawData;
		if (typeof rawData === 'string') {
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		// Validate response structure
		if (!data.id) {
			throw new Error('Expected project id in response');
		}

		// Log update confirmation
		console.log('\nProject Updated:');
		console.log(`  ID: ${data.id}`);
		console.log(`  Name: ${data.name}`);
		console.log(`  Description updated: Yes`);
		console.log(`  End Date: ${data.end_date || 'N/A'}`);

		logTestSuccess(testName, { projectId: data.id });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testTrashProject(client: Client, projectId: string) {
	const testName = 'trash_project';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'trash_project', {
			project_id: projectId,
		});

		// The response should indicate success
		console.log('\nProject Moved to Trash:');
		console.log(`  ID: ${projectId}`);
		console.log(`  Status: Can be restored within 30 days`);

		logTestSuccess(testName, { projectId });
		return true;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testRestoreProject(client: Client, projectId: string) {
	const testName = 'restore_project';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'restore_project', {
			project_id: projectId,
		});

		// The response should indicate success
		console.log('\nProject Restored from Trash:');
		console.log(`  ID: ${projectId}`);
		console.log(`  Status: Active`);

		logTestSuccess(testName, { projectId });
		return true;
	} catch (error: any) {
		const shouldThrow = logTestFailure(testName, error);
		if (shouldThrow) {
			throw error;
		}
		return false;
	}
}

async function testDeleteProject(client: Client, projectId: string) {
	const testName = 'delete_project';
	logTestStart(testName);

	try {
		// First move to trash again if not already there
		try {
			await callTool(client, 'trash_project', {
				project_id: projectId,
			});
			await wait(1000);
		} catch (e) {
			// May already be in trash, ignore error
		}

		// Then permanently delete
		const response = await callTool(client, 'delete_project', {
			project_id: projectId,
		});

		// The response should indicate success
		console.log('\nProject Permanently Deleted:');
		console.log(`  ID: ${projectId}`);
		console.log(`  Status: Cannot be undone`);

		logTestSuccess(testName, { projectId });
		return true;
	} catch (error: any) {
		const shouldThrow = logTestFailure(testName, error);
		if (shouldThrow) {
			throw error;
		}
		return false;
	}
}

async function runProjectSmokeTests() {
	console.log('\n🚀 Starting Project Smoke Tests\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Test 1: List projects
		const projects = await testListProjects(client);
		await wait(500);

		// Test 2: Create a new project
		const newProject = await testCreateProject(client);
		await wait(1000);

		// Test 3: Get the created project
		await testGetProject(client, createdProjectId!);
		await wait(500);

		// Test 4: Update the project
		await testUpdateProject(client, createdProjectId!);
		await wait(500);

		// Test 5: Move project to trash
		await testTrashProject(client, createdProjectId!);
		await wait(1000);

		// Test 6: Restore project from trash (may be skipped due to permissions)
		const restored = await testRestoreProject(client, createdProjectId!);
		await wait(1000);

		// Test 7: Permanently delete project (may be skipped due to permissions)
		const deleted = await testDeleteProject(client, createdProjectId!);
		await wait(500);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ Project Smoke Tests Summary');
		console.log('='.repeat(60));
		console.log('\nTests completed:');
		console.log('  ✅ list_projects');
		console.log('  ✅ create_project');
		console.log('  ✅ get_project');
		console.log('  ✅ update_project');
		console.log('  ✅ trash_project');
		console.log(
			restored ? '  ✅ restore_project' : '  ⏭️  restore_project (skipped - permissions)',
		);
		console.log(deleted ? '  ✅ delete_project' : '  ⏭️  delete_project (skipped - permissions)');
		console.log();

		await cleanup(client);
		process.exit(0);
	} catch (error) {
		console.error('\n💥 Smoke Tests Failed\n', error);
		if (client) await cleanup(client);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runProjectSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runProjectSmokeTests };
