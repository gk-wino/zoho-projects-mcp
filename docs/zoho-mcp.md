---
post_title: Zoho Projects MCP Server - User Guide
author1: Geoffrey Kimani
summary: Comprehensive guide on using the Zoho Projects MCP Server tools for project management automation
post_date: 2026-01-22
---

## Overview

The Zoho Projects MCP (Model Context Protocol) Server provides a set of tools to interact with Zoho Projects through AI assistants like Claude. This guide covers all available tools and how to use them effectively.

## Available Tools

The server provides tools organized into the following categories:

- **Portal Operations** - Manage portals
- **Project Operations** - Create, read, update, and delete projects
- **Task Operations** - Manage tasks within projects
- **Task List Operations** - Organize tasks into lists
- **Issue Operations** - Track and manage issues/bugs
- **Phase/Milestone Operations** - Manage project phases
- **User Operations** - List and manage users
- **Search Operations** - Search across projects and modules

## Important Concepts

### Task Lists

**Tasks in Zoho Projects must belong to a task list.** There are two types:

1. **Default/General Task List** - Created using `create_default_tasklist`, automatically used when creating tasks without specifying a task list
2. **Custom Task Lists** - Created using `create_tasklist` for organizing tasks by category, phase, or team

### Date Formats

**All dates must be in ISO 8601 format:**

- ✅ Correct: `2026-01-27T08:00:00Z`
- ✅ Correct: `2026-01-27T08:00:00.000Z`
- ❌ Wrong: `2026-01-27`
- ❌ Wrong: `01/27/2026`

### User Identification

Users are identified by **ZPUID** (Zoho Projects User ID), not email addresses. Use `list_users` to get ZPUIDs.

## Common Workflows

### 1. Setting Up a New Project

#### Step 1: List available portals

```typescript
list_portals();
```

#### Step 2: Create a new project

```typescript
create_project({
	name: 'Mobile App Development',
	description: 'Q1 2026 mobile app project',
	start_date: '2026-01-27',
	end_date: '2026-03-31',
	is_public: false,
});
```

#### Step 3: Create a default task list

```typescript
create_default_tasklist({
	project_id: '1817452000005334019',
	flag: 'internal',
});
```

#### Step 4: Create custom task lists (optional)

```typescript
create_tasklist({
	project_id: '1817452000005334019',
	name: 'Backend Development',
	flag: 'internal',
});

create_tasklist({
	project_id: '1817452000005334019',
	name: 'Frontend Development',
	flag: 'internal',
});
```

### 2. Creating Tasks

#### Using Default Task List

If you have a default task list, simply omit `tasklist_id`:

```typescript
create_task({
	project_id: '1817452000005334019',
	name: 'Setup database schema',
	description: 'Create initial database schema with user and product tables',
	priority: 'high',
	start_date: '2026-01-23T08:00:00Z',
	end_date: '2026-01-25T17:00:00Z',
	assignee_zpuid: '1817452000000869003',
});
```

#### Using Specific Task List

To create a task in a specific task list:

```typescript
// First, list available task lists
list_tasklists({
	project_id: '1817452000005334019',
});

// Then create task with tasklist_id
create_task({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005336009', // Specific task list
	name: 'Implement user authentication',
	description: 'Add JWT-based authentication system',
	priority: 'high',
	start_date: '2026-01-27T08:00:00Z',
	end_date: '2026-02-05T17:00:00Z',
	assignee_zpuid: '1817452000000869003',
});
```

### 3. Managing Tasks

#### List Tasks in Project

```typescript
list_tasks({
	project_id: '1817452000005334019',
	page: 1,
	per_page: 10,
});
```

#### Get Task Details

```typescript
get_task({
	project_id: '1817452000005334019',
	task_id: '1817452000005338016',
});
```

#### Update Task

```typescript
update_task({
	project_id: '1817452000005334019',
	task_id: '1817452000005338016',
	priority: 'medium',
	end_date: '2026-02-10T17:00:00Z',
});
```

#### Move Task to Different Task List

```typescript
update_task({
	project_id: '1817452000005334019',
	task_id: '1817452000005338016',
	tasklist_id: '1817452000005337029', // New task list
});
```

#### Delete Task

```typescript
delete_task({
	project_id: '1817452000005334019',
	task_id: '1817452000005338016',
});
```

### 4. Managing Task Lists

#### List Task Lists

```typescript
list_tasklists({
	project_id: '1817452000005334019',
	page: 1,
	per_page: 10,
});
```

#### Get Task List Details

```typescript
get_tasklist({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005336009',
});
```

#### Update Task List

```typescript
update_tasklist({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005336009',
	name: 'Merchant Onboarding - Updated',
	flag: 'external',
});
```

#### Delete Task List

```typescript
delete_tasklist({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005339014',
});
```

### 5. Working with Users

#### List Users in Project

```typescript
list_users({
	project_id: '1817452000005334019',
});
```

#### List All Portal Users

```typescript
list_users();
```

### 6. Managing Issues

#### Create Issue

```typescript
create_issue({
	project_id: '1817452000005334019',
	title: 'Login page not loading',
	description: 'The login page returns 404 error when accessing /login',
	severity: 'critical',
	due_date: '02-15-2026', // MM-DD-YYYY format for issues
});
```

#### List Issues

```typescript
list_issues({
	project_id: '1817452000005334019',
	page: 1,
	per_page: 10,
});
```

#### Update Issue

```typescript
update_issue({
	project_id: '1817452000005334019',
	issue_id: '1817452000005340001',
	severity: 'major',
	description: 'Updated description with more details',
});
```

### 7. Searching

#### Search Across Project

```typescript
search({
	search_term: 'authentication',
	project_id: '1817452000005334019',
	module: 'tasks',
	page: 1,
	per_page: 10,
});
```

#### Search Across Portal

```typescript
search({
	search_term: 'payment',
	module: 'all',
	page: 1,
	per_page: 10,
});
```

## Best Practices

### 1. Always Create Default Task List First

Before creating tasks in a new project:

```typescript
// Create default task list
create_default_tasklist({
	project_id: 'YOUR_PROJECT_ID',
	flag: 'internal',
});
```

### 2. Get IDs Before Creating Related Items

Always list items first to get their IDs:

```typescript
// Get project ID
list_projects();

// Get task list ID
list_tasklists({ project_id: 'PROJECT_ID' });

// Get user ZPUID
list_users({ project_id: 'PROJECT_ID' });
```

### 3. Use ISO 8601 for Dates

Always use full ISO 8601 format for task dates:

```typescript
// ✅ Good
start_date: '2026-01-27T08:00:00Z';
end_date: '2026-02-05T17:00:00Z';

// ❌ Bad - will cause API errors
start_date: '2026-01-27';
end_date: '02/05/2026';
```

### 4. Organize with Task Lists

Use task lists to organize work:

- **By Phase**: "Design", "Development", "Testing", "Deployment"
- **By Team**: "Backend Team", "Frontend Team", "DevOps Team"
- **By Feature**: "User Authentication", "Payment Integration", "Reporting"

### 5. Check for Errors

If you get an error:

1. **"Create a default task list or enter a task list ID"** - Create a default task list first
2. **"Input format mismatch"** for dates - Use ISO 8601 format
3. **"Invalid parameter value"** - Check that IDs exist and are correct

## Tool Reference

### Portal Tools

| Tool           | Description        | Required Parameters |
| -------------- | ------------------ | ------------------- |
| `list_portals` | List all portals   | None                |
| `get_portal`   | Get portal details | `portal_id`         |

### Project Tools

| Tool             | Description         | Required Parameters |
| ---------------- | ------------------- | ------------------- |
| `list_projects`  | List all projects   | None                |
| `get_project`    | Get project details | `project_id`        |
| `create_project` | Create new project  | `name`              |
| `update_project` | Update project      | `project_id`        |
| `delete_project` | Delete project      | `project_id`        |

### Task Tools

| Tool          | Description      | Required Parameters           |
| ------------- | ---------------- | ----------------------------- |
| `list_tasks`  | List tasks       | None (optional: `project_id`) |
| `get_task`    | Get task details | `project_id`, `task_id`       |
| `create_task` | Create new task  | `project_id`, `name`          |
| `update_task` | Update task      | `project_id`, `task_id`       |
| `delete_task` | Delete task      | `project_id`, `task_id`       |

### Task List Tools

| Tool                      | Description              | Required Parameters           |
| ------------------------- | ------------------------ | ----------------------------- |
| `list_tasklists`          | List task lists          | None (optional: `project_id`) |
| `get_tasklist`            | Get task list details    | `project_id`, `tasklist_id`   |
| `create_tasklist`         | Create custom task list  | `project_id`, `name`          |
| `update_tasklist`         | Update task list         | `project_id`, `tasklist_id`   |
| `delete_tasklist`         | Delete task list         | `project_id`, `tasklist_id`   |
| `create_default_tasklist` | Create default task list | `project_id`, `flag`          |

### Issue Tools

| Tool           | Description       | Required Parameters           |
| -------------- | ----------------- | ----------------------------- |
| `list_issues`  | List issues       | None (optional: `project_id`) |
| `get_issue`    | Get issue details | `project_id`, `issue_id`      |
| `create_issue` | Create new issue  | `project_id`, `title`         |
| `update_issue` | Update issue      | `project_id`, `issue_id`      |

### Other Tools

| Tool           | Description            | Required Parameters           |
| -------------- | ---------------------- | ----------------------------- |
| `list_phases`  | List milestones/phases | `project_id`                  |
| `create_phase` | Create milestone/phase | `project_id`, `name`          |
| `list_users`   | List users             | None (optional: `project_id`) |
| `search`       | Search across modules  | `search_term`                 |

## Troubleshooting

### Error: "Create a default task list or enter a task list ID"

**Cause**: Project doesn't have a default task list, and no `tasklist_id` was provided.

**Solution**:

```typescript
create_default_tasklist({
	project_id: 'YOUR_PROJECT_ID',
	flag: 'internal',
});
```

### Error: "Input format mismatch" for dates

**Cause**: Date is not in ISO 8601 format.

**Solution**: Use format like `2026-01-27T08:00:00Z`

### Error: "Invalid ticket" or "Invalid parameter value"

**Cause**: Wrong ID provided or item doesn't exist.

**Solution**: List items first to get correct IDs:

```typescript
list_projects();
list_tasklists({ project_id: 'PROJECT_ID' });
list_users({ project_id: 'PROJECT_ID' });
```

## Examples

### Complete Project Setup Example

```typescript
// 1. List portals to get portal info
list_portals();

// 2. Create project
create_project({
	name: 'E-commerce Platform',
	description: 'New e-commerce platform for Q1 2026',
	start_date: '2026-01-27',
	end_date: '2026-03-31',
});
// Returns: { id: "1817452000005334019", ... }

// 3. Create default task list
create_default_tasklist({
	project_id: '1817452000005334019',
	flag: 'internal',
});
// Returns: { id: "1817452000005337031", name: "General", ... }

// 4. Create custom task lists
create_tasklist({
	project_id: '1817452000005334019',
	name: 'Backend Development',
	flag: 'internal',
});
// Returns: { id: "1817452000005336009", ... }

create_tasklist({
	project_id: '1817452000005334019',
	name: 'Frontend Development',
	flag: 'internal',
});
// Returns: { id: "1817452000005337029", ... }

// 5. Get user IDs
list_users({ project_id: '1817452000005334019' });
// Find user and get zpuid: "1817452000000869003"

// 6. Create tasks in specific lists
create_task({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005336009', // Backend list
	name: 'Setup database schema',
	description: 'Create PostgreSQL schema with all required tables',
	priority: 'high',
	start_date: '2026-01-27T08:00:00Z',
	end_date: '2026-01-30T17:00:00Z',
	assignee_zpuid: '1817452000000869003',
});

create_task({
	project_id: '1817452000005334019',
	tasklist_id: '1817452000005337029', // Frontend list
	name: 'Design product catalog UI',
	description: 'Create responsive product catalog with filters',
	priority: 'medium',
	start_date: '2026-01-29T08:00:00Z',
	end_date: '2026-02-05T17:00:00Z',
	assignee_zpuid: '1817452000000869003',
});

// 7. Verify tasks were created
list_tasks({
	project_id: '1817452000005334019',
	page: 1,
	per_page: 10,
});
```

## Summary

The Zoho Projects MCP Server provides comprehensive tools for managing projects, tasks, issues, and users through AI assistants. Key points to remember:

1. **Always create a default task list** before creating tasks
2. **Use ISO 8601 format** for all dates (e.g., `2026-01-27T08:00:00Z`)
3. **Get IDs first** by listing items before creating related items
4. **Organize with task lists** to keep work structured
5. **Check error messages** - they usually tell you exactly what's wrong

For more information, see the [Zoho Projects API documentation](https://www.zoho.com/projects/help/rest-api/zoho-projects-rest-api.html).
