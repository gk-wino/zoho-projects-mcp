#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	loadEnv,
	createMcpClient,
	initializeTestEnvironment,
	callTool,
	parseToolResponse,
	cleanup,
	wait,
} from './utils.js';

/**
 * This script creates a test task that you can manually edit in Zoho portal,
 * then reads it back to inspect the HTML structure
 */
async function runInspectTask() {
	console.log('\n🔍 Task Inspector Script\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Initialize test environment (get or create test project)
		const testProject = await initializeTestEnvironment(client);
		console.log();

		// Generate a unique identifier
		const uniqueId = `INSPECT-${Date.now()}`;

		// Check if we should create or read
		const action = process.argv[2] || 'create';

		if (action === 'create') {
			// Create a task with a unique name
			console.log('📝 Creating test task...\n');

			const response = await callTool(client, 'create_task', {
				project_id: testProject.projectId,
				name: `${uniqueId} - Manual Edit Task`,
				description:
					'<p>This task is ready for you to edit. Please add multiline code examples in the Zoho portal.</p>',
				priority: 'high',
			});

			let data = parseToolResponse(response);
			if (typeof data === 'string') {
				const jsonMatch = data.match(/\{[\s\S]*\}/);
				if (jsonMatch) data = JSON.parse(jsonMatch[0]);
			}

			console.log('✅ Task created successfully!');
			console.log(`\nTask ID: ${data.id}`);
			console.log(`Task Name: ${data.name}`);
			console.log(`\n📋 Instructions:`);
			console.log('1. Go to your Zoho Projects portal');
			console.log('2. Find the task named:', data.name);
			console.log(
				'3. Edit the task description and add multiline code examples using the WYSIWYG editor',
			);
			console.log('4. Save the changes');
			console.log(`5. Run: npm run inspect:task -- read ${data.id}`);
			console.log(`\n💡 Or just run: npm run inspect:task -- read\n`);
		} else if (action === 'read') {
			// Read the task back
			const taskId = process.argv[3];

			if (!taskId) {
				console.log('❌ Please provide a task ID');
				console.log('Usage: npm run inspect:task -- read <task_id>');
				process.exit(1);
			}

			console.log(`📖 Reading task ${taskId}...\n`);

			const response = await callTool(client, 'get_task', {
				project_id: testProject.projectId,
				task_id: taskId,
			});

			const data = parseToolResponse(response);

			console.log('✅ Task retrieved successfully!\n');
			console.log('='.repeat(80));
			console.log('TASK DETAILS');
			console.log('='.repeat(80));
			console.log(`Name: ${data.name}`);
			console.log(`Priority: ${data.priority}`);
			console.log(`\n${'='.repeat(80)}`);
			console.log('DESCRIPTION (HTML)');
			console.log('='.repeat(80));
			console.log(data.description);
			console.log('='.repeat(80));

			// Also try to extract and show code blocks specifically
			if (data.description) {
				const codeBlockMatches = data.description.match(/<pre[^>]*>[\s\S]*?<\/pre>/gi);
				if (codeBlockMatches) {
					console.log('\n' + '='.repeat(80));
					console.log('EXTRACTED CODE BLOCKS');
					console.log('='.repeat(80));
					codeBlockMatches.forEach((block, index) => {
						console.log(`\n--- Code Block ${index + 1} ---`);
						console.log(block);
					});
					console.log('='.repeat(80));
				}
			}

			console.log('\n💾 Full task object saved to console above');
			console.log('\n📝 You can now copy the HTML structure and use it in your tests!\n');
		} else if (action === 'list') {
			// List all INSPECT tasks
			console.log('📋 Listing all INSPECT tasks...\n');

			const response = await callTool(client, 'list_tasks', {
				project_id: testProject.projectId,
				page: 1,
				per_page: 50,
			});

			const data = parseToolResponse(response);

			if (data.tasks && Array.isArray(data.tasks)) {
				const inspectTasks = data.tasks.filter(
					(task: any) => task.name.includes('INSPECT-') || task.name.includes('Manual Edit Task'),
				);

				if (inspectTasks.length === 0) {
					console.log('No INSPECT tasks found.');
				} else {
					console.log(`Found ${inspectTasks.length} INSPECT task(s):\n`);
					inspectTasks.forEach((task: any, index: number) => {
						console.log(`${index + 1}. ${task.name}`);
						console.log(`   ID: ${task.id}`);
						console.log(`   Created: ${task.created_time || 'N/A'}`);
						console.log('');
					});
					console.log(`\nTo read a task, run: npm run inspect:task -- read <task_id>`);
				}
			}
		} else if (action === 'delete') {
			// Delete the task
			const taskId = process.argv[3];

			if (!taskId) {
				console.log('❌ Please provide a task ID');
				console.log('Usage: npm run inspect:task -- delete <task_id>');
				process.exit(1);
			}

			console.log(`🗑️  Deleting task ${taskId}...\n`);

			await callTool(client, 'delete_task', {
				project_id: testProject.projectId,
				task_id: taskId,
			});

			console.log('✅ Task deleted successfully!\n');
		} else {
			console.log('❌ Invalid action. Use: create, read, list, or delete');
		}

		await cleanup(client);
		process.exit(0);
	} catch (error) {
		console.error('\n💥 Script Failed\n', error);
		if (client) await cleanup(client);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runInspectTask().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runInspectTask };
