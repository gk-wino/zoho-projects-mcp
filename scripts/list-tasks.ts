#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type TaskOwner = {
	name?: string;
};

type Task = Record<string, unknown> & {
	id?: number | string;
	name?: string;
	status?: {
		name?: string;
	};
	owners_and_work?: {
		owners?: TaskOwner[];
	};
	created_by?: {
		name?: string;
	};
};

type TaskListResponse = {
	page_info?: Record<string, unknown>;
	tasks: Task[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(repoRoot, '.env');
const serverPath = path.resolve(repoRoot, 'dist', 'index.js');
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
			name: 'list-tasks-script',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	await client.connect(transport);

	return { client, transport };
}

function parseToolResponse(response: unknown): TaskListResponse {
	if (
		!response ||
		typeof response !== 'object' ||
		!('content' in response) ||
		!Array.isArray(response.content) ||
		response.content.length === 0
	) {
		throw new Error('Empty response from list_tasks tool');
	}

	const [firstContent] = response.content;
	if (!firstContent || typeof firstContent !== 'object' || firstContent.type !== 'text') {
		throw new Error('Unexpected response content type from list_tasks tool');
	}

	const parsed = JSON.parse(firstContent.text);
	if (
		!parsed ||
		typeof parsed !== 'object' ||
		!('tasks' in parsed) ||
		!Array.isArray(parsed.tasks)
	) {
		throw new Error('Expected list_tasks to return an object with a tasks array');
	}

	return parsed as TaskListResponse;
}

function requireProjectId(projectId: string): string {
	const trimmed = projectId.trim();
	if (!trimmed) {
		throw new Error('A project ID is required. Usage: npm run list:tasks -- <projectId>');
	}

	return trimmed;
}

export function getTasksDataPath(projectId: string): string {
	return path.resolve(repoRoot, 'data', `tasks-${requireProjectId(projectId)}.json`);
}

export async function listProjectTasks(
	projectId: string,
	perPage: number = 100,
): Promise<TaskListResponse> {
	const normalizedProjectId = requireProjectId(projectId);
	loadEnv();
	ensureBuiltServer();

	const { client, transport } = await createMcpClient();

	try {
		const tasks: Task[] = [];
		let page = 1;
		let lastPageInfo: Record<string, unknown> | undefined;

		while (true) {
			const response = await client.callTool({
				name: 'list_tasks',
				arguments: {
					project_id: normalizedProjectId,
					page,
					per_page: perPage,
				},
			});

			const pageData = parseToolResponse(response);
			tasks.push(...pageData.tasks);
			lastPageInfo = pageData.page_info;

			if (pageData.tasks.length < perPage) {
				break;
			}

			page += 1;
		}

		return {
			page_info: lastPageInfo,
			tasks,
		};
	} finally {
		await client.close();
		await transport.close();
	}
}

export async function writeTasksFile(projectId: string, tasks: Task[]): Promise<void> {
	const dataPath = getTasksDataPath(projectId);
	await fsp.mkdir(path.dirname(dataPath), { recursive: true });
	await fsp.writeFile(dataPath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
}

export function formatTasksSummary(projectId: string, tasks: Task[]): string {
	const normalizedProjectId = requireProjectId(projectId);
	const lines = [`Project ID: ${normalizedProjectId}`, `Total tasks: ${tasks.length}`];

	if (tasks.length === 0) {
		lines.push('No tasks found for the supplied project.');
	} else {
		for (const [index, task] of tasks.entries()) {
			const status = task.status?.name || 'N/A';
			const owner = task.owners_and_work?.owners?.[0]?.name || task.created_by?.name || 'N/A';

			lines.push(
				`${index + 1}. ${task.name || 'Unnamed task'} (ID: ${task.id || 'N/A'}) - Status: ${status} - Owner: ${owner}`,
			);
		}
	}

	return lines.join('\n');
}

async function main(): Promise<void> {
	try {
		const projectId = requireProjectId(process.argv[2] || '');
		const taskData = await listProjectTasks(projectId);
		await writeTasksFile(projectId, taskData.tasks);
		console.log(formatTasksSummary(projectId, taskData.tasks));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to list tasks: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}
