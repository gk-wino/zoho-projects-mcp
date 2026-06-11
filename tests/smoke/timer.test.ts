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
	wait,
} from './utils.js';

const TEST_PREFIX = 'MCP Timer Test';

type TimerRecord = Record<string, unknown> & {
	id?: string | number;
	title?: string;
	type?: string;
	item_id?: string | number;
	log_id?: string | number;
	entity_id?: string | number;
};

type ZohoEnv = ReturnType<typeof loadEnv>;

type OAuthRefreshResponse = {
	access_token: string;
	expires_in?: number;
};

let createdTaskId: string | null = null;
let createdLogId: string | null = null;
let activeTimerIds = new Set<string>();

function getTodayDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function extractJsonObject(data: any): any {
	if (typeof data !== 'string') {
		return data;
	}

	const jsonMatch = data.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		return data;
	}

	return JSON.parse(jsonMatch[0]);
}

function getRunningTimers(data: any): TimerRecord[] {
	return Array.isArray(data?.timer) ? data.timer : [];
}

function flattenTimeLogs(data: any): any[] {
	if (!Array.isArray(data?.time_logs)) {
		return [];
	}

	return data.time_logs.flatMap((entry: any) =>
		Array.isArray(entry?.log_details) ? entry.log_details : [],
	);
}

async function fetchProjectModules(env: ZohoEnv, projectId: string) {
	return fetchZohoJson(env, `/api/v3/portal/${env.portalId}/projects/${projectId}/modules`);
}

async function refreshAccessToken(env: ZohoEnv): Promise<void> {
	const params = new URLSearchParams({
		refresh_token: env.refreshToken,
		client_id: env.clientId,
		client_secret: env.clientSecret,
		grant_type: 'refresh_token',
	});

	const response = await fetch(`${env.accountsDomain}/oauth/v2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to refresh access token for timer test: ${response.status} ${await response.text()}`,
		);
	}

	const data = (await response.json()) as OAuthRefreshResponse;
	env.accessToken = data.access_token;
}

async function fetchZohoJson(env: ZohoEnv, endpoint: string, isRetry = false): Promise<any> {
	const response = await fetch(`${env.apiDomain}${endpoint}`, {
		headers: {
			'Authorization': `Zoho-oauthtoken ${env.accessToken}`,
			'Content-Type': 'application/json',
		},
	});

	if (response.status === 401 && !isRetry) {
		await refreshAccessToken(env);
		return fetchZohoJson(env, endpoint, true);
	}

	if (!response.ok) {
		throw new Error(`Failed Zoho request: ${response.status} ${await response.text()}`);
	}

	return response.json();
}

async function cleanupPriorTestTimers(client: Client) {
	try {
		const response = await callTool(client, 'get_running_timers', {
			type: 'all',
			for_all: 'false',
		});
		const data = parseToolResponse(response);
		const timers = getRunningTimers(data);

		for (const timer of timers) {
			if (typeof timer?.title === 'string' && timer.title.startsWith(TEST_PREFIX) && timer.id) {
				try {
					await callTool(client, 'delete_timer', { timer_id: String(timer.id) });
				} catch {
					// Ignore cleanup failures and continue.
				}
			}
		}
	} catch {
		// Ignore cleanup failures and continue.
	}
}

async function cleanupPriorTestTasks(client: Client, projectId: string) {
	try {
		const response = await callTool(client, 'list_tasks', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);
		const tasks = Array.isArray(data?.tasks) ? data.tasks : [];

		for (const task of tasks) {
			if (typeof task?.name === 'string' && task.name.startsWith(TEST_PREFIX) && task?.id) {
				try {
					await callTool(client, 'delete_task', {
						project_id: projectId,
						task_id: String(task.id),
					});
				} catch {
					// Ignore cleanup failures and continue.
				}
			}
		}
	} catch {
		// Ignore cleanup failures and continue.
	}
}

async function testTimerToolSchemas(client: Client) {
	const testName = 'timer_tool_schemas';
	logTestStart(testName);

	try {
		const response = await client.listTools();
		const expectedSchemas = new Map<string, string[]>([
			['get_running_timers', []],
			['start_timer', []],
			['get_timer_details_by_log_id', ['project_id', 'entity_type', 'log_id']],
			['pause_timer', ['timer_id', 'type']],
			['resume_timer', ['timer_id', 'type']],
			['stop_timer', ['timer_id', 'date', 'type', 'bill_status']],
			['delete_timer', ['timer_id']],
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

async function createTimerTask(client: Client, projectId: string, assigneeZpuid: string) {
	const taskName = `${TEST_PREFIX} Task ${Date.now()}`;
	const response = await callTool(client, 'create_task', {
		project_id: projectId,
		name: taskName,
		description: 'Task created for timer smoke testing',
		priority: 'high',
		assignee_zpuid: assigneeZpuid,
	});
	const data = extractJsonObject(parseToolResponse(response));

	if (!data?.id) {
		throw new Error('Expected create_task to return an id for timer testing');
	}

	createdTaskId = String(data.id);
	return {
		taskId: createdTaskId,
		taskName,
	};
}

async function resolveCurrentUserZpuidFromTaskProbe(
	client: Client,
	projectId: string,
): Promise<string> {
	const response = await callTool(client, 'create_task', {
		project_id: projectId,
		name: `${TEST_PREFIX} Probe ${Date.now()}`,
		description: 'Probe task to resolve the current timer user',
		priority: 'low',
	});
	const data = extractJsonObject(parseToolResponse(response));
	const probeTaskId = data?.id ? String(data.id) : null;
	const currentUserZpuid = data?.created_by?.zpuid ? String(data.created_by.zpuid) : null;

	if (probeTaskId) {
		try {
			await callTool(client, 'delete_task', {
				project_id: projectId,
				task_id: probeTaskId,
			});
		} catch {
			// Ignore probe cleanup failures.
		}
	}

	if (!currentUserZpuid) {
		throw new Error('Could not resolve current user ZPUID from create_task response');
	}

	return currentUserZpuid;
}

async function startTimerAndFindIt(
	client: Client,
	projectId: string,
	taskId: string,
	taskName: string,
	moduleId: string,
) {
	const testName = 'start_timer';
	logTestStart(testName);

	try {
		await callTool(client, 'start_timer', {
			entity_id: taskId,
			project_id: projectId,
			module_id: moduleId,
			check_existing_timers: 'true',
		});

		await wait(1000);

		const runningResponse = await callTool(client, 'get_running_timers', {
			type: 'task',
			for_all: 'false',
		});
		const runningTimers = getRunningTimers(parseToolResponse(runningResponse));
		const matchedTimer = runningTimers.find((timer) => timer.title === taskName);

		if (!matchedTimer?.id) {
			throw new Error(`Expected a running timer for ${taskName}`);
		}

		const timerId = String(matchedTimer.id);
		activeTimerIds.add(timerId);
		logTestSuccess(testName, { timerId, title: matchedTimer.title, type: matchedTimer.type });

		return matchedTimer;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testPauseTimer(client: Client, timer: TimerRecord, taskId: string) {
	const testName = 'pause_timer';
	logTestStart(testName);

	try {
		await callTool(client, 'pause_timer', {
			timer_id: String(timer.id),
			type: 'task',
			entity_id: String(timer.entity_id || timer.item_id || taskId),
			...(timer.log_id ? { log_id: String(timer.log_id) } : {}),
			notes: `${TEST_PREFIX} pause ${Date.now()}`,
		});

		logTestSuccess(testName, { timerId: timer.id });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testResumeTimer(client: Client, timer: TimerRecord, taskId: string) {
	const testName = 'resume_timer';
	logTestStart(testName);

	try {
		await callTool(client, 'resume_timer', {
			timer_id: String(timer.id),
			type: 'task',
			entity_id: String(timer.entity_id || timer.item_id || taskId),
			...(timer.log_id ? { log_id: String(timer.log_id) } : {}),
			notes: `${TEST_PREFIX} resume ${Date.now()}`,
		});

		logTestSuccess(testName, { timerId: timer.id });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testStopTimer(client: Client, projectId: string, taskId: string, timerId: string) {
	const testName = 'stop_timer';
	logTestStart(testName);

	try {
		await wait(31_000);

		const stopNotes = `${TEST_PREFIX} stop ${Date.now()}`;
		const stopResponse = await callTool(client, 'stop_timer', {
			timer_id: timerId,
			item_id: taskId,
			log_name: `${TEST_PREFIX} Log ${Date.now()}`,
			date: getTodayDate(),
			project_id: projectId,
			type: 'task',
			bill_status: 'Billable',
			notes: stopNotes,
		});
		const stopData = extractJsonObject(parseToolResponse(stopResponse));

		activeTimerIds.delete(timerId);
		await wait(1000);

		const listResponse = await callTool(client, 'list_time_logs', {
			project_id: projectId,
			view_type: 'customdate',
			start_date: getTodayDate(),
			end_date: getTodayDate(),
			page: 1,
			per_page: 200,
			module_type: 'task',
			module_id: taskId,
		});
		const logs = flattenTimeLogs(parseToolResponse(listResponse));
		const matchedLog = logs.find((log: any) => {
			const notes = String(log?.notes || log?.log_notes || '');
			return notes.includes(stopNotes) || String(log?.id || '') === String(stopData?.id || '');
		});

		if (!matchedLog?.id) {
			throw new Error('Expected stop_timer to create a task time log');
		}

		createdLogId = String(matchedLog.id);
		logTestSuccess(testName, { timerId, logId: createdLogId });
		return createdLogId;
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testGetTimerDetailsByLogId(client: Client, projectId: string, logId: string) {
	const testName = 'get_timer_details_by_log_id';
	logTestStart(testName);

	try {
		const response = await callTool(client, 'get_timer_details_by_log_id', {
			project_id: projectId,
			entity_type: 'task',
			log_id: logId,
		});
		const data = parseToolResponse(response);

		if (!Array.isArray(data?.timer_notes)) {
			throw new Error('Expected timer_notes array in timer details response');
		}

		logTestSuccess(testName, { logId, timerNotes: data.timer_notes.length });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function testDeleteTimer(client: Client, timerId: string, taskName: string) {
	const testName = 'delete_timer';
	logTestStart(testName);

	try {
		await callTool(client, 'delete_timer', { timer_id: timerId });
		activeTimerIds.delete(timerId);
		await wait(1000);

		const runningResponse = await callTool(client, 'get_running_timers', {
			type: 'task',
			for_all: 'false',
		});
		const runningTimers = getRunningTimers(parseToolResponse(runningResponse));
		const stillRunning = runningTimers.some(
			(timer) => String(timer.id) === timerId || timer.title === taskName,
		);

		if (stillRunning) {
			throw new Error(`Deleted timer ${timerId} still appears in running timers`);
		}

		logTestSuccess(testName, { timerId });
	} catch (error) {
		logTestFailure(testName, error);
		throw error;
	}
}

async function main() {
	let client: Client | null = null;

	try {
		console.log('Starting Timer Smoke Tests');
		const env = loadEnv();
		client = await createMcpClient();
		await testTimerToolSchemas(client);

		const testProject = await initializeTestEnvironment(client);
		await cleanupPriorTestTimers(client);
		await cleanupPriorTestTasks(client, testProject.projectId);

		const modulesData = await fetchProjectModules(env, testProject.projectId);
		const modules = Array.isArray(modulesData?.modules) ? modulesData.modules : [];
		const taskModule = modules.find((module: any) => {
			const moduleName = String(module?.module_name || '').toLowerCase();
			const displayName = String(module?.display_name || '').toLowerCase();
			return moduleName === 'task' || displayName === 'task';
		});

		if (!taskModule?.module_id) {
			throw new Error('Could not resolve Task module ID for start_timer');
		}

		const currentUserZpuid = await resolveCurrentUserZpuidFromTaskProbe(
			client,
			testProject.projectId,
		);
		const { taskId, taskName } = await createTimerTask(
			client,
			testProject.projectId,
			currentUserZpuid,
		);
		const firstTimer = await startTimerAndFindIt(
			client,
			testProject.projectId,
			taskId,
			taskName,
			String(taskModule.module_id),
		);
		await testPauseTimer(client, firstTimer, taskId);
		await testResumeTimer(client, firstTimer, taskId);
		const logId = await testStopTimer(client, testProject.projectId, taskId, String(firstTimer.id));
		await testGetTimerDetailsByLogId(client, testProject.projectId, logId);

		const secondTimer = await startTimerAndFindIt(
			client,
			testProject.projectId,
			taskId,
			taskName,
			String(taskModule.module_id),
		);
		await testDeleteTimer(client, String(secondTimer.id), taskName);
	} catch (error) {
		console.error('Timer smoke tests failed:', error);
		process.exitCode = 1;
	} finally {
		if (client) {
			for (const timerId of activeTimerIds) {
				try {
					await callTool(client, 'delete_timer', { timer_id: timerId });
				} catch {
					// Best-effort cleanup only.
				}
			}

			if (createdLogId && createdTaskId) {
				try {
					const testProject = await initializeTestEnvironment(client);
					await callTool(client, 'delete_time_log', {
						project_id: testProject.projectId,
						log_id: createdLogId,
						module_type: 'task',
					});
				} catch {
					// Best-effort cleanup only.
				}
			}

			if (createdTaskId) {
				try {
					const testProject = await initializeTestEnvironment(client);
					await callTool(client, 'delete_task', {
						project_id: testProject.projectId,
						task_id: createdTaskId,
					});
				} catch {
					// Best-effort cleanup only.
				}
			}

			await cleanup(client);
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
