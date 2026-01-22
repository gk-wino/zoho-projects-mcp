import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store transport for cleanup
let serverTransport: StdioClientTransport | null = null;

// Load environment variables from .env file
export function loadEnv() {
	const envPath = path.resolve(__dirname, '../../.env');
	const result = dotenv.config({ path: envPath });

	if (result.error) {
		throw new Error(`Failed to load .env file: ${result.error.message}`);
	}

	// Validate required environment variables
	const required = [
		'ZOHO_ACCESS_TOKEN',
		'ZOHO_REFRESH_TOKEN',
		'ZOHO_CLIENT_ID',
		'ZOHO_CLIENT_SECRET',
		'ZOHO_PORTAL_ID',
	];

	const missing = required.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}

	return {
		accessToken: process.env.ZOHO_ACCESS_TOKEN!,
		refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
		clientId: process.env.ZOHO_CLIENT_ID!,
		clientSecret: process.env.ZOHO_CLIENT_SECRET!,
		portalId: process.env.ZOHO_PORTAL_ID!,
		apiDomain: process.env.ZOHO_API_DOMAIN || 'https://projectsapi.zoho.com',
		accountsDomain: process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com',
	};
}

// Create MCP client connected to the stdio server
export async function createMcpClient(): Promise<Client> {
	const serverPath = path.resolve(__dirname, '../../dist/index.js');

	// Create stdio transport (this will spawn the server process)
	const transport = new StdioClientTransport({
		command: 'node',
		args: [serverPath],
		env: process.env as Record<string, string>,
	});

	// Store reference to transport for cleanup
	serverTransport = transport;

	// Create MCP client
	const client = new Client(
		{
			name: 'smoke-test-client',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	// Connect to the server
	await client.connect(transport);

	return client;
}

// Call a tool on the MCP server
export async function callTool(client: Client, toolName: string, args: Record<string, any> = {}) {
	try {
		const result = await client.callTool({
			name: toolName,
			arguments: args,
		});

		return result;
	} catch (error) {
		console.error(`Error calling tool ${toolName}:`, error);
		throw error;
	}
}

// Parse tool response content
export function parseToolResponse(response: any): any {
	if (!response || !response.content || response.content.length === 0) {
		throw new Error('Empty response from tool');
	}

	const content = response.content[0];

	if (content.type === 'text') {
		try {
			return JSON.parse(content.text);
		} catch {
			return content.text;
		}
	}

	return content;
}

// Initialize test environment with cached test project
export async function initializeTestEnvironment(client: Client): Promise<{
	projectId: string;
	projectName: string;
	projectKey?: string;
}> {
	const cacheFilePath = path.resolve(__dirname, '.test-project-cache.json');
	const testProjectName = 'Zoho Project MCP Tests';

	// Try to read from cache first
	try {
		const cacheData = await fs.readFile(cacheFilePath, 'utf-8');
		const cached = JSON.parse(cacheData);
		console.log(`✅ Using cached test project: ${cached.projectName} (ID: ${cached.projectId})`);
		return cached;
	} catch (error) {
		// Cache doesn't exist or is invalid, proceed to search/create
	}

	console.log(`🔍 Searching for test project: ${testProjectName}`);

	// Search for the test project
	try {
		const response = await callTool(client, 'list_projects', {
			page: 1,
			per_page: 100,
		});
		const projects = parseToolResponse(response);

		if (Array.isArray(projects)) {
			const testProject = projects.find(
				(project: any) => project.name === testProjectName,
			);

			if (testProject) {
				console.log(`✅ Found existing test project (ID: ${testProject.id})`);
				const projectData = {
					projectId: testProject.id,
					projectName: testProject.name,
					projectKey: testProject.key,
				};

				// Cache the project data
				await fs.writeFile(cacheFilePath, JSON.stringify(projectData, null, 2), 'utf-8');
				return projectData;
			}
		}
	} catch (error) {
		console.warn('⚠️  Error searching for test project:', error);
	}

	// Project not found, create it
	console.log(`🔨 Creating new test project: ${testProjectName}`);

	const currentYear = new Date().getFullYear();
	const createResponse = await callTool(client, 'create_project', {
		name: testProjectName,
		description:
			'Persistent test project for MCP smoke tests. This project is used for testing task lists, tasks, and other features.',
		project_type: 'active',
		start_date: `${currentYear}-01-01`,
		end_date: `${currentYear + 1}-12-31`,
		is_public_project: false,
	});

	const createdProject = parseToolResponse(createResponse);
	console.log(`✅ Created test project (ID: ${createdProject.id})`);

	const projectData = {
		projectId: createdProject.id,
		projectName: createdProject.name,
		projectKey: createdProject.key,
	};

	// Cache the project data
	await fs.writeFile(cacheFilePath, JSON.stringify(projectData, null, 2), 'utf-8');

	return projectData;
}

// Test result logging
export function logTestStart(testName: string) {
	console.log(`\n${'='.repeat(60)}`);
	console.log(`🧪 TEST: ${testName}`);
	console.log('='.repeat(60));
}

export function logTestSuccess(testName: string, data?: any) {
	console.log(`✅ PASSED: ${testName}`);
	if (data) {
		console.log('Response:', JSON.stringify(data, null, 2));
	}
}

export function logTestFailure(testName: string, error: any): boolean {
	// Check if it's a permission error
	if (error.message && error.message.includes('PERMISSION_ERROR')) {
		console.log('\n⚠️  Warning: Insufficient permissions for this operation');
		console.log('   This is likely due to API account restrictions');
		console.log('   Test SKIPPED (not a failure)');
		return false; // Don't throw error
	}

	console.error(`❌ FAILED: ${testName}`);
	console.error('Error:', error.message || error);
	return true; // Throw error
}

// Wait for a specific amount of time
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Graceful cleanup
export async function cleanup(client: Client) {
	try {
		console.log('\n🧹 Cleaning up...');

		// Close the client connection first
		await client.close();

		// Close the transport to terminate the server process
		if (serverTransport) {
			await serverTransport.close();
			serverTransport = null;
		}

		console.log('✨ Cleanup completed');
	} catch (error) {
		console.error('Error during cleanup:', error);
	}
}
