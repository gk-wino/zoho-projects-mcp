#!/usr/bin/env node

/**
 * Practical demonstration of tags functionality with Test MCP project
 * Shows how tags can be used in a real workflow
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const PROJECT_ID = '1817452000005334019'; // Test MCP project

async function demonstrateTags() {
	console.log('╔════════════════════════════════════════════════════════════╗');
	console.log('║  Zoho Projects Tags - Practical Demonstration             ║');
	console.log('║  Project: Test MCP (1817452000005334019)                  ║');
	console.log('╚════════════════════════════════════════════════════════════╝\n');

	const transport = new StdioClientTransport({
		command: 'node',
		args: ['dist/index.js'],
	});

	const client = new Client(
		{
			name: 'demo-client',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	try {
		await client.connect(transport);
		console.log('✅ Connected to MCP server\n');

		// Demo 1: Browse all tags
		console.log('═══════════════════════════════════════════════════════════');
		console.log('Demo 1: Browsing available tags in the portal');
		console.log('═══════════════════════════════════════════════════════════\n');

		const allTagsResult = await client.callTool({
			name: 'list_tags',
			arguments: {},
		});

		const allTags = JSON.parse(allTagsResult.content[0].text);
		console.log(`📊 Total tags available: ${allTags.tags.length}\n`);

		// Show tag statistics
		const usedTags = allTags.tags.filter((tag: any) => tag.usage_count > 0);
		const unusedTags = allTags.tags.filter((tag: any) => tag.usage_count === 0);

		console.log('Tag Statistics:');
		console.log(`  • Used tags: ${usedTags.length}`);
		console.log(`  • Unused tags: ${unusedTags.length}`);
		console.log('');

		// Demo 2: Find tags by category
		console.log('═══════════════════════════════════════════════════════════');
		console.log('Demo 2: Finding tags by category');
		console.log('═══════════════════════════════════════════════════════════\n');

		const categories = ['API', 'Backend', 'Frontend', 'Bug', 'Testing'];

		for (const category of categories) {
			const result = await client.callTool({
				name: 'list_tags',
				arguments: { name: category },
			});

			const data = JSON.parse(result.content[0].text);
			const matching = data.tags.filter((tag: any) =>
				tag.name.toUpperCase().includes(category.toUpperCase()),
			);

			if (matching.length > 0) {
				console.log(`🏷️  "${category}" related tags (${matching.length} found):`);
				matching.slice(0, 3).forEach((tag: any) => {
					console.log(`   • ${tag.name} (ID: ${tag.id})`);
				});
				if (matching.length > 3) {
					console.log(`   ... and ${matching.length - 3} more`);
				}
			} else {
				console.log(`🏷️  "${category}" related tags: None found`);
			}
			console.log('');
		}

		// Demo 3: Show popular tags by color
		console.log('═══════════════════════════════════════════════════════════');
		console.log('Demo 3: Tag colors distribution');
		console.log('═══════════════════════════════════════════════════════════\n');

		const colorMap = new Map<string, number>();
		allTags.tags.forEach((tag: any) => {
			const color = tag.color_hexcode || tag.color_class || 'Unknown';
			colorMap.set(color, (colorMap.get(color) || 0) + 1);
		});

		const sortedColors = Array.from(colorMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		console.log('Top 5 tag colors:');
		sortedColors.forEach(([color, count], index) => {
			console.log(`  ${index + 1}. ${color}: ${count} tags`);
		});
		console.log('');

		// Demo 4: Show sample tags with full details
		console.log('═══════════════════════════════════════════════════════════');
		console.log('Demo 4: Detailed view of sample tags');
		console.log('═══════════════════════════════════════════════════════════\n');

		const sampleTags = allTags.tags.slice(0, 3);
		sampleTags.forEach((tag: any, index: number) => {
			console.log(`Tag ${index + 1}: ${tag.name}`);
			console.log(`  ID: ${tag.id}`);
			console.log(`  Color: ${tag.color_hexcode || 'N/A'}`);
			console.log(`  Created by: ${tag.created_by?.full_name || 'Unknown'}`);
			console.log(`  Usage count: ${tag.usage_count || 0}`);
			console.log('');
		});

		// Demo 5: Workflow example
		console.log('═══════════════════════════════════════════════════════════');
		console.log('Demo 5: Example workflow with tags');
		console.log('═══════════════════════════════════════════════════════════\n');

		console.log('Use Case: Finding tags for task categorization\n');
		console.log('Step 1: List all available tags');
		console.log(`  Result: ${allTags.tags.length} tags available\n`);

		console.log('Step 2: Filter for specific category (e.g., "Integration")');
		const integrationResult = await client.callTool({
			name: 'list_tags',
			arguments: { name: 'Integration' },
		});
		const integrationTags = JSON.parse(integrationResult.content[0].text);
		const intMatching = integrationTags.tags.filter((tag: any) =>
			tag.name.toUpperCase().includes('INTEGRATION'),
		);
		console.log(`  Result: ${intMatching.length} integration-related tags found`);
		intMatching.slice(0, 3).forEach((tag: any) => {
			console.log(`    • ${tag.name}`);
		});
		console.log('');

		console.log('Step 3: You can now use these tag IDs when creating/updating tasks');
		console.log('  Example: Update task with tag ID for categorization\n');

		// Summary
		console.log('╔════════════════════════════════════════════════════════════╗');
		console.log('║  Demonstration Complete                                    ║');
		console.log('╚════════════════════════════════════════════════════════════╝\n');

		console.log('Key Capabilities Demonstrated:');
		console.log('  ✅ List all tags in portal');
		console.log('  ✅ Filter tags by name/category');
		console.log('  ✅ View tag details (color, creator, usage)');
		console.log('  ✅ Tag analytics (statistics, distribution)');
		console.log('  ✅ Ready for integration with task management');
		console.log('');

		console.log('Available Tools:');
		console.log('  • list_tags(name?: string) - List/search tags');
		console.log('  • delete_tag(tag_id: string) - Remove unused tags');
		console.log('');

		await client.close();
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

demonstrateTags().catch(console.error);
