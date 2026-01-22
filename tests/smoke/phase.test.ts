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

let createdPhaseId: string | null = null;
let commentId: string | null = null;

async function testListPhases(client: Client, projectId: string) {
	const testName = 'list_phases';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_phases', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!data.milestones) {
			throw new Error('Expected milestones array in response');
		}

		// Log phase information
		console.log(`\nFound ${data.milestones.length} phase(s):`);
		data.milestones.slice(0, 5).forEach((phase: any, index: number) => {
			console.log(
				`  ${index + 1}. ${phase.name} (ID: ${phase.id}) - Status: ${phase.status?.name || 'N/A'}`,
			);
		});

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhases(client: Client) {
	const testName = 'get_phases';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phases', {
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!data.milestones) {
			throw new Error('Expected milestones array in response');
		}

		console.log(`\nFound ${data.milestones.length} phase(s) across portal`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreatePhase(client: Client, projectId: string) {
	const testName = 'create_phase';
	logTestStart(testName);

	try {
		const timestamp = Date.now();
		const phaseName = `Test Phase ${timestamp}`;
		const now = new Date();
		const startDate = now.toISOString().split('T')[0];
		const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		const response = await callTool(client, 'create_phase', {
			project_id: projectId,
			name: phaseName,
			start_date: startDate,
			end_date: endDate,
			flag: 'internal',
		});
		const rawData = parseToolResponse(response);

		// Parse response (handle wrapped JSON)
		let data = rawData;
		if (typeof rawData === 'string') {
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		// Validate response structure
		if (!data.id) {
			throw new Error('Expected phase id in response');
		}

		// Store phase ID for later tests
		createdPhaseId = data.id;

		// Log phase details
		console.log('\nPhase Created:');
		console.log(`  Name: ${data.name}`);
		console.log(`  ID: ${data.id}`);
		console.log(`  Status: ${data.status?.name || 'N/A'}`);
		console.log(`  Start Date: ${data.start_date || 'N/A'}`);
		console.log(`  End Date: ${data.end_date || 'N/A'}`);

		logTestSuccess(testName, { phaseId: data.id, name: data.name });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhaseDetail(client: Client, projectId: string, phaseId: string) {
	const testName = 'get_phase_detail';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phase_detail', {
			project_id: projectId,
			phase_id: phaseId,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!data.id) {
			throw new Error('Expected phase id in response');
		}

		// Log phase details
		console.log('\nPhase Details:');
		console.log(`  Name: ${data.name}`);
		console.log(`  ID: ${data.id}`);
		console.log(`  Status: ${data.status?.statusName || 'N/A'}`);
		console.log(`  Owner: ${data.owner?.name || 'N/A'}`);
		console.log(`  Created: ${data.created_time || 'N/A'}`);
		console.log(`  Start Date: ${data.start_date || 'N/A'}`);
		console.log(`  End Date: ${data.end_date || 'N/A'}`);
		console.log(`  Completion: ${data.completion_percent || 0}%`);
		console.log(`  Flag: ${data.flag || 'N/A'}`);

		logTestSuccess(testName, { phaseId: data.id, name: data.name });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testUpdatePhase(client: Client, projectId: string, phaseId: string) {
	const testName = 'update_phase';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'update_phase', {
			project_id: projectId,
			phase_id: phaseId,
			name: 'Updated Test Phase',
		});
		const rawData = parseToolResponse(response);

		// Parse response
		let data = rawData;
		if (typeof rawData === 'string') {
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		console.log('\nPhase Updated:');
		console.log(`  Name: ${data.name}`);
		console.log(`  ID: ${data.id}`);

		logTestSuccess(testName, { phaseId: data.id, name: data.name });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testAddPhaseComment(client: Client, projectId: string, phaseId: string) {
	const testName = 'add_phase_comment';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'add_phase_comment', {
			project_id: projectId,
			phase_id: phaseId,
			content: 'This is a test comment on the phase',
		});
		const rawData = parseToolResponse(response);

		// Parse response
		let data = rawData;
		if (typeof rawData === 'string') {
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		// Store comment ID for later tests
		if (data.id) {
			commentId = data.id;
		} else if (data.comment_id) {
			commentId = data.comment_id;
		}

		console.log('\nComment Added:');
		console.log(`  Content: ${data.content || 'Added successfully'}`);
		console.log(`  ID: ${commentId || 'N/A'}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhaseComments(client: Client, projectId: string, phaseId: string) {
	const testName = 'get_phase_comments';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phase_comments', {
			project_id: projectId,
			phase_id: phaseId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		console.log(`\nFound comment(s) on phase`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhaseActivities(client: Client, projectId: string, phaseId: string) {
	const testName = 'get_phase_activities';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phase_activities', {
			project_id: projectId,
			phase_id: phaseId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!data.activities) {
			console.log('No activities found for phase');
		} else {
			console.log(`\nFound ${data.activities.length} activit(ies)`);
			data.activities.slice(0, 3).forEach((activity: any, index: number) => {
				console.log(
					`  ${index + 1}. ${activity.activity_state || 'N/A'} - ${activity.action_time || 'N/A'}`,
				);
			});
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhaseStatusTransition(client: Client, projectId: string, phaseId: string) {
	const testName = 'get_phase_status_transition';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phase_status_transition', {
			project_id: projectId,
			phase_id: phaseId,
		});
		const data = parseToolResponse(response);

		// Validate response structure
		if (!Array.isArray(data) || data.length === 0) {
			console.log('No status transitions found for phase');
		} else {
			console.log(`\nFound ${data.length} status transition(s)`);
			data.slice(0, 3).forEach((transition: any, index: number) => {
				console.log(
					`  ${index + 1}. ${transition.previous_status?.name || 'None'} → ${transition.updated_status?.name || 'N/A'}`,
				);
			});
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetPhaseFollowers(client: Client, projectId: string, phaseId: string) {
	const testName = 'get_phase_followers';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_phase_followers', {
			project_id: projectId,
			phase_id: phaseId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		console.log('\nPhase Followers retrieved');
		if (data.followers && data.followers.length > 0) {
			console.log(`  Found ${data.followers.length} follower(s)`);
		} else {
			console.log('  No followers found');
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testClonePhase(client: Client, projectId: string, phaseId: string) {
	const testName = 'clone_phase';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'clone_phase', {
			project_id: projectId,
			phase_id: phaseId,
		});
		const rawData = parseToolResponse(response);

		// Parse response
		let data = rawData;
		if (typeof rawData === 'string') {
			const jsonMatch = rawData.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				data = JSON.parse(jsonMatch[0]);
			}
		}

		console.log('\nPhase Cloned:');
		console.log(`  New Phase ID: ${data.id || 'Success'}`);

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testDeletePhaseComment(
	client: Client,
	projectId: string,
	phaseId: string,
	commentId: string,
) {
	const testName = 'delete_phase_comment';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'delete_phase_comment', {
			project_id: projectId,
			phase_id: phaseId,
			comment_id: commentId,
		});

		console.log('\nComment deleted successfully');

		logTestSuccess(testName);
		return response;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testDeletePhase(client: Client, projectId: string, phaseId: string) {
	const testName = 'delete_phase';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'delete_phase', {
			project_id: projectId,
			phase_id: phaseId,
		});

		console.log('\nPhase deleted successfully');

		logTestSuccess(testName);
		return response;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function runPhaseSmokeTests() {
	console.log('\n🚀 Starting Phase Smoke Tests\n');
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

		// Run all test functions
		await testGetPhases(client);
		await wait(500);

		await testListPhases(client, testProject.projectId);
		await wait(500);

		await testCreatePhase(client, testProject.projectId);
		await wait(500);

		if (!createdPhaseId) {
			throw new Error('Phase ID not available for subsequent tests');
		}

		await testGetPhaseDetail(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testUpdatePhase(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testAddPhaseComment(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testGetPhaseComments(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testGetPhaseActivities(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testGetPhaseStatusTransition(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testGetPhaseFollowers(client, testProject.projectId, createdPhaseId);
		await wait(500);

		await testClonePhase(client, testProject.projectId, createdPhaseId);
		await wait(500);

		// Cleanup: delete comment if created
		if (commentId) {
			await testDeletePhaseComment(client, testProject.projectId, createdPhaseId, commentId);
			await wait(500);
		}

		// Cleanup: delete the test phase
		await testDeletePhase(client, testProject.projectId, createdPhaseId);
		await wait(500);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All Phase Smoke Tests Passed!');
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
	runPhaseSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runPhaseSmokeTests };
