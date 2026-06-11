#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type TimeLog = Record<string, unknown> & {
	id?: number | string;
	log_name?: string;
	date?: string;
	hours?: string;
};

type Task = Record<string, unknown> & {
	id?: number | string;
	name?: string;
};

const DEBUG_PREFIX = 'MCP Timelog Debug';
const TEST_PROJECT_NAME = 'Zoho Project MCP Tests';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(repoRoot, '.env');
const serverPath = path.resolve(repoRoot, 'dist', 'index.js');
const cacheFilePath = path.resolve(repoRoot, 'tests', 'smoke', '.test-project-cache.json');
const requiredEnvVars = ['ZOHO_ACCESS_TOKEN', 'ZOHO_PORTAL_ID'];

function loadEnv(): void {
	const result = dotenv.config({ path: envPath });

	if (result.error) {
		throw new Error(`Failed to load .env file from ${envPath}: ${result.error.message}`);
	}

	const missing = requiredEnvVars.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
}

function ensureBuiltServer(): void {
	if (!fs.existsSync(serverPath)) {
		throw new Error(`Built MCP server not found at ${serverPath}. Run "npm run build" first.`);
	}
}

async function createMcpClient(): Promise<{
	client: Client;
	transport: StdioClientTransport;
}> {
	const transport = new StdioClientTransport({
		command: 'node',
		args: [serverPath],
		env: process.env as Record<string, string>,
	});

	const client = new Client(
		{
			name: 'create-timelogs-script',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	await client.connect(transport);

	return { client, transport };
}

function parseToolResponse(response: unknown): any {
	if (
		!response ||
		typeof response !== 'object' ||
		!('content' in response) ||
		!Array.isArray(response.content) ||
		response.content.length === 0
	) {
		throw new Error('Empty response from tool');
	}

	const [firstContent] = response.content;
	if (!firstContent || typeof firstContent !== 'object' || firstContent.type !== 'text') {
		throw new Error('Unexpected response content type');
	}

	try {
		return JSON.parse(firstContent.text);
	} catch {
		return firstContent.text;
	}
}

function getTodayDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function getArgValue(flag: string): string | undefined {
	const index = process.argv.indexOf(flag);
	if (index === -1) {
		return undefined;
	}

	return process.argv[index + 1];
}

function getPositionalProjectId(): string | undefined {
	let skipNext = false;

	for (const arg of process.argv.slice(2)) {
		if (skipNext) {
			skipNext = false;
			continue;
		}

		if (arg === '--count' || arg === '--task-id') {
			skipNext = true;
			continue;
		}

		if (!arg.startsWith('--')) {
			return arg;
		}
	}

	return undefined;
}

function getCount(): number {
	const rawCount = getArgValue('--count');
	if (!rawCount) {
		return 3;
	}

	const parsedCount = Number.parseInt(rawCount, 10);
	if (!Number.isFinite(parsedCount) || parsedCount < 1) {
		throw new Error(`Invalid --count value: ${rawCount}`);
	}

	return parsedCount;
}

function getTimeLogsDataPath(projectId: string): string {
	return path.resolve(repoRoot, 'data', `timelogs-${projectId}.json`);
}

async function resolveProjectId(client: Client, explicitProjectId?: string): Promise<string> {
	if (explicitProjectId) {
		return explicitProjectId;
	}

	try {
		const cacheData = await fsp.readFile(cacheFilePath, 'utf8');
		const cached = JSON.parse(cacheData) as { projectId?: string };
		if (cached.projectId) {
			console.log(`Using cached test project: ${cached.projectId}`);
			return String(cached.projectId);
		}
	} catch {
		// Ignore cache misses and continue to project lookup.
	}

	const response = await client.callTool({
		name: 'list_projects',
		arguments: {
			page: 1,
			per_page: 100,
		},
	});
	const projects = parseToolResponse(response);

	if (Array.isArray(projects)) {
		const testProject = projects.find((project: any) => project?.name === TEST_PROJECT_NAME);
		if (testProject?.id) {
			return String(testProject.id);
		}
	}

	throw new Error(
		'Could not resolve a project ID. Pass one explicitly or create the test project first.',
	);
}

async function discoverTask(client: Client, projectId: string): Promise<Task | null> {
	const response = await client.callTool({
		name: 'list_tasks',
		arguments: {
			project_id: projectId,
			page: 1,
			per_page: 10,
		},
	});
	const data = parseToolResponse(response);

	if (!Array.isArray(data?.tasks) || data.tasks.length === 0) {
		return null;
	}

	const [firstTask] = data.tasks;
	if (!firstTask?.id) {
		return null;
	}

	return firstTask as Task;
}

async function createTimeLog(
	client: Client,
	projectId: string,
	index: number,
	taskId?: string,
): Promise<Record<string, unknown>> {
	const useTaskLog = Boolean(taskId);
	const response = await client.callTool({
		name: 'create_time_log',
		arguments: {
			project_id: projectId,
			module_type: useTaskLog ? 'task' : 'general',
			...(taskId ? { module_id: taskId } : {}),
			log_name: `${DEBUG_PREFIX} ${index + 1} ${Date.now()}`,
			date: getTodayDate(),
			bill_status: index % 2 === 0 ? 'Billable' : 'Non Billable',
			hours: '01:00',
			notes: useTaskLog
				? 'Created by debug:timelog as a task-linked entry'
				: 'Created by debug:timelog as a general entry',
		},
	});

	return parseToolResponse(response);
}

function flattenTimeLogs(data: any): TimeLog[] {
	if (!Array.isArray(data?.time_logs)) {
		return [];
	}

	return data.time_logs.flatMap((entry: any) =>
		Array.isArray(entry?.log_details) ? entry.log_details : [],
	);
}

async function listTimeLogs(
	client: Client,
	projectId: string,
	moduleType: 'general' | 'task',
	moduleId?: string,
): Promise<TimeLog[]> {
	const response = await client.callTool({
		name: 'list_time_logs',
		arguments: {
			project_id: projectId,
			view_type: 'customdate',
			start_date: getTodayDate(),
			end_date: getTodayDate(),
			page: 1,
			per_page: 200,
			module_type: moduleType,
			...(moduleId ? { module_id: moduleId } : {}),
		},
	});
	const data = parseToolResponse(response);

	return flattenTimeLogs(data);
}

function summarizeCreatedLogs(createdLogs: Array<Record<string, unknown>>): string[] {
	return createdLogs.map((log, index) => {
		const moduleType = String(log.module_type || 'unknown');
		const logName = String(log.log_name || log.name || 'Unnamed');
		const taskSuffix = log.module_id ? ` task=${String(log.module_id)}` : '';
		return `${index + 1}. ${logName} (ID: ${String(log.id || 'N/A')}) module=${moduleType}${taskSuffix}`;
	});
}

function countMatchingIds(logs: TimeLog[], ids: string[]): number {
	const idSet = new Set(ids);
	return logs.reduce((count, log) => {
		const logId = log?.id ? String(log.id) : '';
		return idSet.has(logId) ? count + 1 : count;
	}, 0);
}

async function writeDataFile(projectId: string, data: Record<string, unknown>): Promise<string> {
	const dataPath = getTimeLogsDataPath(projectId);
	await fsp.mkdir(path.dirname(dataPath), { recursive: true });
	await fsp.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
	return dataPath;
}

async function main(): Promise<void> {
	loadEnv();
	ensureBuiltServer();

	const explicitProjectId = getPositionalProjectId();
	const explicitTaskId = getArgValue('--task-id');
	const count = getCount();
	const { client, transport } = await createMcpClient();

	try {
		const projectId = await resolveProjectId(client, explicitProjectId);
		const discoveredTask = explicitTaskId
			? { id: explicitTaskId, name: 'Explicit task' }
			: await discoverTask(client, projectId);
		const taskId = discoveredTask?.id ? String(discoveredTask.id) : undefined;
		const createdLogs: Array<Record<string, unknown>> = [];

		for (let index = 0; index < count; index += 1) {
			const shouldCreateTaskLog = Boolean(taskId) && (count === 1 || index > 0);
			const created = await createTimeLog(
				client,
				projectId,
				index,
				shouldCreateTaskLog ? taskId : undefined,
			);
			createdLogs.push({
				id: created?.id,
				log_name: created?.log_name,
				module_type: shouldCreateTaskLog ? 'task' : 'general',
				module_id: shouldCreateTaskLog ? taskId : undefined,
			});
		}

		const generalLogs = await listTimeLogs(client, projectId, 'general');
		const taskLogs = taskId ? await listTimeLogs(client, projectId, 'task', taskId) : [];
		const createdGeneralIds = createdLogs
			.filter((log) => log.module_type === 'general' && log.id)
			.map((log) => String(log.id));
		const createdTaskIds = createdLogs
			.filter((log) => log.module_type === 'task' && log.id)
			.map((log) => String(log.id));
		const matchedGeneralLogs = countMatchingIds(generalLogs, createdGeneralIds);
		const matchedTaskLogs = countMatchingIds(taskLogs, createdTaskIds);
		const dataPath = await writeDataFile(projectId, {
			projectId,
			task: discoveredTask,
			created: createdLogs,
			listed: {
				general: generalLogs,
				task: taskLogs,
			},
			matched: {
				general: matchedGeneralLogs,
				task: matchedTaskLogs,
			},
		});

		console.log(`Project ID: ${projectId}`);
		console.log(`Created logs: ${createdLogs.length}`);
		if (taskId) {
			console.log(`Task-linked logs used task ID: ${taskId}`);
		} else {
			console.log('No task ID available; created general logs only.');
		}
		for (const line of summarizeCreatedLogs(createdLogs)) {
			console.log(line);
		}
		console.log(
			`Listed general logs today: ${generalLogs.length} (matched created: ${matchedGeneralLogs})`,
		);
		console.log(`Listed task logs today: ${taskLogs.length} (matched created: ${matchedTaskLogs})`);
		console.log(`Wrote data file: ${dataPath}`);
	} finally {
		await client.close();
		await transport.close();
	}
}

const isEntrypoint = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

if (isEntrypoint) {
	main().catch((error) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to create timelogs: ${message}`);
		process.exitCode = 1;
	});
}
