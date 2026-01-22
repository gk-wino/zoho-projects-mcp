# Smoke Tests

Smoke tests verify that the basic functionality of the Zoho Projects MCP server is working correctly by making real API calls through the MCP protocol.

## Structure

```
tests/smoke/
├── utils.ts          # Common utilities for all smoke tests
├── portal.test.ts    # Portal functionality tests
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
- **`cleanup(client)`** - Gracefully closes MCP client connection

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
# Using Node directly
node tests/smoke/portal.test.js

# Or make it executable
chmod +x tests/smoke/portal.test.js
./tests/smoke/portal.test.js

# Using tsx for TypeScript
npx tsx tests/smoke/portal.test.ts
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

## Expected Output

```
🚀 Starting Portal Smoke Tests

📋 Loading environment variables...
✅ Environment loaded (Portal ID: 753397720)

🔨 Ensuring project is built...

🔌 Connecting to MCP server...
✅ Connected to MCP server

============================================================
🧪 TEST: list_portals
============================================================

Found 1 portal(s):
  1. Your Portal Name (ID: 753397720)

✅ PASSED: list_portals

============================================================
🧪 TEST: get_portal
============================================================

Portal Details:
  Name: Your Portal Name
  ID: 753397720
  Owner: Your Name
  Role: admin
  Created: 2024-01-15
  Timezone: America/Los_Angeles
  Date Format: MM/dd/yyyy

✅ PASSED: get_portal

============================================================
✨ All Portal Smoke Tests Passed!
============================================================

📊 Test Summary:
   Total Tests: 2
   Passed: 2
   Failed: 0
   Portal Validated: 753397720

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
   	const env = loadEnv();
   	const client = await createMcpClient();

   	try {
   		await testCreateTask(client, env.portalId);
   		// Add more tests...
   	} finally {
   		await cleanup(client);
   	}
   }
   ```

2. **Run the new test**:
   ```bash
   node tests/smoke/task.test.js
   ```

## Best Practices

1. **Always cleanup** - Use try/finally to ensure client cleanup
2. **Validate responses** - Check response structure and data
3. **Use real data** - Tests should use actual API credentials
4. **Add delays** - Use `wait()` between tests to avoid rate limits
5. **Log clearly** - Use provided logging functions for consistent output
6. **Handle errors** - Catch and log errors with context

## Troubleshooting

### "Failed to load .env file"

- Ensure `.env` file exists in project root
- Check file permissions

### "Missing required environment variables"

- Verify all required variables are set in `.env`
- Check variable names match exactly

### "Error connecting to MCP server"

- Ensure project is built (`npm run build`)
- Check that `build/index.js` exists

### "401 Unauthorized" errors

- Access token may have expired
- Verify refresh token and client credentials are correct
- Server should auto-refresh the token

### Tests timeout

- Check network connectivity
- Verify Zoho API domain is correct for your region
- Add more delays between tests if needed
