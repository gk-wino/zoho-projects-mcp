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
	initializeTestEnvironment,
} from './utils.js';

const TEST_PREFIX = 'MCP Time Log Test';
let createdLogId: string | null = null;
let updateBlockedByApproval = false;

function getTodayDate(): string {
	return new Date().toISOString().slice(0, 10);
}

async function cleanupOrphanedTimeLogs(client: Client, projectId: string) {
	try {
		const today = getTodayDate();
		const response = await callTool(client, 'list_time_logs', {
			project_id: projectId,
			view_type: 'customdate',
			start_date: today,
			end_date: today,
			page: 1,
			per_page: 200,
			module_type: 'general',
		});

		const data = parseToolResponse(response);
		const logs = flattenTimeLogs(data);

		for (const log of logs) {
			if (typeof log?.log_name === 'string' && log.log_name.startsWith(TEST_PREFIX) && log?.id) {
				try {
					await callTool(client, 'delete_time_log', {
						project_id: projectId,
						log_id: log.id,
						module_type: 'general',
					});
				} catch {
					// Ignore cleanup failures and continue.
				}
			}
		}
	} catch {
		// Ignore cleanup discovery failures and continue.
	}
}

function flattenTimeLogs(data: any): any[] {
	if (!Array.isArray(data?.time_logs)) {
		return [];
	}

	return data.time_logs.flatMap((entry: any) =>
		Array.isArray(entry?.log_details) ? entry.log_details : [],
	);
}

function isApprovedUpdateError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return (
		message.includes('Approved time log cannot be moved') ||
		message.includes('Cannot update approved timelogs') ||
		message.includes('TIMESHEET_UPDATE') ||
		message.includes('approvalStatus') ||
		message.includes('approval_status')
	);
}

async function testTimeLogToolSchemas(client: Client) {
	const testName = 'time_log_tool_schemas';
	logTestStart(testName);

	try {
		const response = await client.listTools();
		const expectedSchemas = new Map<string, string[]>([
			['list_time_logs', ['project_id', 'view_type']],
			['get_time_log', ['project_id', 'log_id', 'module_type']],
			['create_time_log', ['project_id', 'module_type', 'date', 'bill_status']],
			['update_time_log', ['project_id', 'log_id', 'module_type']],
			['delete_time_log', ['project_id', 'log_id', 'module_type']],
		]);

		for (const [toolName, requiredFields] of expectedSchemas) {
			const tool = response.tools.find((candidate) => candidate.name === toolName);
			if (!tool) {
				throw new Error(`Expected ${toolName} to be exposed in ListTools`);
			}

			const required = Array.isArray(tool.inputSchema?.required) ? tool.inputSchema.required : [];
			for (const field of requiredFields) {
				if (!required.includes(field)) {
					throw new Error(`Expected ${toolName} schema to require ${field}`);
				}
			}
		}

		logTestSuccess(testName, { verifiedTools: Array.from(expectedSchemas.keys()) });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testCreateTimeLog(client: Client, projectId: string) {
	const testName = 'create_time_log';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'create_time_log', {
			project_id: projectId,
			log_name: `${TEST_PREFIX} ${Date.now()}`,
			date: getTodayDate(),
			bill_status: 'Billable',
			hours: '01:00',
			notes: 'Created by MCP smoke test',
			module_type: 'general',
		});
		const data = parseToolResponse(response);

		if (!data?.id) {
			throw new Error('Expected created time log to include an id');
		}

		createdLogId = data.id.toString();
		logTestSuccess(testName, { logId: createdLogId });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testListTimeLogs(client: Client, projectId: string, logId: string) {
	const testName = 'list_time_logs';
	logTestStart(testName);

	try {
		const today = getTodayDate();
		const response = await callTool(client, 'list_time_logs', {
			project_id: projectId,
			view_type: 'customdate',
			start_date: today,
			end_date: today,
			page: 1,
			per_page: 200,
			module_type: 'general',
		});
		const data = parseToolResponse(response);

		const logs = flattenTimeLogs(data);
		if (!Array.isArray(logs)) {
			throw new Error('Expected flattened time_logs array in response');
		}

		const matched = logs.find((log: any) => log?.id?.toString() === logId);
		if (!matched) {
			throw new Error(`Created time log ${logId} was not found in list response`);
		}

		logTestSuccess(testName, { matchedLogId: logId, total: logs.length });
		return matched;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetTimeLog(client: Client, projectId: string, logId: string) {
	const testName = 'get_time_log';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_time_log', {
			project_id: projectId,
			log_id: logId,
			module_type: 'general',
		});
		const data = parseToolResponse(response);

		if (data?.id?.toString() !== logId) {
			throw new Error(`Expected log id ${logId}, got ${data?.id}`);
		}

		logTestSuccess(testName, { logId });
		return data;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testUpdateTimeLog(client: Client, projectId: string, logId: string) {
	const testName = 'update_time_log';
	logTestStart(testName);

	try {
		const updatedNotes = `Updated by MCP smoke test at ${new Date().toISOString()}`;
		const response = await client.callTool({
			name: 'update_time_log',
			arguments: {
				project_id: projectId,
				log_id: logId,
				module_type: 'general',
				log_name: `${TEST_PREFIX} Updated`,
				notes: updatedNotes,
				hours: '00:45',
				bill_status: 'Non Billable',
			},
		});
		const data = parseToolResponse(response);

		if (data?.id?.toString() !== logId) {
			throw new Error(`Expected updated log id ${logId}, got ${data?.id}`);
		}

		if (data?.notes !== updatedNotes && data?.log_notes !== updatedNotes) {
			throw new Error('Updated time log notes were not reflected in the response');
		}

		logTestSuccess(testName, { logId });
		return data;
	} catch (error) {
		if (isApprovedUpdateError(error)) {
			updateBlockedByApproval = true;
			logTestSuccess(testName, {
				logId,
				note: 'Zoho auto-approved the created time log in this portal, so the live API rejected the edit. The MCP tool route and schema were still verified.',
			});
			return null;
		}

		logTestFailure(testName, error);
		throw error;
	}
}

async function testDeleteTimeLog(client: Client, projectId: string, logId: string) {
	const testName = 'delete_time_log';
	logTestStart(testName);

	try {
		await callTool(client, 'delete_time_log', {
			project_id: projectId,
			log_id: logId,
			module_type: 'general',
		});

		const today = getTodayDate();
		const response = await callTool(client, 'list_time_logs', {
			project_id: projectId,
			view_type: 'customdate',
			start_date: today,
			end_date: today,
			page: 1,
			per_page: 200,
			module_type: 'general',
		});
		const data = parseToolResponse(response);
		const logs = flattenTimeLogs(data);
		const stillExists = logs.some((log: any) => log?.id?.toString() === logId);

		if (stillExists) {
			throw new Error(`Deleted time log ${logId} still appears in list results`);
		}

		createdLogId = null;
		logTestSuccess(testName, { deletedLogId: logId });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function main() {
	let client: Client | null = null;
	let keepTestTimeLogs = false;

	try {
		console.log('Starting Time Log Smoke Tests');
		loadEnv();
		keepTestTimeLogs = process.env.KEEP_TEST_TIME_LOGS === 'true';
		client = await createMcpClient();
		await testTimeLogToolSchemas(client);

		const testProject = await initializeTestEnvironment(client);

		if (keepTestTimeLogs) {
			console.log('\n📝 KEEP_TEST_TIME_LOGS enabled - skipping pre-run cleanup');
		} else {
			await cleanupOrphanedTimeLogs(client, testProject.projectId);
		}

		const created = await testCreateTimeLog(client, testProject.projectId);
		await testListTimeLogs(client, testProject.projectId, created.id.toString());
		await testGetTimeLog(client, testProject.projectId, created.id.toString());
		await testUpdateTimeLog(client, testProject.projectId, created.id.toString());

		if (keepTestTimeLogs) {
			console.log('\n📝 KEEP_TEST_TIME_LOGS enabled - skipping delete verification');
		} else {
			await testDeleteTimeLog(client, testProject.projectId, created.id.toString());
		}

		if (updateBlockedByApproval) {
			console.log('\n⚠️  Live update verification was limited by Zoho approval workflow.');
			console.log(
				'   Newly created logs are auto-approved in this portal and Zoho blocks edits to approved logs.',
			);
		}
	} catch (error) {
		console.error('Time log smoke tests failed:', error);
		process.exitCode = 1;
	} finally {
		if (keepTestTimeLogs && createdLogId) {
			console.log(`\n📝 KEEP_TEST_TIME_LOGS enabled - timelog ${createdLogId} was left in Zoho`);
		}

		if (client && createdLogId && !keepTestTimeLogs) {
			try {
				const testProject = await initializeTestEnvironment(client);
				await callTool(client, 'delete_time_log', {
					project_id: testProject.projectId,
					log_id: createdLogId,
					module_type: 'general',
				});
			} catch {
				// Best-effort cleanup only.
			}
		}

		if (client) {
			await cleanup(client);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
