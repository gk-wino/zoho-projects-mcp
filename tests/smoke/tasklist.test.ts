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
let createdTaskListId: string | null = null;
let createdCommentId: string | null = null;

async function testListTaskLists(client: Client, projectId: string) {
	const testName = 'list_tasklists';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_tasklists', {
			project_id: projectId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.tasklists) {
			throw new Error('Expected tasklists array in response');
		}

		console.log(`\nFound ${data.tasklists.length} task lists`);
		if (data.tasklists.length > 0) {
			console.log(`First task list: ${data.tasklists[0].name} (ID: ${data.tasklists[0].id})`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testCreateTaskList(client: Client, projectId: string) {
	const testName = 'create_tasklist';
	logTestStart(testName);

	try {
		const taskListName = `Test TaskList ${Date.now()}`;
		const response = await callTool(client, 'create_tasklist', {
			project_id: projectId,
			name: taskListName,
			flag: 'internal',
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
			throw new Error('Expected task list ID in response');
		}

		createdTaskListId = data.id;
		console.log(`\nCreated task list: ${data.name} (ID: ${data.id})`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testGetTaskList(client: Client, projectId: string, tasklistId: string) {
	const testName = 'get_tasklist';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_tasklist', {
			project_id: projectId,
			tasklist_id: tasklistId,
		});
		const data = parseToolResponse(response);

		if (!data.id || !data.name) {
			throw new Error('Expected task list details in response');
		}

		console.log(`\nTask list: ${data.name}`);
		console.log(`Status: ${data.status}`);
		console.log(`Flag: ${data.flag}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testUpdateTaskList(client: Client, projectId: string, tasklistId: string) {
	const testName = 'update_tasklist';
	logTestStart(testName);

	try {
		const updatedName = `Updated TaskList ${Date.now()}`;
		const response = await callTool(client, 'update_tasklist', {
			project_id: projectId,
			tasklist_id: tasklistId,
			name: updatedName,
			flag: 'external',
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
			throw new Error('Expected updated task list data in response');
		}

		console.log(`\nUpdated task list: ${data.name}`);
		console.log(`New flag: ${data.flag}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testAddTaskListComment(client: Client, projectId: string, tasklistId: string) {
	const testName = 'add_tasklist_comment';
	logTestStart(testName);

	try {
		const commentText = `Test comment added at ${new Date().toISOString()}`;
		const response = await callTool(client, 'add_tasklist_comment', {
			project_id: projectId,
			tasklist_id: tasklistId,
			comment: commentText,
		});
		const data = parseToolResponse(response);

		// Handle both direct response and wrapped response
		const commentData = data.comment || data;

		if (commentData.id) {
			createdCommentId = commentData.id;
		}

		console.log(`\nAdded comment to task list`);
		if (commentData.content) {
			console.log(`Comment: ${commentData.content.substring(0, 50)}...`);
		}

		logTestSuccess(testName);
		return commentData;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testGetTaskListComments(client: Client, projectId: string, tasklistId: string) {
	const testName = 'get_tasklist_comments';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_tasklist_comments', {
			project_id: projectId,
			tasklist_id: tasklistId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		// Handle different response formats
		const comments = data.comments || data;
		const commentCount = Array.isArray(comments) ? comments.length : 0;

		console.log(`\nFound ${commentCount} comments`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testFollowTaskList(client: Client, projectId: string, tasklistId: string) {
	const testName = 'follow_tasklist';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'follow_tasklist', {
			project_id: projectId,
			tasklist_id: tasklistId,
		});
		const data = parseToolResponse(response);

		console.log(`\nSuccessfully followed task list`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testGetTaskListFollowers(client: Client, projectId: string, tasklistId: string) {
	const testName = 'get_tasklist_followers';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_tasklist_followers', {
			project_id: projectId,
			tasklist_id: tasklistId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.followers) {
			throw new Error('Expected followers array in response');
		}

		console.log(`\nFound ${data.followers.length} followers`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testUnfollowTaskList(client: Client, projectId: string, tasklistId: string) {
	const testName = 'unfollow_tasklist';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'unfollow_tasklist', {
			project_id: projectId,
			tasklist_id: tasklistId,
		});
		const data = parseToolResponse(response);

		console.log(`\nSuccessfully unfollowed task list`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testGetTaskListTemplates(client: Client) {
	const testName = 'get_tasklist_templates';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_tasklist_templates', {
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		// Handle different response formats
		const templates = data.task_list_templates || data;
		const templateCount = Array.isArray(templates) ? templates.length : 0;

		console.log(`\nFound ${templateCount} task list templates`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testDeleteTaskListComment(
	client: Client,
	projectId: string,
	tasklistId: string,
	commentId: string,
) {
	const testName = 'delete_tasklist_comment';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'delete_tasklist_comment', {
			project_id: projectId,
			tasklist_id: tasklistId,
			comment_id: commentId,
		});

		console.log(`\nSuccessfully deleted comment (ID: ${commentId})`);

		logTestSuccess(testName);
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function testDeleteTaskList(client: Client, projectId: string, tasklistId: string) {
	const testName = 'delete_tasklist';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'delete_tasklist', {
			project_id: projectId,
			tasklist_id: tasklistId,
		});

		console.log(`\nSuccessfully deleted task list (ID: ${tasklistId})`);

		logTestSuccess(testName);
	} catch (error) {
		if (logTestFailure(testName, error)) {
			throw error;
		}
	}
}

async function cleanupOrphanedTaskLists(client: Client, projectId: string) {
	console.log('\n🧹 Cleaning up orphaned test task lists...');

	try {
		// Get all task lists
		const response = await callTool(client, 'list_tasklists', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		if (!data.tasklists || !Array.isArray(data.tasklists)) {
			console.log('No task lists found or unable to parse response');
			return;
		}

		// Filter orphaned test task lists (matching test patterns)
		const testPatterns = [/^Test TaskList \d+$/, /^Updated TaskList \d+$/];
		const orphanedTaskLists = data.tasklists.filter((tasklist: any) =>
			testPatterns.some((pattern) => pattern.test(tasklist.name)),
		);

		if (orphanedTaskLists.length === 0) {
			console.log('✅ No orphaned test task lists found');
			return;
		}

		console.log(`Found ${orphanedTaskLists.length} orphaned test task list(s)`);

		// Delete each orphaned task list
		for (const tasklist of orphanedTaskLists) {
			try {
				await callTool(client, 'delete_tasklist', {
					project_id: projectId,
					tasklist_id: tasklist.id,
				});
				console.log(`   Deleted: ${tasklist.name} (ID: ${tasklist.id})`);
				await wait(300); // Small delay between deletions
			} catch (error: any) {
				console.warn(`   Failed to delete ${tasklist.name}: ${error.message}`);
			}
		}

		console.log('✅ Cleanup completed');
	} catch (error) {
		console.warn('⚠️  Cleanup failed:', error);
		// Don't throw - cleanup failures shouldn't fail the test suite
	}
}

async function runTaskListSmokeTests() {
	console.log('\n🚀 Starting TaskList Smoke Tests\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Initialize test environment with persistent project
		const testProject = await initializeTestEnvironment(client);
		console.log();

		// Cleanup orphaned test task lists from previous failed runs
		await cleanupOrphanedTaskLists(client, testProject.projectId);
		await wait(500);

		// Run all test functions
		await testListTaskLists(client, testProject.projectId);
		await wait(500);

		const createdTaskList = await testCreateTaskList(client, testProject.projectId);
		await wait(500);

		if (createdTaskListId) {
			await testGetTaskList(client, testProject.projectId, createdTaskListId);
			await wait(500);

			await testUpdateTaskList(client, testProject.projectId, createdTaskListId);
			await wait(500);

			// Test comment operations
			const comment = await testAddTaskListComment(
				client,
				testProject.projectId,
				createdTaskListId,
			);
			await wait(500);

			await testGetTaskListComments(client, testProject.projectId, createdTaskListId);
			await wait(500);

			if (createdCommentId) {
				await testDeleteTaskListComment(
					client,
					testProject.projectId,
					createdTaskListId,
					createdCommentId,
				);
				await wait(500);
			}

			// Test follower operations
			await testFollowTaskList(client, testProject.projectId, createdTaskListId);
			await wait(500);

			await testGetTaskListFollowers(client, testProject.projectId, createdTaskListId);
			await wait(500);

			await testUnfollowTaskList(client, testProject.projectId, createdTaskListId);
			await wait(500);

			// Clean up created task list
			await testDeleteTaskList(client, testProject.projectId, createdTaskListId);
			await wait(500);
		}

		// Test template operations (portal-level)
		await testGetTaskListTemplates(client);
		await wait(500);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All TaskList Smoke Tests Passed!');
		console.log('='.repeat(60));

		await cleanup(client);
		process.exit(0);
	} catch (error) {
		console.error('\n💥 Smoke Tests Failed\n', error);
		if (client) await cleanup(client);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runTaskListSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runTaskListSmokeTests };
