# Smoke Tests

Smoke tests verify that the basic functionality of the Zoho Projects MCP server is working correctly by making real API calls through the MCP protocol.

## Structure

```
tests/smoke/
├── utils.ts             # Common utilities for all smoke tests
├── portal.test.ts       # Portal functionality tests
├── project.test.ts      # Project functionality tests
├── phase.test.ts        # Phase/Milestone functionality tests
├── task.test.ts         # Task functionality tests
├── tasklist.test.ts     # Task List functionality tests
├── issue.test.ts        # Issue (Bug) functionality tests
├── wysiwyg.test.ts      # WYSIWYG editor formatting tests
├── inspect-task.test.ts # Task inspector utility (for debugging HTML)
└── README.md            # This file
```

## Utilities (`utils.ts`)

The utilities module provides reusable functions for smoke testing:

### Environment Management

- **`loadEnv()`** - Loads and validates environment variables from `.env`
- Returns configuration object with all Zoho credentials and settings

### MCP Client Management

- **`createMcpClient()`** - Creates and connects to the MCP stdio server
- Returns a connected `Client` instance

### Tool Operations

- **`callTool(client, toolName, args)`** - Calls an MCP tool with arguments
- **`parseToolResponse(response)`** - Parses tool response content (JSON or text)

### Test Logging

- **`logTestStart(testName)`** - Logs the start of a test
- **`logTestSuccess(testName, data?)`** - Logs successful test completion
- **`logTestFailure(testName, error)`** - Logs test failure with special handling for permission errors (returns boolean indicating whether to throw)

### Test Environment

- **`initializeTestEnvironment(client)`** - Initializes test environment with a persistent test project
  - Searches for "Zoho Project MCP Tests" project
  - Creates it if it doesn't exist
  - Caches project details to `.test-project-cache.json` for faster subsequent runs
  - Returns project details: `{ projectId, projectName, projectKey }`
  - Example usage:
    ```typescript
    const testProject = await initializeTestEnvironment(client);
    // Use testProject.projectId for testing task lists, tasks, etc.
    ```

### Helpers

- **`wait(ms)`** - Async wait/delay function
- **`cleanup(client)`** - Gracefully closes MCP client connection and terminates server process

## Running Smoke Tests

### Prerequisites

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Configure environment**:
   Ensure `.env` file has valid Zoho credentials:
   ```env
   ZOHO_ACCESS_TOKEN=your_access_token
   ZOHO_REFRESH_TOKEN=your_refresh_token
   ZOHO_CLIENT_ID=your_client_id
   ZOHO_CLIENT_SECRET=your_client_secret
   ZOHO_PORTAL_ID=your_portal_id
   ```

### Run Portal Tests

```bash
# Using npm script (recommended)
npm run test:smoke:portal

# Or using tsx directly
npx tsx tests/smoke/portal.test.ts

# Or make it executable and run
chmod +x tests/smoke/portal.test.ts
./tests/smoke/portal.test.ts
```

## Portal Smoke Tests

Tests in `portal.test.ts`:

### 1. List Portals (`list_portals`)

- Calls the `list_portals` tool
- Validates response contains portals array
- Verifies at least one portal exists
- Logs portal names and IDs

### 2. Get Portal (`get_portal`)

- Calls the `get_portal` tool with portal ID from `.env`
- Validates response structure
- Verifies portal ID matches requested ID
- Logs detailed portal information (name, owner, settings, etc.)

## Project Smoke Tests

Tests in `project.test.ts`:

### 1. List Projects (`list_projects`)

- Calls the `list_projects` tool with pagination
- Validates response is an array of projects
- Logs first 5 projects with names, IDs, and statuses

### 2. Create Project (`create_project`)

- Creates a new test project with:
  - Unique timestamped name
  - Description
  - Start and end dates
  - Project type (active)
  - Public/private flag
- Validates project creation response
- Stores project ID for subsequent tests
- Logs created project details

### 3. Get Project (`get_project`)

- Retrieves details of the created project
- Validates project ID matches
- Logs comprehensive project information:
  - Basic details (name, type, description)
  - Status and timestamps
  - Owner information
  - Budget configuration
  - Task and issue counts

### 4. Update Project (`update_project`)

- Updates the test project with:
  - New description
  - Modified end date
- Validates response structure
- Logs update confirmation

### 5. Trash Project (`trash_project`)

- Moves project to trash (soft delete)
- Validates success response
- Project can be restored within 30 days
- Logs trash operation

### 6. Cleanup Test Projects (`cleanup_test_projects`)

- Lists all projects in the portal
- Identifies test projects matching pattern: `Test Project {timestamp}`
- Validates timestamp format (13 digits)
- Attempts to trash each test project found
- Logs summary of trashed and skipped projects
- Helps maintain clean portal environment after testing

### Run Project Tests

```bash
npm run test:smoke:project
```

### Expected Output (Project Tests)

```
🚀 Starting Project Smoke Tests

✅ Environment loaded
✅ Connected to MCP server

============================================================
🧪 TEST: list_projects
============================================================

Found 10 project(s):
  1. Test Project (ID: 123456789) - Status: active
  2. Another Project (ID: 987654321) - Status: active
  ...

✅ PASSED: list_projects

============================================================
🧪 TEST: create_project
============================================================

Project Created:
  Name: Test Project 1234567890
  ID: 111222333
  Type: active
  Status: Active
  Start Date: 2025-01-01
  End Date: 2025-12-31

✅ PASSED: create_project

... (remaining test outputs)

============================================================
✨ Project Smoke Tests Summary
============================================================

Tests completed:
  ✅ list_projects
  ✅ create_project
  ✅ get_project
  ✅ update_project
  ✅ trash_project
  ⏭️  restore_project (skipped - permissions)
  ⏭️  delete_project (skipped - permissions)
```

## Phase Smoke Tests

Tests in `phase.test.ts`:

### 1. Get Phases (`get_phases`)

- Calls the `get_phases` tool to retrieve all phases across the portal
- Validates response contains milestones array
- Logs count of phases found across portal

### 2. List Phases (`list_phases`)

- Calls the `list_phases` tool for a specific project
- Validates response structure
- Logs phases found in the test project

### 3. Create Phase (`create_phase`)

- Creates a new test phase with:
  - Unique timestamped name
  - Internal flag
- Validates phase creation response
- Stores phase ID for subsequent tests
- Logs created phase details

### 4. Get Phase Detail (`get_phase_detail`)

- Retrieves detailed information about the created phase
- Validates phase ID matches
- Logs comprehensive phase information:
  - Basic details (name, ID, status)
  - Owner information
  - Created/updated timestamps
  - Start and end dates
  - Completion percentage
  - Flag type

### 5. Update Phase (`update_phase`)

- Updates the test phase name
- Validates response structure
- Logs update confirmation

### 6. Add Phase Comment (`add_phase_comment`)

- Adds a test comment to the phase
- Validates comment creation
- Stores comment ID for cleanup
- Logs comment details

### 7. Get Phase Comments (`get_phase_comments`)

- Retrieves all comments on the phase
- Validates response structure
- Logs comment retrieval

### 8. Get Phase Activities (`get_phase_activities`)

- Retrieves activity history of the phase
- Validates response structure
- Logs recent activities (create, update events)

### 9. Get Phase Status Transition (`get_phase_status_transition`)

- Retrieves status transition history
- Validates response structure
- Logs status changes

### 10. Get Phase Followers (`get_phase_followers`)

- Retrieves followers of the phase
- Validates response structure
- Logs follower count

### 11. Clone Phase (`clone_phase`)

- Clones the test phase within the same project
- Validates cloned phase creation
- Logs new phase ID

### 12. Delete Phase Comment (`delete_phase_comment`)

- Deletes the test comment created earlier
- Validates successful deletion
- Logs deletion confirmation

### 13. Delete Phase (`delete_phase`)

- Deletes the test phase
- Validates successful deletion
- Logs deletion confirmation

### Run Phase Tests

```bash
npm run test:smoke:phase
```

### Expected Output (Phase Tests)

```
🚀 Starting Phase Smoke Tests

✅ Environment loaded
✅ Connected to MCP server
✅ Using cached test project: Zoho Project MCP Tests (ID: 1234567890)

============================================================
🧪 TEST: get_phases
============================================================

Found 80 phase(s) across portal
✅ PASSED: get_phases

============================================================
🧪 TEST: list_phases
============================================================

Found 0 phase(s):
✅ PASSED: list_phases

============================================================
🧪 TEST: create_phase
============================================================

Phase Created:
  Name: Test Phase 1234567890
  ID: 123456789
  Status: Open
  Start Date: N/A
  End Date: N/A
✅ PASSED: create_phase

... (remaining test outputs)

============================================================
✨ All Phase Smoke Tests Passed!
============================================================
```

## Task Smoke Tests

Tests in `task.test.ts`:

### 1. List Tasks (`list_tasks`)

- Calls the `list_tasks` tool for a specific project
- Validates response contains tasks array
- Logs count of tasks found
- Displays first task details if available

### 2. Create Task (`create_task`)

- Creates a new test task with:
  - Unique timestamped name
  - Description for testing
  - High priority
- Validates task creation response
- Stores task ID for subsequent tests
- Logs created task details (name, ID, priority)

### 3. Create Subtask (`create_task` with parent_task_id) ⭐

- **Creates a subtask under an existing parent task**
- Uses `parent_task_id` parameter to establish parent-child relationship
- Validates subtask creation with:
  - Unique timestamped name
  - Description specific to subtask
  - Medium priority
- **Confirms subtask depth is greater than 0**
- This demonstrates the new subtask creation feature
- Logs subtask details including parent task ID and depth

### 4. Get Task (`get_task`)

- Retrieves detailed information about the created task
- Validates task ID and name
- Logs comprehensive task information:
  - Name and ID
  - Status (Open/Closed)
  - Priority level
  - Depth (0 for main task, >0 for subtask)

### 5. Update Task (`update_task`)

- Updates the test task:
  - Changes name to timestamped variant
  - Changes priority from high to low
  - Updates description
- Validates response structure
- Logs updated task details

### 6. Clone Task (`clone_task`) ⭐

- **Clones the task to create 2 duplicate instances**
- Validates successful cloning operation
- Waits for clones to appear in the system
- Lists tasks to find cloned instances
- Stores cloned task IDs for cleanup
- This demonstrates the new task cloning feature
- Logs number of clones created

### 7. Add Task Comment (`add_task_comment`)

- Adds a test comment to the task
- Validates comment creation
- Stores comment ID for reference
- Logs comment details

### 8. List Task Comments (`list_task_comments`)

- Retrieves all comments on the task
- Validates response structure
- Logs comment count

### 9. Move Task (`move_task`)

- Creates a new task list as the target
- Moves the task to the new task list
- Validates successful move operation
- Logs move confirmation with target task list name

### 10. Delete Task (`delete_task`)

- Deletes test tasks (main task, subtask, cloned tasks)
- Validates successful deletion
- Performs cleanup of test data
- Logs deletion confirmation

### Run Task Tests

```bash
npm run test:smoke:task
```

### Expected Output

```
🚀 Starting Task Smoke Tests

✅ Environment loaded
✅ Connected to MCP server
✅ Using cached test project: Zoho Project MCP Tests

🔧 Ensuring default tasklist exists...
✅ Created default tasklist

🧹 Cleaning up orphaned test tasks...
✅ No orphaned test tasks found

============================================================
🧪 TEST: list_tasks
============================================================
Found 0 tasks
✅ PASSED: list_tasks

============================================================
🧪 TEST: create_task
============================================================
Created task: Test Task 1769120019794 (ID: 1817452000005352261)
Priority: high
✅ PASSED: create_task

============================================================
🧪 TEST: create_task (subtask)
============================================================
✅ Created SUBTASK: Test Subtask 1769120020734 (ID: 1817452000005354163)
Parent Task ID: 1817452000005352261
Depth: 1
✓ Confirmed as subtask (depth: 1)
✅ PASSED: create_task (subtask)

============================================================
🧪 TEST: get_task
============================================================
Task: Test Task 1769120019794
Status: Open
Priority: high
Depth: 0 (main task)
✅ PASSED: get_task

============================================================
🧪 TEST: update_task
============================================================
Updated task: Updated Task 1769120022589
New priority: low
✅ PASSED: update_task

============================================================
🧪 TEST: clone_task
============================================================
✅ Cloned task successfully
Number of clones: 2
Found 3 tasks with similar names (including original)
✅ PASSED: clone_task

... (remaining test outputs)

============================================================
✨ All Task Smoke Tests Passed!
============================================================

✅ Subtask creation feature verified successfully!
✅ Task cloning feature verified successfully!
```

## TaskList Smoke Tests

Tests in `tasklist.test.ts`:

### 1. List Task Lists (`list_tasklists`)

- Calls the `list_tasklists` tool for a specific project
- Validates response contains tasklists array
- Logs count of task lists found
- Displays first task list details if available

### 2. Create Task List (`create_tasklist`)

- Creates a new test task list with:
  - Unique timestamped name
  - Internal flag
- Validates task list creation response
- Stores task list ID for subsequent tests
- Logs created task list details

### 3. Get Task List (`get_tasklist`)

- Retrieves detailed information about the created task list
- Validates task list ID and name
- Logs comprehensive task list information:
  - Name and ID
  - Status (active/archived)
  - Flag type (internal/external)

### 4. Update Task List (`update_tasklist`)

- Updates the test task list:
  - Changes name to timestamped variant
  - Switches flag from internal to external
- Validates response structure
- Logs updated task list details

### 5. Add Task List Comment (`add_tasklist_comment`)

- Adds a test comment to the task list
- Validates comment creation
- Stores comment ID for cleanup
- Logs comment details

### 6. Get Task List Comments (`get_tasklist_comments`)

- Retrieves all comments on the task list
- Validates response structure
- Logs comment count

### 7. Follow Task List (`follow_tasklist`)

- Follows the task list to receive updates
- Validates successful follow operation
- Logs follow confirmation

### 8. Get Task List Followers (`get_tasklist_followers`)

- Retrieves followers of the task list
- Validates response structure
- Logs follower count

### 9. Unfollow Task List (`unfollow_tasklist`)

- Unfollows the task list to stop receiving updates
- Validates successful unfollow operation
- Logs unfollow confirmation

### 10. Delete Task List Comment (`delete_tasklist_comment`)

- Deletes the test comment created earlier
- Validates successful deletion
- Logs deletion confirmation

### 11. Delete Task List (`delete_tasklist`)

- Deletes the test task list
- Validates successful deletion
- Logs deletion confirmation

### 12. Get Task List Templates (`get_tasklist_templates`)

- Retrieves task list templates from the portal
- Validates response structure
- Logs template count

### Run TaskList Tests

```bash
npm run test:smoke:tasklist
```

### Expected Output (TaskList Tests)

```
🚀 Starting TaskList Smoke Tests

✅ Environment loaded
✅ Connected to MCP server
✅ Using cached test project: Zoho Project MCP Tests (ID: 1817452000005354052)

============================================================
🧪 TEST: list_tasklists
============================================================

Found 3 task lists
First task list: Test TaskList 1769117756546 (ID: 1817452000005350143)
✅ PASSED: list_tasklists

============================================================
🧪 TEST: create_tasklist
============================================================

Created task list: Test TaskList 1769117824124 (ID: 1817452000005351168)
✅ PASSED: create_tasklist

============================================================
🧪 TEST: get_tasklist
============================================================

Task list: Test TaskList 1769117824124
Status: active
Flag: internal
✅ PASSED: get_tasklist

============================================================
🧪 TEST: update_tasklist
============================================================

Updated task list: Updated TaskList 1769117825831
New flag: external
✅ PASSED: update_tasklist

============================================================
🧪 TEST: add_tasklist_comment
============================================================

Added comment to task list
✅ PASSED: add_tasklist_comment

============================================================
🧪 TEST: get_tasklist_comments
============================================================

Found 1 comments
✅ PASSED: get_tasklist_comments

============================================================
🧪 TEST: follow_tasklist
============================================================

Successfully followed task list
✅ PASSED: follow_tasklist

============================================================
🧪 TEST: get_tasklist_followers
============================================================

Found 1 followers
✅ PASSED: get_tasklist_followers

============================================================
🧪 TEST: unfollow_tasklist
============================================================

Successfully unfollowed task list
✅ PASSED: unfollow_tasklist

============================================================
🧪 TEST: delete_tasklist
============================================================

Successfully deleted task list (ID: 1817452000005351168)
✅ PASSED: delete_tasklist

============================================================
🧪 TEST: get_tasklist_templates
============================================================

Found 10 task list templates
✅ PASSED: get_tasklist_templates

============================================================
✨ All TaskList Smoke Tests Passed!
============================================================

🧹 Cleaning up...
✨ Cleanup completed
```

## Issue Smoke Tests

Tests in `issue.test.ts`:

### Overview

The issue smoke tests verify all issue-related functionality including creation, updating, linking, resolution management, comments, followers, and attachments. Issues in Zoho Projects are used for bug tracking and problem management.

### 1. List Issues (`list_issues`)

- Calls the `list_issues` tool with pagination
- Validates response contains issues array
- Logs count of issues found in the project

### 2. Create Issue (`create_issue`)

- Creates a new test issue with:
  - Unique timestamped name
  - Description
  - Flag (Internal/External)
- Validates issue creation response
- Stores issue ID for subsequent tests
- Logs created issue details

### 3. Get Issue (`get_issue`)

- Retrieves details of the created issue
- Validates issue ID matches
- Logs comprehensive issue information

### 4. Get Issue Description (`get_issue_description`)

- Retrieves the detailed description of an issue
- Validates response structure
- Useful for issues with rich text descriptions

### 5. Update Issue (`update_issue`)

- Updates the test issue with:
  - New name (timestamped)
  - Updated description
- Validates response structure
- Logs update confirmation

### 6. Get Issue Activities (`get_issue_activities`)

- Retrieves all activities performed on the issue
- Includes create, update, comment, status change activities
- Validates response structure with pagination
- Logs activity count

### 7. Get Issue Status Transition (`get_issue_status_transition`)

- Retrieves the complete status transition history
- Shows progression through different statuses
- Logs transition details

### 8. Add Issue Comment (`add_issue_comment`)

- Adds a test comment to the issue
- Validates comment creation
- Stores comment ID for reference
- Logs comment details

### 9. Get Issue Comments (`get_issue_comments`)

- Retrieves all comments on the issue
- Validates response structure with pagination
- Logs comment count

### 10. Clone Issue (`clone_issue`)

- Creates a duplicate of the issue
- Validates clone creation
- Stores cloned issue ID for cleanup
- Useful for creating similar issues quickly

### 11. Link Issues (`link_issues`)

- Establishes relationship between two issues
- Uses link types like "Related to", "Blocks", "Duplicate of"
- Validates link creation
- Note: Requires link types to be configured in Zoho Projects

### 12. Get Issue Linked Issues (`get_issue_linked_issues`)

- Retrieves all issues linked to the current issue
- Shows link types and relationships
- Validates response structure

### 13. Get Issue Followers (`get_issue_followers`)

- Retrieves users following the issue
- Followers receive notifications on issue updates
- Validates response structure

### 14. Get Issue Attachments (`get_issue_attachments`)

- Retrieves all files attached to the issue
- Can filter by extension or application type
- Validates response structure

### 15. Get Issue Resolution (`get_issue_resolution`)

- Retrieves the resolution details if issue is resolved
- Returns empty if no resolution exists
- Useful for closed issues

### 16. Delete Issue (`delete_issue`)

- Removes the test issue from the project
- Validates successful deletion
- Used for cleanup after tests

### Additional Features Tested

#### Issue-Task Association

- **Get Associated Tasks** - Retrieve tasks linked to an issue
- **Associate Tasks** - Link tasks to an issue (many-to-many relationship)
- **Bulk Associate Tasks** - Link multiple tasks to multiple issues
- **Dissociate Task** - Remove task-issue association

#### Issue Resolution Management

- **Add Resolution** - Add resolution details when closing an issue
- **Update Resolution** - Modify existing resolution
- **Delete Resolution** - Remove resolution from an issue

#### Issue Followers

- **Follow Issue** - Add users to follow an issue
- **Remove Followers** - Remove users from following an issue

#### Issue Attachments

- **Associate Attachments** - Link files to an issue
- **Dissociate Attachment** - Remove file attachment from issue

#### Issue Linking

- **Bulk Link Issues** - Link multiple issues at once
- **Change Link Type** - Modify the relationship type between linked issues
- **Unlink Issues** - Remove link between issues

### Run Issue Tests

```bash
npm run test:smoke:issue
```

### Expected Output (Issue Tests)

```
🚀 Starting Issue Smoke Tests

✅ Environment loaded
✅ Connected to MCP server

🧹 Cleaning up orphaned test issues...
✅ No orphaned test issues found

============================================================
📝 Issue Management Tests
============================================================

============================================================
🧪 TEST: list_issues
============================================================

Found 5 issue(s)
✅ PASSED: list_issues

============================================================
🧪 TEST: create_issue
============================================================

✅ Created issue: Test Issue 1769120045678 (ID: 123456789)
✅ PASSED: create_issue

============================================================
🧪 TEST: get_issue
============================================================

Retrieved issue: Test Issue 1769120045678 (ID: 123456789)
✅ PASSED: get_issue

============================================================
🧪 TEST: update_issue
============================================================

✅ Updated issue: Updated Issue 1769120049876
✅ PASSED: update_issue

============================================================
💬 Comment Tests
============================================================

============================================================
🧪 TEST: add_issue_comment
============================================================

✅ Added comment (ID: 987654321)
✅ PASSED: add_issue_comment

============================================================
🧪 TEST: get_issue_comments
============================================================

Retrieved comments
✅ PASSED: get_issue_comments

============================================================
🔗 Linking and Association Tests
============================================================

============================================================
🧪 TEST: clone_issue
============================================================

✅ Cloned issue (ID: 111222333)
✅ PASSED: clone_issue

============================================================
🧪 TEST: link_issues
============================================================

✅ Linked issues successfully
✅ PASSED: link_issues

============================================================
👥 Followers, Attachments, and Resolution Tests
============================================================

============================================================
🧪 TEST: get_issue_followers
============================================================

Retrieved issue followers
✅ PASSED: get_issue_followers

============================================================
🧪 TEST: get_issue_resolution
============================================================

✓ No resolution exists yet (this is normal)
✅ PASSED: get_issue_resolution

============================================================
🗑️  Cleanup Tests
============================================================

============================================================
🧪 TEST: delete_issue
============================================================

✅ Deleted issue (ID: 111222333)
✅ PASSED: delete_issue

============================================================
✨ All Issue Smoke Tests Passed!
============================================================
```

### Important Notes

1. **Issue vs Task**: Issues are primarily for bug tracking, while tasks are for work management. They are separate entities with different features.

2. **Subtasks**: Issues do NOT support subtasks. If you need hierarchical bug tracking, use issue linking with "Blocks" or "Depends on" link types. Subtasks are a Task feature only.

3. **Link Types**: Issue linking requires link types to be configured in your Zoho Projects portal. Default types include:
   - Related to
   - Blocks
   - Is blocked by
   - Duplicate of
   - Depends on

4. **Permissions**: Some operations (like adding followers or resolutions) may require specific permissions in Zoho Projects.

## Expected Output

```
🚀 Starting Portal Smoke Tests

📋 Loading environment variables...
✅ Environment loaded (Portal ID: 753397720)

🔨 Ensuring project is built...

🔌 Connecting to MCP server...
Zoho Projects MCP server running on stdio
✅ Connected to MCP server

============================================================
🧪 TEST: list_portals
============================================================
Received 401 error, attempting token refresh...
Access token refreshed successfully. Expires in 3600 seconds.

Found 1 portal(s):
  1. Your Portal Name (ID: 753397720)

✅ PASSED: list_portals

============================================================
🧪 TEST: get_portal
============================================================

Portal Details:
  Name: Your Portal Name
  Organization: Your Organization
  ID: 753397720
  Owner: your.name
  Timezone: America/Los_Angeles
  Plan: Enterprise
  Time Format: hh:mm aaa
  Date Format: MM/dd/yyyy
  Business Hours: 08:00 - 17:30
✅ PASSED: get_portal
Response: {
  "portalId": 753397720,
  "name": "Your Portal Name"
}

============================================================
✨ All Portal Smoke Tests Passed!
============================================================

📊 Test Summary:
   Total Tests: 2
   Passed: 2
   Failed: 0
   Portal Validated: 753397720

🧹 Cleaning up...
✨ Cleanup completed
```

## Adding New Smoke Tests

To add smoke tests for other domains (tasks, issues, etc.):

1. **Create a new test file** (e.g., `task.test.ts`):

   ```typescript
   import {
   	loadEnv,
   	createMcpClient,
   	callTool,
   	parseToolResponse,
   	logTestStart,
   	logTestSuccess,
   	logTestFailure,
   	cleanup,
   } from './utils.js';

   async function testCreateTask(client: Client, projectId: string) {
   	const testName = 'create_task';
   	logTestStart(testName);

   	try {
   		const response = await callTool(client, 'create_task', {
   			project_id: projectId,
   			name: 'Smoke Test Task',
   		});

   		const data = parseToolResponse(response);
   		// Add validations...

   		logTestSuccess(testName, data);
   		return data;
   	} catch (error) {
   		logTestFailure(testName, error);
   		throw error;
   	}
   }

   async function runTaskSmokeTests() {
   	let client: Client | null = null;

   	try {
   		const env = loadEnv();
   		client = await createMcpClient();

   		await testCreateTask(client, env.portalId);
   		// Add more tests...

   		// Cleanup and exit successfully
   		if (client) {
   			await cleanup(client);
   		}
   		process.exit(0);
   	} catch (error) {
   		console.error('Tests failed:', error);

   		// Cleanup and exit with error
   		if (client) {
   			await cleanup(client);
   		}
   		process.exit(1);
   	}
   }
   ```

2. **Run the new test**:
   ```bash
   node tests/smoke/task.test.js
   ```

## Best Practices

1. **Always cleanup** - Call `cleanup(client)` in both success and error paths before exit
2. **Explicit exit** - Call `process.exit(0)` for success or `process.exit(1)` for failures to ensure clean termination
3. **Validate responses** - Check response structure and data
4. **Use real data** - Tests should use actual API credentials
5. **Add delays** - Use `wait()` between tests to avoid rate limits
6. **Log clearly** - Use provided logging functions for consistent output
7. **Handle errors** - Catch and log errors with context

## Task Inspector Utility

The `inspect-task.test.ts` utility helps you understand how Zoho Projects formats HTML content in task descriptions, especially for complex formatting like multiline code blocks.

### Purpose

When creating tasks with rich HTML content (code blocks, tables, etc.), it can be unclear how Zoho expects the HTML to be structured. This utility lets you:

1. Create a test task programmatically
2. Edit it manually in the Zoho Projects portal using their WYSIWYG editor
3. Read back the task to see the exact HTML structure Zoho generates
4. Use that HTML structure in your automated tests

### Usage

#### 1. Create a Test Task

```bash
npm run inspect:task -- create
```

This creates a task with a unique name like `INSPECT-1234567890 - Manual Edit Task`. The output will show you the task ID and name.

**Example output:**

```
✅ Task created successfully!

Task ID: 1817452000005350387
Task Name: INSPECT-1769122811580 - Manual Edit Task

📋 Instructions:
1. Go to your Zoho Projects portal
2. Find the task named: INSPECT-1769122811580 - Manual Edit Task
3. Edit the task description and add multiline code examples using the WYSIWYG editor
4. Save the changes
5. Run: npm run inspect:task -- read 1817452000005350387
```

#### 2. Edit in Zoho Portal

1. Open your Zoho Projects portal
2. Navigate to the test project (default: "Zoho Project MCP Tests")
3. Find the task by name (e.g., `INSPECT-1769122811580 - Manual Edit Task`)
4. Click edit and use the WYSIWYG editor to add:
   - Multiline code blocks
   - Complex formatting (bold, italic, lists)
   - Any other HTML content you want to test
5. Save the task

#### 3. Read the Task HTML

```bash
npm run inspect:task -- read <task_id>
```

**Example:**

```bash
npm run inspect:task -- read 1817452000005350387
```

This will display:

- Complete task details (name, priority)
- Full HTML description content
- Extracted code blocks (if any)

**Example output:**

```
================================================================================
TASK DETAILS
================================================================================
Name: INSPECT-1769122811580 - Manual Edit Task
Priority: high

================================================================================
DESCRIPTION (HTML)
================================================================================
<p>Here is some code:</p>
<pre><code>function example() {
  console.log('Hello, World!');
  return true;
}</code></pre>
<p>End of code example.</p>
================================================================================

================================================================================
EXTRACTED CODE BLOCKS
================================================================================

--- Code Block 1 ---
<pre><code>function example() {
  console.log('Hello, World!');
  return true;
}</code></pre>
================================================================================
```

#### 4. List All Inspect Tasks

```bash
npm run inspect:task -- list
```

Shows all tasks with names containing "INSPECT-" or "Manual Edit Task".

**Example output:**

```
Found 2 INSPECT task(s):

1. INSPECT-1769122811580 - Manual Edit Task
   ID: 1817452000005350387
   Created: 2025-01-23T10:30:00Z

2. INSPECT-1769123456789 - Manual Edit Task
   ID: 1817452000005350999
   Created: 2025-01-23T11:45:00Z

To read a task, run: npm run inspect:task -- read <task_id>
```

#### 5. Delete a Test Task

Delete a specific INSPECT task by ID:

```bash
npm run inspect:task -- delete <task_id>
```

**Example:**

```bash
npm run inspect:task -- delete 1817452000005350387
```

**Example output:**

```
📖 Verifying task 1817452000005350387 exists...

Task found: INSPECT-1769122811580 - Manual Edit Task
🗑️  Deleting task 1817452000005350387...

✅ Task deleted successfully!
```

#### 6. Delete All INSPECT Tasks

Clean up all INSPECT tasks at once:

```bash
npm run inspect:task -- delete-all
```

This will:

- Find all tasks with names containing "INSPECT-" or "Manual Edit Task"
- Display the list of tasks to be deleted
- Delete each task with rate limiting
- Show a summary of deleted and failed tasks

**Example output:**

```
🗑️  Finding all INSPECT tasks...

Found 3 INSPECT task(s) to delete:

1. INSPECT-1769122811580 - Manual Edit Task (ID: 1817452000005350387)
2. INSPECT-1769122999999 - Manual Edit Task (ID: 1817452000005350999)
3. INSPECT-1769123111111 - Manual Edit Task (ID: 1817452000005351111)

🗑️  Deleting tasks...

✅ Deleted: INSPECT-1769122811580 - Manual Edit Task
✅ Deleted: INSPECT-1769122999999 - Manual Edit Task
✅ Deleted: INSPECT-1769123111111 - Manual Edit Task

📊 Summary: 3 deleted, 0 failed
```

### Workflow Example

Here's a complete workflow for understanding Zoho's code block formatting:

1. **Create the task:**

   ```bash
   npm run inspect:task -- create
   ```

   Note the task ID from the output.

2. **Add formatting in Zoho:**
   - Open Zoho Projects portal
   - Find the task
   - Edit description
   - Add a code block with multiple lines:
     ```javascript
     function hello() {
     	console.log('Hello');
     	return true;
     }
     ```
   - Save the task

3. **Inspect the HTML:**

   ```bash
   npm run inspect:task -- read 1817452000005350387
   ```

4. **Copy the HTML structure** from the output and use it in your WYSIWYG tests

5. **Clean up when done:**

   ```bash
   # Delete a specific task
   npm run inspect:task -- delete 1817452000005350387

   # Or delete all INSPECT tasks at once
   npm run inspect:task -- delete-all
   ```

### Available Commands

```bash
npm run inspect:task -- create           # Create a new INSPECT task
npm run inspect:task -- read <task_id>   # Read task HTML content
npm run inspect:task -- list             # List all INSPECT tasks
npm run inspect:task -- delete <task_id> # Delete a specific task
npm run inspect:task -- delete-all       # Delete all INSPECT tasks
```

### Tips

- **Preserve the HTML exactly** - Copy/paste the exact HTML structure shown in the output
- **Test various formats** - Create multiple inspect tasks to test different HTML elements (code blocks, tables, links, images)
- **Check newlines** - Pay attention to how Zoho handles newlines in `<pre>` and `<code>` tags
- **Compare structures** - Create tasks with similar content to see if Zoho generates consistent HTML
- **Clean up regularly** - Use `delete-all` command to remove old INSPECT tasks and keep your project tidy
- **Verify before delete** - The delete command verifies the task exists before attempting deletion

## Best Practices

1. **Always cleanup** - Call `cleanup(client)` in both success and error paths before exit
2. **Explicit exit** - Call `process.exit(0)` for success or `process.exit(1)` for failures to ensure clean termination
3. **Validate responses** - Check response structure and data
4. **Use real data** - Tests should use actual API credentials
5. **Add delays** - Use `wait()` between tests to avoid rate limits
6. **Log clearly** - Use provided logging functions for consistent output
7. **Handle errors** - Catch and log errors with context

## Troubleshooting

### "Failed to load .env file"

- Ensure `.env` file exists in project root
- Check file permissions

### "Missing required environment variables"

- Verify all required variables are set in `.env`
- Check variable names match exactly

### "Error connecting to MCP server"

- Ensure project is built (`npm run build`)
- Check that `dist/index.js` exists
- Verify no TypeScript compilation errors

### "401 Unauthorized" errors

- Access token may have expired
- Verify refresh token and client credentials are correct
- Server should auto-refresh the token

### Tests timeout

- Check network connectivity
- Verify Zoho API domain is correct for your region
- Add more delays between tests if needed
