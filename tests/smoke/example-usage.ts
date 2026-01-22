#!/usr/bin/env npx tsx

/**
 * Example: Using initializeTestEnvironment in task list tests
 *
 * This demonstrates how to use the persistent test project for testing
 * task lists and other features that require a project context.
 */

import {
	loadEnv,
	createMcpClient,
	initializeTestEnvironment,
	callTool,
	parseToolResponse,
	logTestStart,
	logTestSuccess,
	cleanup,
} from './utils.js';

async function exampleTaskListTest() {
	console.log('🚀 Example: Task List Test with Test Environment\n');

	try {
		loadEnv();
		const client = await createMcpClient();

		// Initialize test environment (uses cache if available)
		const testProject = await initializeTestEnvironment(client);
		console.log();

		// Now you can use testProject.projectId for testing
		logTestStart('list_tasklists');

		const response = await callTool(client, 'list_tasklists', {
			project_id: testProject.projectId,
			page: 1,
			per_page: 10,
		});

		const tasklists = parseToolResponse(response);
		console.log(`Found ${Array.isArray(tasklists) ? tasklists.length : 0} task list(s)`);

		logTestSuccess('list_tasklists', {
			projectId: testProject.projectId,
			tasklistCount: Array.isArray(tasklists) ? tasklists.length : 0,
		});

		await cleanup(client);
		console.log('\n✨ Example completed!');
	} catch (error) {
		console.error('\n❌ Example failed:', error);
		process.exit(1);
	}
}

// Uncomment to run this example:
// exampleTaskListTest();

export { exampleTaskListTest };
