#!/usr/bin/env node

/**
 * Live test for Zoho Projects MCP Server - Tags functionality
 * Tests tags operations on project 1817452000005334019 (Test MCP)
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const PROJECT_ID = '1817452000005334019'; // Test MCP project

async function testTagsLive() {
	console.log('╔════════════════════════════════════════════════════════════╗');
	console.log('║  Zoho Projects MCP - Live Tags Functionality Test         ║');
	console.log('║  Project: Test MCP (1817452000005334019)                  ║');
	console.log('╚════════════════════════════════════════════════════════════╝\n');

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

	let testsPassed = 0;
	let testsFailed = 0;

	try {
		await client.connect(transport);
		console.log('✅ Connected to MCP server\n');

		// Test 1: List all available tools
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 1: Verify tags tools are registered');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const toolsResponse = await client.listTools();
			const tagTools = toolsResponse.tools.filter((tool) => tool.name.includes('tag'));

			console.log(`Found ${tagTools.length} tag-related tools:`);
			tagTools.forEach((tool) => {
				console.log(`  ✓ ${tool.name}: ${tool.description}`);
			});

			if (tagTools.length === 2) {
				console.log('✅ PASSED - Both tag tools found\n');
				testsPassed++;
			} else {
				console.log('❌ FAILED - Expected 2 tag tools\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Test 2: List all tags
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 2: List all tags in portal');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: {},
			});

			const data = JSON.parse(result.content[0].text);

			if (data.tags && Array.isArray(data.tags)) {
				console.log(`✅ PASSED - Found ${data.tags.length} tags`);

				// Show first 5 tags as sample
				console.log('\nSample tags:');
				data.tags.slice(0, 5).forEach((tag: any, index: number) => {
					console.log(`  ${index + 1}. ${tag.name}`);
					console.log(`     ID: ${tag.id}`);
					console.log(`     Color: ${tag.color_hexcode || 'N/A'}`);
					console.log(`     Usage: ${tag.usage_count || 0} times`);
				});
				console.log('');
				testsPassed++;
			} else {
				console.log('❌ FAILED - Invalid response format\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Test 3: Filter tags by name - "API"
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 3: Filter tags by name (search: "API")');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: { name: 'API' },
			});

			const data = JSON.parse(result.content[0].text);

			if (data.tags && Array.isArray(data.tags)) {
				const matchingTags = data.tags.filter((tag: any) => tag.name.toUpperCase().includes('API'));

				console.log(`✅ PASSED - Found ${data.tags.length} results`);

				if (matchingTags.length > 0) {
					console.log(`\nTags containing "API" (showing first 5):`);
					matchingTags.slice(0, 5).forEach((tag: any, index: number) => {
						console.log(`  ${index + 1}. ${tag.name} (ID: ${tag.id})`);
					});
				}
				console.log('');
				testsPassed++;
			} else {
				console.log('❌ FAILED - Invalid response format\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Test 4: Filter tags by name - "Backend"
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 4: Filter tags by name (search: "Backend")');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: { name: 'Backend' },
			});

			const data = JSON.parse(result.content[0].text);

			if (data.tags && Array.isArray(data.tags)) {
				const matchingTags = data.tags.filter((tag: any) =>
					tag.name.toUpperCase().includes('BACKEND'),
				);

				console.log(`✅ PASSED - Found ${data.tags.length} results`);

				if (matchingTags.length > 0) {
					console.log(`\nTags containing "Backend" (showing first 3):`);
					matchingTags.slice(0, 3).forEach((tag: any, index: number) => {
						console.log(`  ${index + 1}. ${tag.name} (ID: ${tag.id})`);
					});
				} else {
					console.log('Note: No tags contain "Backend" in their name');
				}
				console.log('');
				testsPassed++;
			} else {
				console.log('❌ FAILED - Invalid response format\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Test 5: Test empty search
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 5: Empty name filter (should return all tags)');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: { name: '' },
			});

			const data = JSON.parse(result.content[0].text);

			if (data.tags && Array.isArray(data.tags)) {
				console.log(`✅ PASSED - Found ${data.tags.length} tags\n`);
				testsPassed++;
			} else {
				console.log('❌ FAILED - Invalid response format\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Test 6: Verify delete_tag tool (without actually deleting)
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('Test 6: Verify delete_tag tool availability');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

		try {
			const toolsResponse = await client.listTools();
			const deleteTagTool = toolsResponse.tools.find((tool) => tool.name === 'delete_tag');

			if (deleteTagTool) {
				console.log('✅ PASSED - delete_tag tool is available');
				console.log(`   Description: ${deleteTagTool.description}`);
				console.log('   Required params: tag_id');
				console.log('   (Skipping actual deletion to preserve data)\n');
				testsPassed++;
			} else {
				console.log('❌ FAILED - delete_tag tool not found\n');
				testsFailed++;
			}
		} catch (error) {
			console.error('❌ FAILED:', error.message, '\n');
			testsFailed++;
		}

		// Summary
		console.log('╔════════════════════════════════════════════════════════════╗');
		console.log('║  Test Summary                                              ║');
		console.log('╚════════════════════════════════════════════════════════════╝');
		console.log(`Total Tests: ${testsPassed + testsFailed}`);
		console.log(`✅ Passed: ${testsPassed}`);
		console.log(`❌ Failed: ${testsFailed}`);
		console.log('');

		if (testsFailed === 0) {
			console.log('╔════════════════════════════════════════════════════════════╗');
			console.log('║  🎉 All tests passed! Tags functionality is working! 🎉   ║');
			console.log('╚════════════════════════════════════════════════════════════╝');
		} else {
			console.log('⚠️  Some tests failed. Please review the errors above.');
		}
		console.log('');

		console.log('Available MCP Tools for Tags:');
		console.log('  • list_tags(name?: string)');
		console.log('  • delete_tag(tag_id: string)');
		console.log('');

		await client.close();
		process.exit(testsFailed > 0 ? 1 : 0);
	} catch (error) {
		console.error('Fatal error:', error);
		process.exit(1);
	}
}

testTagsLive().catch(console.error);
