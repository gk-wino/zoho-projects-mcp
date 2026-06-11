#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type Project = Record<string, unknown> & {
	id?: number | string;
	name?: string;
	project_type?: string;
	status?: {
		name?: string;
	};
	owner_name?: string;
	created_by?: {
		name?: string;
	};
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
			name: 'list-projects-script',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	await client.connect(transport);

	return { client, transport };
}

function parseToolResponse(response: unknown): Project[] {
	if (
		!response ||
		typeof response !== 'object' ||
		!('content' in response) ||
		!Array.isArray(response.content) ||
		response.content.length === 0
	) {
		throw new Error('Empty response from list_projects tool');
	}

	const [firstContent] = response.content;
	if (!firstContent || typeof firstContent !== 'object' || firstContent.type !== 'text') {
		throw new Error('Unexpected response content type from list_projects tool');
	}

	const parsed = JSON.parse(firstContent.text);
	if (!Array.isArray(parsed)) {
		throw new Error('Expected list_projects to return an array of projects');
	}

	return parsed as Project[];
}

export async function listAllProjects(perPage: number = 100): Promise<Project[]> {
	loadEnv();
	ensureBuiltServer();

	const { client, transport } = await createMcpClient();

	try {
		const projects: Project[] = [];
		let page = 1;

		while (true) {
			const response = await client.callTool({
				name: 'list_projects',
				arguments: {
					page,
					per_page: perPage,
				},
			});

			const pageProjects = parseToolResponse(response);
			projects.push(...pageProjects);

			if (pageProjects.length < perPage) {
				break;
			}

			page += 1;
		}

		return projects;
	} finally {
		await client.close();
		await transport.close();
	}
}

export function formatProjectsReport(projects: Project[]): string {
	const lines = [`Total projects: ${projects.length}`];

	if (projects.length === 0) {
		lines.push('No projects found for the configured portal.');
	} else {
		for (const [index, project] of projects.entries()) {
			const owner =
				project.owner_name ||
				project.created_by?.name ||
				'N/A';
			const status = project.status?.name || project.project_type || 'N/A';

			lines.push(
				`${index + 1}. ${project.name || 'Unnamed project'} (ID: ${project.id || 'N/A'}) - Status: ${status} - Owner: ${owner}`,
			);
		}
	}

	lines.push('');
	lines.push('Raw JSON:');
	lines.push(JSON.stringify(projects, null, 2));

	return lines.join('\n');
}

async function main(): Promise<void> {
	try {
		const projects = await listAllProjects();
		console.log(formatProjectsReport(projects));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to list projects: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}
