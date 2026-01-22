import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store server process for cleanup
let serverProcess: any = null;

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
		env: process.env,
	});

	// Store reference to the underlying process for cleanup
	serverProcess = (transport as any).process;

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

export function logTestFailure(testName: string, error: any) {
	console.error(`❌ FAILED: ${testName}`);
	console.error('Error:', error.message || error);
}

// Wait for a specific amount of time
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Graceful cleanup
export async function cleanup(client: Client) {
	try {
		console.log('\n🧹 Cleaning up...');

		// Close the client connection
		await client.close();

		// Kill the server process if it exists
		if (serverProcess && !serverProcess.killed) {
			serverProcess.kill('SIGTERM');

			// Force kill if it doesn't exit in 2 seconds
			setTimeout(() => {
				if (!serverProcess.killed) {
					serverProcess.kill('SIGKILL');
				}
			}, 2000);
		}

		console.log('✨ Cleanup completed');
	} catch (error) {
		console.error('Error during cleanup:', error);
	}
}
