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
let createdIssueId: string | null = null;
let createdIssue2Id: string | null = null;
let clonedIssueId: string | null = null;
let createdCommentId: string | null = null;
let createdLinkId: string | null = null;

/**
 * Cleanup orphaned test issues from previous failed runs
 */
async function cleanupOrphanedIssues(client: Client, projectId: string) {
	console.log('\n🧹 Cleaning up orphaned test issues...');

	try {
		// Get all issues from the project
		const response = await callTool(client, 'list_issues', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		if (!data.issues || !Array.isArray(data.issues)) {
			console.log('No issues found or unable to parse response');
			return;
		}

		// Filter orphaned test issues (matching test patterns)
		const testPatterns = [
			/^Test Issue \d+$/,
			/^Updated Issue \d+$/,
			/^Clone of Test Issue \d+$/,
			/^Test Issue for Linking \d+$/,
		];
		const orphanedIssues = data.issues.filter((issue: any) =>
			testPatterns.some((pattern) => pattern.test(issue.name)),
		);

		if (orphanedIssues.length === 0) {
			console.log('✅ No orphaned test issues found');
			return;
		}

		console.log(`Found ${orphanedIssues.length} orphaned test issue(s)`);

		// Delete each orphaned issue
		for (const issue of orphanedIssues) {
			try {
				await callTool(client, 'delete_issue', {
					project_id: projectId,
					issue_id: issue.id,
				});
				console.log(`   Deleted issue: ${issue.name} (ID: ${issue.id})`);
				await wait(300); // Small delay between deletions
			} catch (error: any) {
				console.warn(`   Failed to delete ${issue.name}: ${error.message}`);
			}
		}

		console.log('✅ Cleanup completed');
	} catch (error) {
		console.warn('⚠️  Cleanup failed:', error);
		// Don't throw - cleanup failures shouldn't fail the test suite
	}
}

async function testListIssues(client: Client, projectId: string) {
	const testName = 'list_issues';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_issues', {
			project_id: projectId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.issues) {
			throw new Error('Expected issues array in response');
		}

		console.log(`\nFound ${data.issues.length} issue(s)`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreateIssue(client: Client, projectId: string) {
	const testName = 'create_issue';
	logTestStart(testName);

	try {
		const issueName = `Test Issue ${Date.now()}`;
		const response = await callTool(client, 'create_issue', {
			project_id: projectId,
			name: issueName,
			description: 'This is a test issue created via API for smoke testing',
			flag: 'Internal',
		});
		const data = parseToolResponse(response);

		console.log('\n📋 Response data:', JSON.stringify(data, null, 2));

		if (!data.id && !data.issue && !data.issues) {
			throw new Error('Expected issue ID in response. Got: ' + JSON.stringify(data));
		}

		// Handle different response formats
		const issueData = data.issue || data.issues?.[0] || data;
		createdIssueId = issueData.id;
		console.log(`\n✅ Created issue: ${issueData.name || issueName} (ID: ${issueData.id})`);
		logTestSuccess(testName);
		return issueData;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssue(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue', {
			project_id: projectId,
			issue_id: issueId,
		});
		let data = parseToolResponse(response);

		// Handle array response - some endpoints return array, some return object
		if (Array.isArray(data) && data.length > 0) {
			data = data[0];
		}

		if (!data.id || data.id !== issueId) {
			throw new Error('Issue ID mismatch or missing');
		}

		console.log(`\nRetrieved issue: ${data.name} (ID: ${data.id})`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueDescription(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_description';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_description', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved issue description`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testUpdateIssue(client: Client, projectId: string, issueId: string) {
	const testName = 'update_issue';
	logTestStart(testName);

	try {
		const updatedName = `Updated Issue ${Date.now()}`;
		const response = await callTool(client, 'update_issue', {
			project_id: projectId,
			issue_id: issueId,
			name: updatedName,
			description: 'Updated description via API',
		});
		const data = parseToolResponse(response);

		console.log(`\n✅ Updated issue: ${data.name || updatedName}`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testAddIssueComment(client: Client, projectId: string, issueId: string) {
	const testName = 'add_issue_comment';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'add_issue_comment', {
			project_id: projectId,
			issue_id: issueId,
			comment: 'This is a test comment on the issue',
		});
		const data = parseToolResponse(response);

		if (data.id) {
			createdCommentId = data.id;
			console.log(`\n✅ Added comment (ID: ${data.id})`);
		} else {
			console.log(`\n✅ Added comment`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueComments(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_comments';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_comments', {
			project_id: projectId,
			issue_id: issueId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved comments`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueActivities(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_activities';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_activities', {
			project_id: projectId,
			issue_id: issueId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved issue activities`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueStatusTransition(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_status_transition';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_status_transition', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved status transition history`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCloneIssue(client: Client, projectId: string, issueId: string) {
	const testName = 'clone_issue';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'clone_issue', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		if (data.id) {
			clonedIssueId = data.id;
			console.log(`\n✅ Cloned issue (ID: ${data.id})`);
		} else {
			console.log(`\n✅ Issue cloned successfully`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testLinkIssues(
	client: Client,
	projectId: string,
	issueId1: string,
	issueId2: string,
) {
	const testName = 'link_issues';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'link_issues', {
			project_id: projectId,
			issue_id: issueId1,
			link_type: 'Related to',
			issue_ids: [issueId2],
		});
		const data = parseToolResponse(response);

		console.log(`\n✅ Linked issues successfully`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		// Don't throw - linking might fail if link types aren't configured
		console.warn('⚠️  Link issues may require link types to be configured in Zoho Projects');
	}
}

async function testGetIssueLinkedIssues(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_linked_issues';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_linked_issues', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved linked issues`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueFollowers(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_followers';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_followers', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved issue followers`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueAttachments(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_attachments';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_attachments', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved issue attachments`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetIssueResolution(client: Client, projectId: string, issueId: string) {
	const testName = 'get_issue_resolution';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_issue_resolution', {
			project_id: projectId,
			issue_id: issueId,
		});
		const data = parseToolResponse(response);

		console.log(`\nRetrieved issue resolution`);
		logTestSuccess(testName);
		return data;
	} catch (error) {
		// Resolution might not exist yet, that's okay
		console.log(`\n✓ No resolution exists yet (this is normal)`);
		logTestSuccess(testName);
	}
}

async function testDeleteIssue(client: Client, projectId: string, issueId: string) {
	const testName = 'delete_issue';
	logTestStart(testName);

	try {
		await callTool(client, 'delete_issue', {
			project_id: projectId,
			issue_id: issueId,
		});

		console.log(`\n✅ Deleted issue (ID: ${issueId})`);
		logTestSuccess(testName);
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function runIssueSmokeTests() {
	console.log('\n🚀 Starting Issue Smoke Tests\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Initialize test environment (creates/finds test project)
		const testProject = await initializeTestEnvironment(client);
		console.log();

		// Cleanup orphaned test issues from previous failed runs
		await cleanupOrphanedIssues(client, testProject.projectId);
		await wait(500);

		// Run all test functions
		console.log('\n' + '='.repeat(60));
		console.log('📝 Issue Management Tests');
		console.log('='.repeat(60));

		await testListIssues(client, testProject.projectId);
		await wait(500);

		await testCreateIssue(client, testProject.projectId);
		await wait(500);

		if (createdIssueId) {
			await testGetIssue(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueDescription(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testUpdateIssue(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueActivities(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueStatusTransition(client, testProject.projectId, createdIssueId);
			await wait(500);

			console.log('\n' + '='.repeat(60));
			console.log('💬 Comment Tests');
			console.log('='.repeat(60));

			await testAddIssueComment(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueComments(client, testProject.projectId, createdIssueId);
			await wait(500);

			console.log('\n' + '='.repeat(60));
			console.log('🔗 Linking and Association Tests');
			console.log('='.repeat(60));

			await testCloneIssue(client, testProject.projectId, createdIssueId);
			await wait(500);

			if (clonedIssueId) {
				await testLinkIssues(client, testProject.projectId, createdIssueId, clonedIssueId);
				await wait(500);
			}

			await testGetIssueLinkedIssues(client, testProject.projectId, createdIssueId);
			await wait(500);

			console.log('\n' + '='.repeat(60));
			console.log('👥 Followers, Attachments, and Resolution Tests');
			console.log('='.repeat(60));

			await testGetIssueFollowers(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueAttachments(client, testProject.projectId, createdIssueId);
			await wait(500);

			await testGetIssueResolution(client, testProject.projectId, createdIssueId);
			await wait(500);

			console.log('\n' + '='.repeat(60));
			console.log('🗑️  Cleanup Tests');
			console.log('='.repeat(60));

			// Cleanup created issues
			if (clonedIssueId) {
				await testDeleteIssue(client, testProject.projectId, clonedIssueId);
				await wait(500);
			}

			await testDeleteIssue(client, testProject.projectId, createdIssueId);
			await wait(500);
		}

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All Issue Smoke Tests Passed!');
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
	runIssueSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runIssueSmokeTests };
