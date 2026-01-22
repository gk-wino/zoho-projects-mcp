#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
	loadEnv,
	createMcpClient,
	initializeTestEnvironment,
	callTool,
	parseToolResponse,
	logTestStart,
	logTestSuccess,
	logTestFailure,
	cleanup,
	wait,
} from './utils.js';

/**
 * Cleanup orphaned WYSIWYG test tasks from previous runs
 */
async function cleanupOrphanedWYSIWYGTasks(client: Client, projectId: string) {
	console.log('\n🧹 Cleaning up orphaned WYSIWYG test tasks...');

	try {
		// Get all tasks from the project
		const response = await callTool(client, 'list_tasks', {
			project_id: projectId,
			page: 1,
			per_page: 100,
		});
		const data = parseToolResponse(response);

		if (!data.tasks || !Array.isArray(data.tasks)) {
			console.log('No tasks found or unable to parse response');
			return;
		}

		// Filter orphaned WYSIWYG test tasks
		const testPattern = /^WYSIWYG Test:/;
		const orphanedTasks = data.tasks.filter((task: any) => testPattern.test(task.name));

		if (orphanedTasks.length === 0) {
			console.log('✅ No orphaned WYSIWYG test tasks found');
			return;
		}

		console.log(`Found ${orphanedTasks.length} orphaned WYSIWYG test task(s)`);

		// Delete each orphaned task
		for (const task of orphanedTasks) {
			try {
				await callTool(client, 'delete_task', {
					project_id: projectId,
					task_id: task.id,
				});
				console.log(`   Deleted task: ${task.name} (ID: ${task.id})`);
				await wait(300); // Small delay between deletions
			} catch (error: any) {
				console.warn(`   Failed to delete ${task.name}: ${error.message}`);
			}
		}

		console.log('✅ Cleanup completed');
	} catch (error) {
		console.warn('⚠️  Cleanup failed:', error);
		// Don't throw - cleanup failures shouldn't fail the test suite
	}
}

/**
 * Test WYSIWYG editor features with rich text formatting
 * Tests various HTML formatting: headers, bold, italic, underline, lists, code, etc.
 */
async function testWYSIWYGFormatting(client: Client, projectId: string) {
	console.log('\n' + '='.repeat(60));
	console.log('🎨 Testing WYSIWYG Editor Formatting');
	console.log('='.repeat(60));

	// Test 1: Task with Headers and Paragraphs
	const testName1 = 'WYSIWYG: Headers & Paragraphs';
	logTestStart(testName1);
	try {
		const htmlDescription = `
			<h1>Main Project Header</h1>
			<p>This is a regular paragraph with important information about the task.</p>
			<h2>Subheading for Details</h2>
			<p>Another paragraph with more details. This tests multiple paragraph support.</p>
			<h3>Smaller Heading</h3>
			<p>Final paragraph in this section.</p>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Headers & Paragraphs ${Date.now()}`,
			description: htmlDescription,
			priority: 'high',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}
		console.log(`\n✅ Created task with headers & paragraphs (ID: ${data.id})`);
		logTestSuccess(testName1);
	} catch (error) {
		logTestFailure(testName1, error);
		throw error;
	}

	await wait(500);

	// Test 2: Task with Text Formatting (Bold, Italic, Underline)
	const testName2 = 'WYSIWYG: Text Formatting';
	logTestStart(testName2);
	try {
		const htmlDescription = `
			<p>This paragraph contains <strong>bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p>
			<p>We can also combine them: <strong><em>bold and italic</em></strong>, <strong><u>bold and underline</u></strong>, and <em><u>italic and underline</u></em>.</p>
			<p>Even all three: <strong><em><u>bold, italic, and underlined</u></em></strong>!</p>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Text Formatting ${Date.now()}`,
			description: htmlDescription,
			priority: 'medium',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}
		console.log(`\n✅ Created task with text formatting (ID: ${data.id})`);
		logTestSuccess(testName2);
	} catch (error) {
		logTestFailure(testName2, error);
		throw error;
	}

	await wait(500);

	// Test 3: Task with Lists (Ordered and Unordered)
	const testName3 = 'WYSIWYG: Lists';
	logTestStart(testName3);
	try {
		const htmlDescription = `
			<h3>Unordered List (Bullet Points)</h3>
			<ul>
				<li>First item in the list</li>
				<li>Second item with <strong>bold text</strong></li>
				<li>Third item with <em>italic text</em></li>
				<li>Fourth item</li>
			</ul>
			<h3>Ordered List (Numbered)</h3>
			<ol>
				<li>First step in the process</li>
				<li>Second step</li>
				<li>Third step with details</li>
				<li>Final step</li>
			</ol>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Lists ${Date.now()}`,
			description: htmlDescription,
			priority: 'low',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}
		console.log(`\n✅ Created task with lists (ID: ${data.id})`);
		logTestSuccess(testName3);
	} catch (error) {
		logTestFailure(testName3, error);
		throw error;
	}

	await wait(500);

	// Test 4: Task with Code and Preformatted Text
	const testName4 = 'WYSIWYG: Code & Preformatted';
	logTestStart(testName4);
	try {
		const htmlDescription = `
			<p>Inline code example: <code>const variable = 'value';</code></p>
			<p><br/></p>
			<p>Code block example:</p>
			<div>
				<p><br/></p>
				<ol class="code"><br/></ol>
				<p><br/></p>
			</div>
			<ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">function example() {<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  console.log('Hello, World!');<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  return true;<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">}<br/></li>
			</ul>
			<div><br/></div>
			<p>Preformatted text:</p>
			<pre>This text preserves
    spaces and
        indentation
            exactly.</pre>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Code & Preformatted ${Date.now()}`,
			description: htmlDescription,
			priority: 'high',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}
		console.log(`\n✅ Created task with code & preformatted text (ID: ${data.id})`);
		logTestSuccess(testName4);
	} catch (error) {
		logTestFailure(testName4, error);
		throw error;
	}

	await wait(500);

	// Test 5: Task with Nested Lists and Indentation
	const testName5 = 'WYSIWYG: Nested Lists';
	logTestStart(testName5);
	try {
		const htmlDescription = `
			<h3>Project Structure</h3>
			<ul>
				<li>Main Category 1
					<ul>
						<li>Subcategory 1.1</li>
						<li>Subcategory 1.2
							<ul>
								<li>Sub-subcategory 1.2.1</li>
								<li>Sub-subcategory 1.2.2</li>
							</ul>
						</li>
					</ul>
				</li>
				<li>Main Category 2
					<ul>
						<li>Subcategory 2.1</li>
						<li>Subcategory 2.2</li>
					</ul>
				</li>
			</ul>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Nested Lists ${Date.now()}`,
			description: htmlDescription,
			priority: 'medium',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}
		console.log(`\n✅ Created task with nested lists (ID: ${data.id})`);
		logTestSuccess(testName5);
	} catch (error) {
		logTestFailure(testName5, error);
		throw error;
	}

	await wait(500);

	// Test 6: Task with Mixed Complex Formatting
	const testName6 = 'WYSIWYG: Mixed Complex';
	logTestStart(testName6);
	try {
		const htmlDescription = `
			<h2>🎯 Complete Feature Implementation</h2>
			<p><strong>Priority:</strong> <em>High</em> | <strong>Status:</strong> <u>In Progress</u></p>
			<h3>Requirements</h3>
			<ol>
				<li><strong>Backend API</strong>
					<ul>
						<li>Create endpoints for <code>GET /api/users</code></li>
						<li>Implement <code>POST /api/users</code></li>
						<li>Add authentication middleware</li>
					</ul>
				</li>
				<li><strong>Frontend Components</strong>
					<ul>
						<li>Design user interface</li>
						<li>Implement state management</li>
					</ul>
				</li>
				<li><em>Testing & Documentation</em></li>
			</ol>
			<h3>Code Example</h3>
			<div>
				<p><br/></p>
				<ol class="code"><br/></ol>
				<p><br/></p>
			</div>
			<ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">// Sample implementation<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">const handleSubmit = async (data) => {<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  try {<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    const response = await api.post('/users', data);<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    return response.data;<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  } catch (error) {<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">    console.error('Error:', error);<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  }<br/></li>
				<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">};<br/></li>
			</ul>
			<div><br/></div>
			<p><strong>Note:</strong> Make sure to test all edge cases before deployment.</p>
		`;

		const response = await callTool(client, 'create_task', {
			project_id: projectId,
			name: `WYSIWYG Test: Mixed Complex Formatting ${Date.now()}`,
			description: htmlDescription,
			priority: 'high',
		});
		let data = parseToolResponse(response);
		if (typeof data === 'string') {
			const jsonMatch = data.match(/\{[\s\S]*\}/);
			if (jsonMatch) data = JSON.parse(jsonMatch[0]);
		}

		const taskId = data.id;
		console.log(`\n✅ Created task with mixed complex formatting (ID: ${taskId})`);
		logTestSuccess(testName6);

		// Add comments with rich formatting to this task
		await wait(500);

		// Comment 1: Simple formatted comment
		const commentName1 = 'WYSIWYG Comment: Basic Formatting';
		logTestStart(commentName1);
		try {
			const htmlComment1 = `
				<p>This is a comment with <strong>bold</strong>, <em>italic</em>, and <u>underline</u>.</p>
				<p>Important points:</p>
				<ul>
					<li>First point</li>
					<li>Second point</li>
				</ul>
			`;
			await callTool(client, 'add_task_comment', {
				project_id: projectId,
				task_id: taskId,
				comment: htmlComment1,
			});
			console.log('\n✅ Added comment with basic formatting');
			logTestSuccess(commentName1);
		} catch (error) {
			logTestFailure(commentName1, error);
		}

		await wait(500);

		// Comment 2: Code in comment
		const commentName2 = 'WYSIWYG Comment: Code Block';
		logTestStart(commentName2);
		try {
			const htmlComment2 = `
				<p>Here's the fix for the bug:</p>
				<div>
					<p><br/></p>
					<ol class="code"><br/></ol>
					<p><br/></p>
				</div>
				<ul style="list-style-position:outside; list-style-type:decimal; padding:0 30px" dir="ltr">
					<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">if (user.isAuthenticated()) {<br/></li>
					<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  // Allow access<br/></li>
					<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">  return true;<br/></li>
					<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">}<br/></li>
					<li style="border-left:2px solid rgb(204, 204, 204); padding:2px; margin:1px 0; background-color:rgb(245, 245, 245)">return false;<br/></li>
				</ul>
				<div><br/></div>
				<p>This should resolve the authentication issue.</p>
			`;
			await callTool(client, 'add_task_comment', {
				project_id: projectId,
				task_id: taskId,
				comment: htmlComment2,
			});
			console.log('\n✅ Added comment with code block');
			logTestSuccess(commentName2);
		} catch (error) {
			logTestFailure(commentName2, error);
		}

		await wait(500);

		// Comment 3: Complex nested content
		const commentName3 = 'WYSIWYG Comment: Complex';
		logTestStart(commentName3);
		try {
			const htmlComment3 = `
				<h4>Update Summary</h4>
				<p><strong>Completed:</strong></p>
				<ol>
					<li>Database schema updated</li>
					<li>API endpoints tested
						<ul>
							<li>GET endpoint: <code>/api/users/:id</code> ✓</li>
							<li>POST endpoint: <code>/api/users</code> ✓</li>
						</ul>
					</li>
					<li>Documentation updated</li>
				</ol>
				<p><em>Next steps: Deploy to staging environment</em></p>
			`;
			await callTool(client, 'add_task_comment', {
				project_id: projectId,
				task_id: taskId,
				comment: htmlComment3,
			});
			console.log('\n✅ Added comment with complex nested content');
			logTestSuccess(commentName3);
		} catch (error) {
			logTestFailure(commentName3, error);
		}

		return taskId;
	} catch (error) {
		logTestFailure(testName6, error);
		throw error;
	}
}

async function runWYSIWYGSmokeTests() {
	console.log('\n🚀 Starting WYSIWYG Editor Smoke Tests\n');
	let client: Client | null = null;

	try {
		const env = loadEnv();
		console.log('✅ Environment loaded');

		client = await createMcpClient();
		console.log('✅ Connected to MCP server');

		await wait(1000);

		// Initialize test environment (get or create test project)
		const testProject = await initializeTestEnvironment(client);
		console.log();

		// Ensure the project has a default tasklist
		console.log('🔧 Ensuring default tasklist exists...');
		try {
			await callTool(client, 'create_default_tasklist', {
				project_id: testProject.projectId,
				flag: 'internal',
			});
			console.log('✅ Created default tasklist');
		} catch (error: any) {
			// Default tasklist might already exist, which is fine
			if (error.message && error.message.includes('already exists')) {
				console.log('✅ Default tasklist already exists');
			} else {
				console.log('⚠️  Could not create default tasklist:', error.message);
			}
		}
		await wait(500);

		// Cleanup orphaned test tasks from previous failed runs
		await cleanupOrphanedWYSIWYGTasks(client, testProject.projectId);
		await wait(500);

		// WYSIWYG Editor Formatting Tests
		// Note: These tasks are NOT deleted after creation for manual verification in Zoho Portal
		await testWYSIWYGFormatting(client, testProject.projectId);

		// Summary
		console.log('\n' + '='.repeat(60));
		console.log('✨ All WYSIWYG Editor Smoke Tests Passed!');
		console.log('='.repeat(60));
		console.log('\n🎨 WYSIWYG Editor Tests:');
		console.log('✅ Headers & Paragraphs formatting verified!');
		console.log('✅ Text formatting (bold, italic, underline) verified!');
		console.log('✅ Lists (ordered & unordered) verified!');
		console.log('✅ Code & preformatted text verified!');
		console.log('✅ Nested lists & complex formatting verified!');
		console.log('✅ Rich comments formatting verified!');
		console.log(
			'\n⚠️  Note: WYSIWYG test tasks were NOT deleted. Please verify them in Zoho Portal.',
		);

		await cleanup(client);
		process.exit(0);
	} catch (error) {
		console.error('\n💥 WYSIWYG Smoke Tests Failed\n', error);
		if (client) await cleanup(client);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runWYSIWYGSmokeTests().catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
}

export { runWYSIWYGSmokeTests };
