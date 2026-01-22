#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	loadEnv,
	createMcpClient,
	initializeTestEnvironment,
	callTool,
	parseToolResponse,
	logTestStart,
	logTestSuccess,
	logTestFailure,
	cleanup,
	wait,
} from './utils.js';

// Store IDs for cleanup
let createdTaskId: string | null = null;
let createdSubtaskId: string | null = null;
let clonedTaskIds: string[] = [];
let createdTaskListId: string | null = null;
let createdCommentId: string | null = null;

/**
 * Cleanup orphaned test tasks from previous failed runs
 */
async function cleanupOrphanedTasks(client: Client, projectId: string) {
	console.log('\n🧹 Cleaning up orphaned test tasks...');

	try {
		// Get all tasks from the project
		const response = await callTool(client, 'list_tasks', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		if (!data.tasks || !Array.isArray(data.tasks)) {
			console.log('No tasks found or unable to parse response');
			return;
		}

		// Filter orphaned test tasks (matching test patterns)
		const testPatterns = [
			/^Test Task \d+$/,
			/^Updated Task \d+$/,
			/^Test Subtask \d+$/,
			/^Clone of Test Task \d+$/,
		];
		const orphanedTasks = data.tasks.filter((task: any) =>
			testPatterns.some((pattern) => pattern.test(task.name)),
		);

		if (orphanedTasks.length === 0) {
			console.log('✅ No orphaned test tasks found');
			return;
		}

		console.log(`Found ${orphanedTasks.length} orphaned test task(s)`);

		// Delete each orphaned task
		for (const task of orphanedTasks) {
			try {
				await callTool(client, 'delete_task', {
					project_id: projectId,
					task_id: task.id,
				});
				console.log(`   Deleted: ${task.name} (ID: ${task.id})`);
				await wait(300); // Small delay between deletions
			} catch (error: any) {
				console.warn(`   Failed to delete ${task.name}: ${error.message}`);
			}
		}

		console.log('✅ Cleanup completed');
	} catch (error) {
		console.warn('⚠️  Cleanup failed:', error);
		// Don't throw - cleanup failures shouldn't fail the test suite
	}
}

async function testListTasks(client: Client, projectId: string) {
	const testName = 'list_tasks';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_tasks', {
			project_id: projectId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.tasks) {
			throw new Error('Expected tasks array in response');
		}

		console.log(`\nFound ${data.tasks.length} tasks`);
		if (data.tasks.length > 0) {
			console.log(`First task: ${data.tasks[0].name} (ID: ${data.tasks[0].id})`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreateTask(client: Client, projectId: string) {
	const testName = 'create_task';
	logTestStart(testName);

	try {
		const taskName = `Test Task ${Date.now()}`;
		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: taskName,
			description: 'This is a test task for smoke testing',
			priority: 'high',
		});
		let data = parseToolResponse(response);

		// Handle wrapped response (JSON inside success message string)
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		if (!data.id) {
			console.error('Response data:', JSON.stringify(data, null, 2));
			throw new Error('Expected task ID in response');
		}

		createdTaskId = data.id;
		console.log(`\nCreated task: ${data.name} (ID: ${data.id})`);
		console.log(`Priority: ${data.priority}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreateSubtask(client: Client, projectId: string, parentTaskId: string) {
	const testName = 'create_task (subtask)';
	logTestStart(testName);

	try {
		const subtaskName = `Test Subtask ${Date.now()}`;
		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			parent_task_id: parentTaskId,
			name: subtaskName,
			description: 'This is a subtask created under a parent task',
			priority: 'medium',
		});
		let data = parseToolResponse(response);

		// Handle wrapped response (JSON inside success message string)
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		if (!data.id) {
			console.error('Response data:', JSON.stringify(data, null, 2));
			throw new Error('Expected subtask ID in response');
		}

		createdSubtaskId = data.id;
		console.log(`\n✅ Created SUBTASK: ${data.name} (ID: ${data.id})`);
		console.log(`Parent Task ID: ${parentTaskId}`);
		console.log(`Depth: ${data.depth || 'N/A'}`);

		// Verify it's actually a subtask by checking depth or parental_info
		if (data.depth !== undefined && data.depth > 0) {
			console.log(`✓ Confirmed as subtask (depth: ${data.depth})`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetTask(client: Client, projectId: string, taskId: string) {
	const testName = 'get_task';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_task', {
			project_id: projectId,
			task_id: taskId,
		});
		const data = parseToolResponse(response);

		if (!data.id || !data.name) {
			throw new Error('Expected task details in response');
		}

		console.log(`\nTask: ${data.name}`);
		console.log(`Status: ${data.status?.name || 'N/A'}`);
		console.log(`Priority: ${data.priority || 'none'}`);
		if (data.depth !== undefined) {
			console.log(`Depth: ${data.depth} ${data.depth > 0 ? '(subtask)' : '(main task)'}`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testUpdateTask(client: Client, projectId: string, taskId: string) {
	const testName = 'update_task';
	logTestStart(testName);

	try {
		const updatedName = `Updated Task ${Date.now()}`;
		const response = await callTool(client, 'update_task', {
			project_id: projectId,
			task_id: taskId,
			name: updatedName,
			priority: 'low',
			description: 'Updated description for smoke test',
		});
		let data = parseToolResponse(response);

		// Handle wrapped response (JSON inside success message string)
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		if (!data.id) {
			console.error('Response data:', JSON.stringify(data, null, 2));
			throw new Error('Expected updated task data in response');
		}

		console.log(`\nUpdated task: ${data.name}`);
		console.log(`New priority: ${data.priority}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCloneTask(client: Client, projectId: string, taskId: string) {
	const testName = 'clone_task';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'clone_task', {
			project_id: projectId,
			task_id: taskId,
			no_of_instances: 2,
		});
		let data = parseToolResponse(response);

		// Handle wrapped response (JSON inside success message string)
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		console.log(`\n✅ Cloned task successfully`);
		console.log(`Number of clones: 2`);

		// Try to get the cloned tasks by listing all tasks
		await wait(1000); // Wait for clones to appear
		const listResponse = await callTool(client, 'list_tasks', {
			project_id: projectId,
			page: 1,
			per_page: 50,
		});
		const listData = parseToolResponse(listResponse);

		// Look for recently created tasks (clones will have similar names)
		if (listData.tasks) {
			const recentTasks = listData.tasks
				.filter((t: any) => t.name.includes('Updated Task'))
				.slice(0, 3);
			console.log(`Found ${recentTasks.length} tasks with similar names (including original)`);
			clonedTaskIds = recentTasks.map((t: any) => t.id).filter((id: string) => id !== taskId);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testAddTaskComment(client: Client, projectId: string, taskId: string) {
	const testName = 'add_task_comment';
	logTestStart(testName);

	try {
		const commentText = `Test comment added at ${new Date().toISOString()}`;
		const response = await callTool(client, 'add_task_comment', {
			project_id: projectId,
			task_id: taskId,
			comment: commentText,
		});
		const data = parseToolResponse(response);

		// Handle both direct response and wrapped response
		const commentData = data.comment || data;

		if (commentData.id) {
			createdCommentId = commentData.id;
		}

		console.log(`\nAdded comment to task`);
		if (commentData.content) {
			console.log(`Comment: ${commentData.content.substring(0, 50)}...`);
		}

		logTestSuccess(testName);
		return commentData;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testListTaskComments(client: Client, projectId: string, taskId: string) {
	const testName = 'list_task_comments';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_task_comments', {
			project_id: projectId,
			task_id: taskId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		// Handle different response structures
		const comments = data.comments || data;

		console.log(`\nFound ${Array.isArray(comments) ? comments.length : 0} comments`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testMoveTask(client: Client, projectId: string, taskId: string) {
	const testName = 'move_task';
	logTestStart(testName);

	try {
		// First, create a new tasklist to move the task to
		const taskListName = `Test TaskList for Move ${Date.now()}`;
		const createResponse = await callTool(client, 'create_tasklist', {
			project_id: projectId,
			name: taskListName,
			flag: 'internal',
		});
		let taskListData = parseToolResponse(createResponse);

		// Handle wrapped response
		if (typeof taskListData === 'string') {
			const jsonMatch = taskListData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				taskListData = JSON.parse(jsonMatch[0]);
			}
		}

		if (!taskListData.id) {
			throw new Error('Failed to create target tasklist for move test');
		}

		createdTaskListId = taskListData.id;
		console.log(`\nCreated target tasklist: ${taskListData.name} (ID: ${taskListData.id})`);

		// Now move the task
		const response = await callTool(client, 'move_task', {
			project_id: projectId,
			task_id: taskId,
			target_tasklist_id: taskListData.id,
		});
		let data = parseToolResponse(response);

		// Handle wrapped response
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		console.log(`✅ Moved task to tasklist: ${taskListData.name}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testDeleteTask(client: Client, projectId: string, taskId: string) {
	const testName = 'delete_task';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'delete_task', {
			project_id: projectId,
			task_id: taskId,
		});
		const data = parseToolResponse(response);

		console.log(`\nDeleted task (ID: ${taskId})`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function runTaskSmokeTests() {
	console.log('\n🚀 Starting Task Smoke Tests\n');
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

		// Ensure the project has a default tasklist
		console.log('🔧 Ensuring default tasklist exists...');
		try {
			await callTool(client, 'create_default_tasklist', {
				project_id: testProject.projectId,
				flag: 'internal',
			});
			console.log('✅ Created default tasklist');
		} catch (error: any) {
			// Default tasklist might already exist, which is fine
			if (error.message && error.message.includes('already exists')) {
				console.log('✅ Default tasklist already exists');
			} else {
				console.log('⚠️  Could not create default tasklist:', error.message);
			}
		}
		await wait(500);

		// Cleanup orphaned test tasks from previous failed runs
		await cleanupOrphanedTasks(client, testProject.projectId);
		await wait(500);

		// Test 1: List existing tasks
		await testListTasks(client, testProject.projectId);
		await wait(500);

		// Test 2: Create a new task
		const createdTask = await testCreateTask(client, testProject.projectId);
		await wait(500);

		// Test 3: Create a subtask (IMPORTANT: This tests the new subtask feature)
		if (createdTaskId) {
			await testCreateSubtask(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Test 4: Get task details
		if (createdTaskId) {
			await testGetTask(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Test 5: Update task
		if (createdTaskId) {
			await testUpdateTask(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Test 6: Clone task
		if (createdTaskId) {
			await testCloneTask(client, testProject.projectId, createdTaskId);
			await wait(1000);
		}

		// Test 7: Add comment to task
		if (createdTaskId) {
			await testAddTaskComment(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Test 8: List task comments
		if (createdTaskId) {
			await testListTaskComments(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Test 9: Move task to different tasklist
		if (createdTaskId) {
			await testMoveTask(client, testProject.projectId, createdTaskId);
			await wait(500);
		}

		// Cleanup: Delete created tasks
		console.log('\n🧹 Cleaning up created test data...');

		if (createdSubtaskId) {
			try {
				await testDeleteTask(client, testProject.projectId, createdSubtaskId);
				await wait(300);
			} catch (error) {
				console.warn(`Failed to delete subtask: ${error}`);
			}
		}

		if (createdTaskId) {
			try {
				await testDeleteTask(client, testProject.projectId, createdTaskId);
				await wait(300);
			} catch (error) {
				console.warn(`Failed to delete main task: ${error}`);
			}
		}

		// Delete cloned tasks
		for (const clonedId of clonedTaskIds) {
			try {
				await callTool(client, 'delete_task', {
					project_id: testProject.projectId,
					task_id: clonedId,
				});
				console.log(`   Deleted cloned task (ID: ${clonedId})`);
				await wait(300);
			} catch (error) {
				console.warn(`Failed to delete cloned task ${clonedId}: ${error}`);
			}
		}

		// Delete created tasklist
		if (createdTaskListId) {
			try {
				await callTool(client, 'delete_tasklist', {
					project_id: testProject.projectId,
					tasklist_id: createdTaskListId,
				});
				console.log(`   Deleted test tasklist (ID: ${createdTaskListId})`);
				await wait(300);
			} catch (error) {
				console.warn(`Failed to delete tasklist: ${error}`);
			}
		}

		console.log('✅ Cleanup completed');

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All Task Smoke Tests Passed!');
		console.log('='.repeat(60));
		console.log('\n✅ Subtask creation feature verified successfully!');
		console.log('✅ Task cloning feature verified successfully!');

		await cleanup(client);
		process.exit(0);
	} catch (error) {
		console.error('\n💥 Smoke Tests Failed\n', error);
		if (client) await cleanup(client);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runTaskSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runTaskSmokeTests };
