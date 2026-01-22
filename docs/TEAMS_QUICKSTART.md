# Quick Start: Teams API

This is a quick reference guide for using the Teams functionality in the Zoho Projects MCP server.

## Prerequisites

✅ OAuth scope: `ZohoProjects.teams.READ`  
✅ Valid access token  
✅ Portal ID

## Available Tools (4)

### 1. get_projects_team ⭐ RECOMMENDED

Get teams from a specific project.

**MCP Tool:**

```json
{
	"name": "get_projects_team",
	"arguments": {
		"project_id": "1817452000005334019",
		"page": 1,
		"per_page": 10
	}
}
```

**cURL:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/projects/1817452000005334019/teams' \
  -H 'Authorization: Zoho-oauthtoken YOUR_TOKEN'
```

---

### 2. get_team_users ⭐ RECOMMENDED

Get users from teams.

**MCP Tool:**

```json
{
	"name": "get_team_users",
	"arguments": {
		"team_ids": "[1817452000002373065,1817452000002373053]",
		"page": 1,
		"per_page": 10
	}
}
```

**cURL:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/teams/users?team_ids=[1817452000002373065]' \
  -H 'Authorization: Zoho-oauthtoken YOUR_TOKEN'
```

---

### 3. get_teams_projects ⭐ RECOMMENDED

Get projects from teams.

**MCP Tool:**

```json
{
	"name": "get_teams_projects",
	"arguments": {
		"team_ids": "[1817452000002373065,1817452000002373053]",
		"page": 1,
		"per_page": 10
	}
}
```

**cURL:**

```bash
curl -X GET 'https://projectsapi.zoho.com/api/v3/portal/753397720/teams/projects?team_ids=[1817452000002373065]' \
  -H 'Authorization: Zoho-oauthtoken YOUR_TOKEN'
```

---

### 4. get_team_details ⚠️ LIMITED

Get team details from portal (may require additional permissions).

**MCP Tool:**

```json
{
	"name": "get_team_details",
	"arguments": {
		"page": 1,
		"per_page": 10,
		"search_term": "Dev"
	}
}
```

**Note:** This endpoint may return "Unauthorized Access" (error 6401) depending on portal configuration.

## Quick Test

Run the comprehensive test suite:

```bash
chmod +x test-teams-comprehensive.sh
./test-teams-comprehensive.sh
```

Expected results:

- ✅ 6/6 tests pass
- ⚠️ 1 known limitation (portal-level teams)
- Found 34 team users
- Found 64 team projects

## Common Use Cases

### Get all teams in a project

```bash
get_projects_team(project_id="YOUR_PROJECT_ID")
```

### Get all users in specific teams

```bash
get_team_users(team_ids="[TEAM_ID_1,TEAM_ID_2]")
```

### Get all projects associated with teams

```bash
get_teams_projects(team_ids="[TEAM_ID_1,TEAM_ID_2]")
```

## Troubleshooting

| Issue                        | Solution                                             |
| ---------------------------- | ---------------------------------------------------- |
| "Unauthorized Access" (6401) | Check OAuth scope includes `ZohoProjects.teams.READ` |
| Empty results                | Verify teams exist in the project/portal             |
| "Invalid Parameter"          | Check team_ids format: `"[id1,id2]"` as string       |

## Next Steps

- Read full documentation: [docs/TEAMS_API.md](TEAMS_API.md)
- Implementation details: [docs/IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Run tests: `./test-teams-comprehensive.sh`
