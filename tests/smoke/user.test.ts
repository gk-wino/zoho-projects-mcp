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

async function testListUsers(client: Client, portalId: string) {
	const testName = 'list_users (portal-level)';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'list_users', {
			portal_id: portalId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.users || !Array.isArray(data.users)) {
			throw new Error('Expected users array in response');
		}

		console.log(`\n✓ Found ${data.users.length} users`);
		if (data.users.length > 0) {
			const firstUser = data.users[0];
			console.log(`  Sample user: ${firstUser.full_name || firstUser.name} (${firstUser.email})`);
			console.log(`  ZPUID: ${firstUser.zpuid || firstUser.id}`);
		}

		logTestSuccess(testName);
		return data.users;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetUserDetails(client: Client, portalId: string, userId: string) {
	const testName = 'get_user_details';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_user_details', {
			portal_id: portalId,
			user_id: userId,
		});
		const data = parseToolResponse(response);

		if (!data.full_name && !data.name) {
			throw new Error('Expected user details in response');
		}

		console.log(`\n✓ User: ${data.full_name || data.name}`);
		console.log(`  Email: ${data.email}`);
		console.log(`  ZPUID: ${data.zpuid || data.id}`);
		console.log(`  Status: ${data.is_active ? 'Active' : 'Inactive'}`);
		if (data.role) {
			console.log(`  Role: ${data.role.name}`);
		}
		if (data.profile) {
			console.log(`  Profile: ${data.profile.name}`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetUserProjects(client: Client, portalId: string, userId: string) {
	const testName = 'get_user_projects';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_user_projects', {
			portal_id: portalId,
			user_id: userId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.projects || !Array.isArray(data.projects)) {
			throw new Error('Expected projects array in response');
		}

		console.log(`\n✓ Found ${data.projects.length} projects for user`);
		if (data.projects.length > 0) {
			const firstProject = data.projects[0];
			console.log(`  Sample project: ${firstProject.name} (Status: ${firstProject.status})`);
			console.log(`  Project ID: ${firstProject.id}`);
		}

		logTestSuccess(testName);
		return data.projects;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetProjectUsers(client: Client, portalId: string, projectId: string) {
	const testName = 'get_project_users';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_project_users', {
			portal_id: portalId,
			project_id: projectId,
			page: 1,
			per_page: 10,
		});
		const data = parseToolResponse(response);

		if (!data.users || !Array.isArray(data.users)) {
			throw new Error('Expected users array in response');
		}

		console.log(`\n✓ Found ${data.users.length} users in project`);
		if (data.users.length > 0) {
			const firstUser = data.users[0];
			console.log(`  Sample user: ${firstUser.full_name || firstUser.name} (${firstUser.email})`);
			console.log(`  ZPUID: ${firstUser.zpuid || firstUser.id}`);
		}

		logTestSuccess(testName);
		return data.users;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetProjectUserDetails(
	client: Client,
	portalId: string,
	projectId: string,
	userId: string,
) {
	const testName = 'get_project_user_details';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_project_user_details', {
			portal_id: portalId,
			project_id: projectId,
			user_id: userId,
		});
		const data = parseToolResponse(response);

		if (!data.full_name && !data.name) {
			throw new Error('Expected user details in response');
		}

		console.log(`\n✓ User in project: ${data.full_name || data.name}`);
		console.log(`  Email: ${data.email}`);
		console.log(`  ZPUID: ${data.zpuid || data.id}`);
		if (data.role) {
			console.log(`  Role: ${data.role.name}`);
		}
		if (data.profile) {
			console.log(`  Profile: ${data.profile.name}`);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetUserLicenseDetails(client: Client, portalId: string) {
	const testName = 'get_user_license_details';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_user_license_details', {
			portal_id: portalId,
		});
		const data = parseToolResponse(response);

		console.log('\n✓ License Details:');
		if (data.portal_user) {
			console.log(
				`  Portal Users: ${data.portal_user.used_count}/${data.portal_user.total_count} (${data.portal_user.remaining_count} remaining)`,
			);
		}
		if (data.client_user) {
			console.log(
				`  Client Users: ${data.client_user.used_count}/${data.client_user.total_count} (${data.client_user.remaining_count} remaining)`,
			);
		}
		if (data.lite_user) {
			console.log(
				`  Lite Users: ${data.lite_user.used_count}/${data.lite_user.total_count} (${data.lite_user.remaining_count} remaining)`,
			);
		}
		if (data.readonly_user) {
			console.log(
				`  Readonly Users: ${data.readonly_user.used_count}/${data.readonly_user.total_count} (${data.readonly_user.remaining_count} remaining)`,
			);
		}

		logTestSuccess(testName);
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function runUserSmokeTests() {
	console.log('\n🚀 Starting User Smoke Tests\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Get portal ID from environment
		const portalId = env.portalId;
		console.log(`✅ Using portal ID: ${portalId}\n`);

		// Test 1: List users at portal level
		const users = await testListUsers(client, portalId);
		await wait(500);

		// Get first user for subsequent tests
		if (!users || users.length === 0) {
			throw new Error('No users found for testing');
		}
		const firstUser = users[0];
		const userId = firstUser.zpuid || firstUser.id;

		// Test 2: Get user details
		await testGetUserDetails(client, portalId, userId);
		await wait(500);

		// Test 3: Get user's projects
		const userProjects = await testGetUserProjects(client, portalId, userId);
		await wait(500);

		// Get first project for project-level tests
		if (!userProjects || userProjects.length === 0) {
			console.log('\n⚠️  No projects found for user, skipping project-level tests');
		} else {
			const firstProject = userProjects[0];
			const projectId = firstProject.id;

			// Test 4: Get project users
			const projectUsers = await testGetProjectUsers(client, portalId, projectId);
			await wait(500);

			// Test 5: Get project user details
			if (projectUsers && projectUsers.length > 0) {
				const projectUser = projectUsers[0];
				const projectUserId = projectUser.zpuid || projectUser.id;
				await testGetProjectUserDetails(client, portalId, projectId, projectUserId);
				await wait(500);
			}
		}

		// Test 6: Get user license details
		await testGetUserLicenseDetails(client, portalId);
		await wait(500);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All User Smoke Tests Passed!');
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
	runUserSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runUserSmokeTests };
