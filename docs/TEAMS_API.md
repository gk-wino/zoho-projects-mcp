# Zoho Projects Teams MCP Tools

This document describes the Teams functionality implemented in the Zoho Projects MCP server with OAuth scope `ZohoProjects.teams.READ`.

## Overview

The Teams module provides READ-only operations to retrieve team information, team members, and associated projects from Zoho Projects. These tools enable you to:

- Get team details from the portal or specific projects
- Retrieve users associated with teams
- Get projects associated with teams

## OAuth Scope Required

```
ZohoProjects.teams.READ
```

This scope grants read-only access to team information.

## Available Tools

### 1. get_team_details

Retrieve team details from the Zoho Projects portal.

**API Endpoint:** `GET /api/v3/portal/[PORTALID]/teams`

**Parameters:**

- `id` (string, optional): Team ID to filter specific team
- `search_term` (string, optional): Search by team name
- `page` (number, optional): Page number (default: 1)
- `per_page` (number, optional): Items per page (default: 10)
- `last_modified_time` (string, optional): Filter by last modification time (format: "2023-11-30T05:59:21.188Z")
- `sort_by` (string, optional): Sort order, e.g., "desc(name)" or "asc(name)"

**Example Request:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/teams?page=1&per_page=10&search_term=Dev&sort_by=asc(name)' \
  -H 'Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN'
```

**Response:**

```json
{
	"teams": [
		{
			"created_time": "2023-11-30T05:59:21.188Z",
			"email_verified": true,
			"name": "Development Team",
			"updated_by": {
				"zpuid": "4000000005091",
				"name": "Thompson K",
				"zuid": "16469952"
			},
			"id": "4000000062001",
			"created_by": {
				"zpuid": "4000000005091",
				"name": "Thompson K",
				"zuid": "16469952"
			},
			"lead": {
				"zpuid": "4000000005091",
				"name": "Thompson K",
				"zuid": "16469952"
			},
			"email": "devs-team@zylker.com"
		}
	],
	"page_info": {
		"per_page": 10,
		"has_next_page": false,
		"count": 1,
		"page": 1
	}
}
```

**Note:** This endpoint may return "Unauthorized Access" (error 6401) if:

- The account doesn't have teams configured
- Additional permissions beyond `ZohoProjects.teams.READ` are required
- The Teams feature is not enabled in the portal

---

### 2. get_projects_team

Retrieve teams from a specific project.

**API Endpoint:** `GET /api/v3/portal/[PORTALID]/projects/[PROJECTID]/teams`

**Parameters:**

- `project_id` (string, **required**): Project ID (obtain from list_projects)
- `id` (string, optional): Team ID to filter specific team
- `search_term` (string, optional): Search by team name
- `page` (number, optional): Page number (default: 1)
- `per_page` (number, optional): Items per page (default: 10)
- `last_modified_time` (string, optional): Filter by last modification time
- `sort_by` (string, optional): Sort order

**Example Request:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/projects/1817452000005334019/teams?page=1&per_page=10' \
  -H 'Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN'
```

**Response:**

```json
{
	"teams": [
		{
			"created_time": "2024-11-25T09:37:41.209Z",
			"email_verified": true,
			"last_updated_time": "2024-11-25T10:39:22.431Z",
			"name": "Backend Team",
			"updated_by": {
				"zpuid": "4000000002143",
				"name": "Aaron Gilbert",
				"zuid": "18891770"
			},
			"id": "4000000062001",
			"created_by": {
				"zpuid": "4000000002143",
				"name": "Aaron Gilbert",
				"zuid": "18891770"
			},
			"lead": {
				"zpuid": "4000000002143",
				"name": "Aaron Gilbert",
				"zuid": "18891770"
			},
			"email": "devs-team@zylker.com"
		}
	],
	"page_info": {
		"per_page": 10,
		"has_next_page": false,
		"count": 1,
		"page": 1
	}
}
```

✅ **Tested and Working**

---

### 3. get_team_users

Retrieve users from one or more teams.

**API Endpoint:** `GET /api/v3/portal/[PORTALID]/teams/users`

**Parameters:**

- `team_ids` (string, optional): Comma-separated team IDs as JSON array string, e.g., "[4000000062001,4000000015029]"
- `page` (number, optional): Page number (default: 1)
- `per_page` (number, optional): Items per page (default: 10)
- `last_modified_time` (string, optional): Filter by last modification time

**Example Request:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/teams/users?team_ids=[4000000062001,4000000015029]&page=1&per_page=10' \
  -H 'Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN'
```

**Response:**

```json
{
	"team_users": [
		{
			"zpuid": "4000000002143",
			"name": "Aaron Gilbert",
			"associated_teams": ["4000000062001"],
			"zuid": "18891770"
		},
		{
			"zpuid": "4000000005067",
			"name": "Carla Gracia",
			"associated_teams": ["4000000062001"],
			"zuid": "16279483"
		},
		{
			"zpuid": "4000000005073",
			"name": "Davidson G",
			"associated_teams": ["4000000062001"],
			"zuid": "16279531"
		}
	],
	"page_info": {
		"per_page": 10,
		"has_next_page": false,
		"count": 3,
		"page": 1
	}
}
```

✅ **Tested and Working**

---

### 4. get_teams_projects

Retrieve projects associated with one or more teams.

**API Endpoint:** `GET /api/v3/portal/[PORTALID]/teams/projects`

**Parameters:**

- `team_ids` (string, optional): Comma-separated team IDs as JSON array string, e.g., "[4000000062001,4000000015029]"
- `page` (number, optional): Page number (default: 1)
- `per_page` (number, optional): Items per page (default: 10)
- `last_modified_time` (string, optional): Filter by last modification time

**Example Request:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/teams/projects?team_ids=[4000000062001,4000000015029]&page=1&per_page=10' \
  -H 'Authorization: Zoho-oauthtoken YOUR_ACCESS_TOKEN'
```

**Response:**

```json
{
	"team_projects": [
		{
			"id": "4000000005325",
			"name": "Code Optimization",
			"associated_teams": ["4000000062001"]
		},
		{
			"id": "4000000008020",
			"name": "Code Test Plugin",
			"associated_teams": ["4000000062001"]
		}
	],
	"page_info": {
		"per_page": 10,
		"has_next_page": false,
		"count": 2,
		"page": 1
	}
}
```

✅ **Tested and Working**

---

## Testing

A test script is provided to verify all teams endpoints:

```bash
chmod +x test-teams.sh
./test-teams.sh
```

The script will:

1. Refresh the OAuth access token
2. Test all 4 teams endpoints
3. Display results with color-coded status

## Implementation Details

### File: `src/index.ts`

The teams functionality is implemented with:

1. **Tool Definitions** (lines ~880-990): Schema definitions for each teams tool
2. **Request Handlers** (lines ~990-1010): Switch case handlers for routing requests
3. **Implementation Methods** (lines ~1670-1750): Private methods that make API calls

### Key Features

- ✅ Query parameter building using `URLSearchParams`
- ✅ Proper error handling with Zoho API responses
- ✅ Pagination support for all list operations
- ✅ Optional filtering by team ID, search term, and modification time
- ✅ Sorting support for team listings

## Known Limitations

1. **Portal-level team details**: The `get_team_details` endpoint returns "Unauthorized Access" (error code 6401) in some configurations. This appears to be a limitation in the Zoho API or requires additional permissions not available with `ZohoProjects.teams.READ` alone.

2. **Read-only operations**: Only GET operations are implemented as per the OAuth scope `ZohoProjects.teams.READ`. Create, update, and delete operations require different scopes:
   - `ZohoProjects.teams.CREATE`
   - `ZohoProjects.teams.UPDATE`
   - `ZohoProjects.teams.DELETE`

## Error Handling

Common errors you might encounter:

| Error Code | Message               | Cause                                           | Solution                                           |
| ---------- | --------------------- | ----------------------------------------------- | -------------------------------------------------- |
| 6401       | Unauthorized Access   | Insufficient permissions or feature not enabled | Check OAuth scope, verify Teams feature is enabled |
| 6831       | Invalid Parameter     | Wrong parameter format or value                 | Verify parameter format matches documentation      |
| 6500       | Internal Server Error | Server-side issue                               | Retry the request after a short delay              |

## References

- [Zoho Projects API Documentation - Teams](https://www.zoho.com/projects/help/rest-api/teams-api.html)
- [OAuth 2.0 Scopes](https://www.zoho.com/projects/help/rest-api/oauth-scopes.html)

## Support

For issues or questions:

1. Check the error code in the response
2. Verify your OAuth token has the correct scope
3. Ensure the Teams feature is enabled in your Zoho Projects portal
4. Review the test results from `test-teams.sh`
