# Smoke Tests

Smoke tests verify that the basic functionality of the Zoho Projects MCP server is working correctly by making real API calls through the MCP protocol.

## Structure

```
tests/smoke/
├── utils.ts          # Common utilities for all smoke tests
├── portal.test.ts    # Portal functionality tests
├── project.test.ts   # Project functionality tests
└── README.md         # This file
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
- **`logTestFailure(testName, error)`** - Logs test failure

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

### 6. Restore Project (`restore_project`)

- Attempts to restore project from trash
- May be skipped if user lacks permissions
- Validates restoration on success
- Logs result or skip reason

### 7. Delete Project (`delete_project`)

- Permanently deletes project from trash
- May be skipped if user lacks permissions
- Validates permanent deletion on success
- Cannot be undone
- Logs result or skip reason

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
