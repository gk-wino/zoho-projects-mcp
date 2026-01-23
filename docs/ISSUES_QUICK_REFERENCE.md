# Issues Quick Reference Guide

## Quick Start

### Run Tests

```bash
# Test all issue tools
npm run test:smoke:issue

# Test tasks (including subtasks)
npm run test:smoke:task
```

### Start Server

```bash
npm run build && npm start
```

## All Issue Tools (31 Total)

### Basic Operations

| Tool                   | Description          |
| ---------------------- | -------------------- |
| `list_issues`          | List all issues      |
| `get_issue`            | Get specific issue   |
| `create_issue`         | Create new issue     |
| `update_issue`         | Update issue         |
| `delete_issue`         | Delete issue         |
| `get_issue_activities` | Get activity history |

### Description & Status

| Tool                          | Description              |
| ----------------------------- | ------------------------ |
| `get_issue_description`       | Get detailed description |
| `get_issue_status_transition` | Get status history       |

### Issue Management

| Tool          | Description               |
| ------------- | ------------------------- |
| `move_issue`  | Move to different project |
| `clone_issue` | Duplicate issue           |

### Comments

| Tool                   | Description    |
| ---------------------- | -------------- |
| `add_issue_comment`    | Add comment    |
| `get_issue_comments`   | List comments  |
| `update_issue_comment` | Update comment |
| `delete_issue_comment` | Delete comment |

### Issue Linking

| Tool                      | Description          |
| ------------------------- | -------------------- |
| `get_issue_linked_issues` | Get linked issues    |
| `link_issues`             | Link two issues      |
| `bulk_link_issues`        | Link multiple issues |
| `change_link_type`        | Change link type     |
| `unlink_issues`           | Remove link          |

### Task Association

| Tool                         | Description          |
| ---------------------------- | -------------------- |
| `get_issue_associated_tasks` | Get associated tasks |
| `associate_tasks_to_issue`   | Associate task       |
| `bulk_associate_tasks`       | Associate multiple   |
| `dissociate_task_from_issue` | Remove association   |

### Resolution

| Tool                      | Description       |
| ------------------------- | ----------------- |
| `get_issue_resolution`    | Get resolution    |
| `add_issue_resolution`    | Add resolution    |
| `update_issue_resolution` | Update resolution |
| `delete_issue_resolution` | Delete resolution |

### Followers

| Tool                     | Description      |
| ------------------------ | ---------------- |
| `get_issue_followers`    | List followers   |
| `follow_issue`           | Add followers    |
| `remove_issue_followers` | Remove followers |

### Attachments

| Tool                          | Description       |
| ----------------------------- | ----------------- |
| `get_issue_attachments`       | List attachments  |
| `associate_issue_attachments` | Add attachments   |
| `dissociate_issue_attachment` | Remove attachment |

## Subtask Support

### Create Subtask

```typescript
{
  name: 'create_task',
  arguments: {
    project_id: 'PROJECT_ID',
    parent_task_id: 'PARENT_TASK_ID',  // ← Makes it a subtask
    name: 'Subtask name',
    description: 'Subtask description'
  }
}
```

### Supported Nesting

- ✅ Level 1: Subtask under parent task
- ✅ Level 2: Subtask under subtask
- ✅ Level 3: Subtask under level 2 subtask

## Common Parameters

### Required in Most Tools

- `project_id` - Project identifier
- `issue_id` - Issue identifier (for operations on existing issues)

### Optional but Common

- `name` - Issue/task name
- `description` - Plain text description
- `html_description` - HTML formatted description
- `flag` - 'Internal' or 'External'
- `assignee_zpuid` - User ID to assign
- `severity_id` - Severity level ID
- `classification_id` - Classification ID
- `module_id` - Module ID

## Link Types

Common issue link types:

- `related_to`
- `depends_on`
- `duplicates`
- `blocks`
- `is_blocked_by`

(Actual available types depend on your portal configuration)

## Status Codes

- ✅ Success - 200/201
- ❌ Unauthorized - 401 (triggers token refresh)
- ❌ Not Found - 404
- ❌ Bad Request - 400

## Tips

1. **Pagination:** Use `page` and `per_page` parameters for list operations
2. **HTML Content:** Use `html_description` for rich text, fallback to `description` for plain text
3. **IDs:** Get IDs from list/get operations or test caching
4. **Testing:** Use test project cache to speed up test runs
5. **Cleanup:** Tests automatically clean up orphaned test data

## File Locations

- **Schemas:** `src/schemas/issue.schemas.ts`
- **Handler:** `src/handlers/IssueHandler.ts`
- **Tests:** `tests/smoke/issue.test.ts`
- **Docs:** `docs/ISSUES_IMPLEMENTATION_SUMMARY.md`

## Support

- API Docs: https://projects.zoho.eu/api-docs#issues
- Test README: `tests/smoke/README.md`
- Main README: `README.md`
