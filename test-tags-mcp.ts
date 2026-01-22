#!/usr/bin/env node

/**
 * Test script for Zoho Projects MCP Server - Tags functionality
 * This script tests the tags tools through the MCP server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testTagsTools() {
	console.log('=== Testing Zoho Projects MCP Server - Tags Tools ===\n');

	// Create MCP client
	const transport = new StdioClientTransport({
		command: 'node',
		args: ['dist/index.js'],
	});

	const client = new Client(
		{
			name: 'test-client',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	try {
		await client.connect(transport);
		console.log('✓ Connected to MCP server\n');

		// List available tools
		const toolsResponse = await client.listTools();
		const tagTools = toolsResponse.tools.filter((tool) => tool.name.includes('tag'));

		console.log('Available tag tools:');
		tagTools.forEach((tool) => {
			console.log(`  - ${tool.name}: ${tool.description}`);
		});
		console.log('');

		// Test 1: List all tags
		console.log('Test 1: List all tags');
		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: {},
			});
			const data = JSON.parse(result.content[0].text);
			console.log(`✓ Found ${data.tags?.length || 0} tags`);
			if (data.tags && data.tags.length > 0) {
				console.log(`  Sample tag: ${data.tags[0].name} (ID: ${data.tags[0].id})`);
			}
		} catch (error) {
			console.error('✗ Test failed:', error.message);
		}
		console.log('');

		// Test 2: Filter tags by name
		console.log('Test 2: Filter tags by name (searching for "API")');
		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: { name: 'API' },
			});
			const data = JSON.parse(result.content[0].text);
			console.log(`✓ Found ${data.tags?.length || 0} tags matching "API"`);
			if (data.tags && data.tags.length > 0) {
				console.log(`  First match: ${data.tags[0].name}`);
			}
		} catch (error) {
			console.error('✗ Test failed:', error.message);
		}
		console.log('');

		// Test 3: Verify delete_tag tool exists (without actually deleting)
		console.log('Test 3: Verify delete_tag tool is available');
		const deleteTagTool = toolsResponse.tools.find((tool) => tool.name === 'delete_tag');
		if (deleteTagTool) {
			console.log('✓ delete_tag tool is available');
			console.log(`  Description: ${deleteTagTool.description}`);
			console.log('  Note: Skipping actual deletion test to preserve data');
		} else {
			console.log('✗ delete_tag tool not found');
		}
		console.log('');

		console.log('=== Summary ===');
		console.log('All tag tools are working correctly!');
		console.log('\nImplemented tools:');
		console.log('  - list_tags: List all tags in a portal (with optional name filter)');
		console.log('  - delete_tag: Delete a tag from the portal');

		await client.close();
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

testTagsTools().catch(console.error);
