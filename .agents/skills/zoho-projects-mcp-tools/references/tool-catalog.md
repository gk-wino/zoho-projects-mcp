# Zoho Projects MCP Tool Catalog

This catalog is generated from the current MCP schema files in `src/schemas`. Use it to choose the right tool quickly, confirm required parameters, and check parameter descriptions before calling a tool.

## How To Use This Reference

- Jump to a domain section such as `## Tasks` or `## Issues`.
- Search for a tool with `rg "^### `tool_name`" .agents/skills/zoho-projects-mcp-tools/references/tool-catalog.md`.
- Prefer `list_*` or `search` tools first when you need IDs for follow-up `get_*`, `update_*`, `delete_*`, or association tools.
- Treat the schema files in `src/schemas` as the final authority if this catalog and the source ever differ.

## Common Conventions

- IDs are usually strings unless the schema description says otherwise.
- Pagination commonly uses `page` and `per_page`.
- Project date-only fields usually use `YYYY-MM-DD`.
- Task schedule fields use ISO 8601 timestamps.
- Phase date fields use `MM/DD/YYYY`.
- Enum parameters list their allowed values directly in the parameter description.

## Portals

### `list_portals`

Retrieve all Zoho Projects portals. Use this first to discover available portals and collect `portal_id` values for portal-scoped tools.

Required: none.

Parameters: none.

### `get_portal`

Get details of a specific portal. Use this when you already know the portal identifier and need portal details or metadata.

Required: `portal_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.

## Projects

### `list_projects`

List all projects in a portal. Use this to browse projects, collect `project_id` values, and scope follow-up project, task, issue, or phase operations.

Required: none.

Parameters:
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_project`

Get details of a specific project. Use this when you already know the project identifier and need the full project record.

Required: `project_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.

### `create_project`

Create a new project in the Zoho Projects portal. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use YYYY-MM-DD.

Required: `name`.

Parameters:
- `name`: Project name to create (maximum 200 characters).
- `description`: Project description to create (maximum 80000 characters).
- `start_date`: Start date in YYYY-MM-DD format.
- `end_date`: End date in YYYY-MM-DD format.
- `project_type`: Project type for the new project. Allowed values: `active`, `template`.
- `owner`: Project owner object with zpuid.
  - `owner.zpuid`: Owner ZPUID.
- `is_public_project`: Whether the project is public (true or false).
- `status`: Project status object with id.
  - `status.id`: Status ID.
- `layout`: Project layout details with id.
  - `layout.id`: Layout ID.
- `added_via`: Source used to create the project. Allowed values: `web`, `api`.
- `is_rollup_project`: Whether this is a roll-up project (true or false).
- `budget_info`: Project budget details (max 80000 characters).
- `project_group`: Project group details with id.
  - `project_group.id`: Project group ID.
- `sub_module_settings`: Sub-module settings for the project.
- `tags`: Array of tag objects or IDs to associate with the project.
- `copy_from`: Template ID or existing project ID to copy from.

### `update_project`

Update an existing project in the Zoho Projects portal. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use YYYY-MM-DD.

Required: `project_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `name`: Updated project name (maximum 200 characters).
- `description`: Updated project description (maximum 80000 characters).
- `start_date`: Start date in YYYY-MM-DD format.
- `end_date`: End date in YYYY-MM-DD format.
- `project_type`: Updated project type. Allowed values: `active`, `template`, `archived`.
- `owner`: Project owner object with zpuid.
  - `owner.zpuid`: Owner ZPUID.
- `is_public_project`: Whether the project is public (true or false).
- `completed_time`: Project completion timestamp in the date-time format accepted by Zoho.
- `status`: Project status object with id.
  - `status.id`: Status ID.
- `layout`: Project layout details with id.
  - `layout.id`: Layout ID.
- `added_via`: Updated source used to create the project. Allowed values: `web`, `api`.
- `is_rollup_project`: Whether this is a roll-up project (true or false).
- `budget_info`: Project budget details (max 80000 characters).
- `project_group`: Project group details with id.
  - `project_group.id`: Project group ID.
- `tags`: Array of tag objects or IDs to associate with the project.

### `trash_project`

Move a project to the trash (can be restored within 30 days). Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.

## Tasks

### `list_tasks`

List tasks from a project or portal. Use `project_id` to scope the task list to one project, or omit it for portal-level task listing when that behavior is supported.

Required: none.

Parameters:
- `project_id`: Project ID when you want to limit the task list to one project. Omit it for portal-level task listing when supported.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_task`

Get details of a specific task. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.

### `create_task`

Create a new task in a project task list. Tasks must be created within a task list. If tasklist_id is not provided, the general/default task list will be used (if it exists). Use create_default_tasklist first if no default task list exists. To create a subtask, provide parent_task_id. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use ISO 8601; `duration` may require HH:MM when using hour-based duration.

Required: `project_id`, `name`.

Parameters:
- `project_id`: Project ID where the task will be created. Obtain from `list_projects`.
- `tasklist_id`: Task list ID where the task will be created. If omitted, Zoho uses the general or default task list when available.
- `parent_task_id`: Parent task ID when creating a subtask.
- `name`: Task name to create.
- `description`: Task description (optional). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.
- `priority`: Task priority when the tool supports it. Allowed values: `none`, `low`, `medium`, `high`.
- `start_date`: Start date in ISO 8601 format (e.g., 2026-01-27T08:00:00Z or 2026-01-27T08:00:00.000Z).
- `end_date`: End date in ISO 8601 format (e.g., 2026-02-05T17:00:00Z or 2026-02-05T17:00:00.000Z).
- `assignee_zpuid`: Assignee user ZPUID for the task.
- `status`: Task status object, typically with an `id` field.
- `duration`: Task duration as JSON object with value and type fields. Example: {"value": "5", "type": "days"} or {"value": "3:00", "type": "hours"}. When using type "hours", value must be in HH:MM format (e.g., "2:30" for 2.5 hours).
- `completion_percentage`: Task completion percentage (0-100).
- `billing_type`: Billing type for the task. Allowed values: `none`, `billable`, `non_billable`.
- `attachments`: Array of file attachment IDs to associate with the task (maximum 10 items).
- `owners_and_work`: Owner and work allocation object for the task, including owner ZPUIDs and work values.
- `tags`: Array of tags for the task.
- `teams`: Array of team objects to associate with the task.
- `recurrence`: Recurrence details of the task as JSON object.
- `budget_info`: Budget details of the task as JSON object. Can include fields like budget, revenue_budget, threshold, exchange_rate.

### `update_task`

Update a task properties. You can also move a task to a different task list by providing tasklist_id. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use ISO 8601; `duration` may require HH:MM when using hour-based duration.

Required: `project_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `tasklist_id`: Task list ID when moving the task to a different task list.
- `name`: Updated task name.
- `description`: Task description (optional - only if updating). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.
- `priority`: Task priority when the tool supports it. Allowed values: `none`, `low`, `medium`, `high`.
- `start_date`: Start date in ISO 8601 format (e.g., 2026-01-27T08:00:00Z or 2026-01-27T08:00:00.000Z).
- `end_date`: End date in ISO 8601 format (e.g., 2026-02-05T17:00:00Z or 2026-02-05T17:00:00.000Z).
- `assignee_zpuid`: Updated assignee user ZPUID for the task.
- `status`: Updated task status object, typically with an `id` field.
- `duration`: Task duration as JSON object with value and type fields. Example: {"value": "5", "type": "days"} or {"value": "3:00", "type": "hours"}. When using type "hours", value must be in HH:MM format (e.g., "2:30" for 2.5 hours).
- `completion_percentage`: Task completion percentage (0-100).
- `billing_type`: Billing type for the task. Allowed values: `none`, `billable`, `non_billable`.
- `attachments`: Array of file attachment IDs to associate with the task (maximum 10 items).
- `owners_and_work`: Updated owner and work allocation object for the task.
- `tags`: Array of tags for the task.
- `teams`: Array of team objects to add or remove from the task.
- `recurrence`: Recurrence details of the task as JSON object.
- `reminder`: Reminder configuration object for the task.
- `budget_info`: Budget details of the task as JSON object. Can include fields like budget, revenue_budget, threshold, exchange_rate.
- `remove_dependency_lag`: Set to true to forcefully remove dependency lag.

### `delete_task`

Delete a task. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.

### `clone_task`

Clone a task to create multiple instances within the same project. Each cloned instance will have the same properties as the original task. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `task_id`, `no_of_instances`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `no_of_instances`: Number of task instances to create (must be at least 1).

### `move_task`

Move a task to a different task list within the same project. This requires the target task list ID and optional status mapping. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `task_id`, `target_tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `target_tasklist_id`: Target task list ID where the task should be moved.

### `get_associated_bugs`

Get all bugs/issues associated with a specific task. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.

### `associate_bugs`

Associate one or more bugs/issues with a task. This creates a link between the task and the specified bugs. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `task_id`, `bug_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `bug_ids`: Array of issue IDs to associate with the task.

### `disassociate_bug`

Remove the association between a task and a bug/issue. This breaks the link but does not delete the bug. Use this when the returned action or record matches the identifiers and filters you already have available.

Required: `project_id`, `task_id`, `bug_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `bug_id`: Issue ID to remove from the task association list.

### `list_task_comments`

Get all comments for a specific task. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools.

Required: `project_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `sort_by`: Comment sort field, for example `created_time` or `modified_time`.

### `add_task_comment`

Add a new comment to a task. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `task_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `comment`: Comment text to create or update.
- `attachments`: Array of attachment IDs to associate with the new task comment.

### `update_task_comment`

Update an existing task comment. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `task_id`, `comment_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.
- `comment`: Comment text to create or update.
- `attachments`: Array of attachment IDs to associate with the updated task comment.

### `delete_task_comment`

Delete a task comment. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `task_id`, `comment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `task_id`: Task ID. Obtain from `list_tasks` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.

## Issues

### `list_issues`

List issues from a project or portal. Requires page and per_page parameters. Use `project_id` to scope the issue list to one project, or omit it for portal-level issue listing when that behavior is supported.

Required: `page`, `per_page`.

Parameters:
- `project_id`: Project ID when you want to limit issues to one project. Omit it for portal-level issue listing when supported.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_issue`

Get details of a specific issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `create_issue`

Create a new issue in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `due_date` uses YYYY-MM-DD.

Required: `project_id`, `name`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `name`: Issue title to create.
- `description`: Issue description to create.
- `flag`: Issue flag type. Allowed values: `Internal`, `External`.
- `due_date`: Due date (YYYY-MM-DD).
- `assignee_zpuid`: Assignee user ZPUID for the issue.
- `severity_id`: Severity ID.
- `classification_id`: Classification ID.
- `module_id`: Module ID.

### `update_issue`

Update an existing issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `due_date` uses YYYY-MM-DD.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `name`: Updated issue title.
- `description`: Updated issue description.
- `flag`: Issue flag type. Allowed values: `Internal`, `External`.
- `due_date`: Due date (YYYY-MM-DD).
- `assignee_zpuid`: Updated assignee user ZPUID for the issue.
- `severity_id`: Severity ID.
- `classification_id`: Classification ID.
- `module_id`: Module ID.

### `delete_issue`

Delete an issue from a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `move_issue`

Move an issue to another project. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`, `to_project`.

Parameters:
- `project_id`: Source project ID that currently contains the issue.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `to_project`: Target project ID where the issue should be moved.

### `clone_issue`

Clone an issue within the same project. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `get_issue_activities`

Get activities performed on an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_issue_comments`

Get all comments of an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `add_issue_comment`

Add a comment to an issue. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `issue_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `comment`: Comment text to create or update.

### `update_issue_comment`

Update a comment on an issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `issue_id`, `comment_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.
- `comment`: Comment text to create or update.

### `delete_issue_comment`

Delete a comment from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`, `comment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.

### `get_issue_description`

Retrieve the description of an issue in a project. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `get_issue_status_transition`

Retrieve the status transition history of an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `get_issue_linked_issues`

Retrieve all linked issues of an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `link_issues`

Establish a link between multiple issues. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`, `link_type`, `issue_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Source issue ID that will link to the target issues.
- `link_type`: Link type to create between the source issue and the target issues.
- `issue_ids`: Array of target issue IDs to link to the source issue.

### `bulk_link_issues`

Link multiple issues at once in a project. Use this when the returned action or record matches the identifiers and filters you already have available.

Required: `project_id`, `link_type`, `issue_ids`, `linking_issue_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `link_type`: Link type to create between the source and target issues.
- `issue_ids`: Array of source issue IDs to link from.
- `linking_issue_ids`: Array of target issue IDs to link to each source issue.

### `change_link_type`

Update the link type between two linked issues. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `issue_id`, `link_id`, `link_type`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `link_id`: Link ID.
- `link_type`: Updated link type for the existing issue link.

### `unlink_issues`

Remove the link between issues in a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`, `link_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `link_id`: Link ID to remove.

### `get_issue_associated_tasks`

Retrieve the tasks associated with an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `sindex`: Record index or cursor value used by Zoho for paging this association list.

### `associate_tasks_to_issue`

Associate tasks with a specific issue. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`, `task_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `task_ids`: Array of task IDs to associate with the issue.

### `bulk_associate_tasks`

Associate multiple tasks with multiple issues in a project. Use this when the returned action or record matches the identifiers and filters you already have available.

Required: `project_id`, `issue_ids`, `task_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_ids`: Array of issue IDs that should receive the task associations.
- `task_ids`: Array of task IDs to associate with each issue.

### `dissociate_task_from_issue`

Dissociate a task from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`, `task_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `task_id`: Task ID to remove from the issue association list.

### `get_issue_resolution`

Retrieve the resolution of an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `add_issue_resolution`

Add a resolution to an issue. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `issue_id`, `resolution`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `resolution`: Resolution content.
- `status_id`: Status ID (optional).
- `attachment_ids`: Array of attachment IDs to associate with the new resolution.

### `update_issue_resolution`

Modify the resolution of an issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `issue_id`, `resolution`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `resolution`: Updated resolution content.
- `status_id`: Status ID (optional).
- `attachment_ids`: Array of attachment IDs to associate with the updated resolution.

### `delete_issue_resolution`

Remove the resolution of an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `get_issue_followers`

Retrieve the followers of an issue in a project. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `follow_issue`

Follow an issue to receive updates or notifications. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`, `follower_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `follower_ids`: Array of user ZPUIDs to add as followers for the issue.

### `remove_issue_followers`

Remove followers from an issue in a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.

### `get_issue_attachments`

Retrieve all attachments of an issue. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `issue_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `extension_ids`: Array of extension IDs used to filter the returned attachments.
- `app_types`: Array of application types used to filter the returned attachments.
- `sub_type`: Sub type filter: comments, resolution, or bug (optional).

### `associate_issue_attachments`

Associate attachments with an issue. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `issue_id`, `attachment_ids`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `attachment_ids`: Array of attachment IDs to associate with the issue.

### `dissociate_issue_attachment`

Dissociate an attachment from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `issue_id`, `attachment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `issue_id`: Issue ID. Obtain from `list_issues` or the relevant detail tool.
- `attachment_id`: Attachment ID to dissociate.

## Phases

### `get_phases`

Retrieve all phases from the portal with optional filtering and sorting. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: none.

Parameters:
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `sort_by`: Sort order for results.
- `view_id`: ID of the custom view.
- `milestone_ids`: Comma-separated IDs of phases to retrieve.
- `filter`: Filter criteria for phases (JSON object).

### `list_phases`

List phases/milestones from a specific project with optional filtering and sorting. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools.

Required: `project_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `sort_by`: Sort order for results.
- `view_id`: ID of the custom view.
- `milestone_ids`: Comma-separated IDs of phases to retrieve.
- `filter`: Filter criteria for phases (JSON object).

### `get_phase_detail`

Retrieve detailed information about a specific phase. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.

### `create_phase`

Create a new phase/milestone in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use MM/DD/YYYY.

Required: `project_id`, `name`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `name`: Phase or milestone name to create (maximum 100 characters).
- `start_date`: Start date (MM/DD/YYYY format e.g., 12/30/2023).
- `end_date`: End date (MM/DD/YYYY format e.g., 12/31/2023).
- `owner_zpuid`: User ZPUID for the phase owner.
- `flag`: Flag type: internal or external.
- `status_id`: ID of the status.
- `tagIds`: Comma-separated tag IDs to associate with the phase.
- `next`: Phase ID that should follow this phase.
- `previous`: Phase ID that should precede this phase.
- `budget`: Budget for the phase.
- `threshold`: Threshold value for the budget.
- `hourly_budget`: Hourly budget for the phase.
- `hourly_budget_threshold`: Hourly budget threshold.
- `revenue_budget`: Revenue budget for the phase.

### `update_phase`

Update an existing phase in a project. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use MM/DD/YYYY.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `name`: Updated phase or milestone name (maximum 100 characters).
- `start_date`: Start date (MM/DD/YYYY format e.g., 12/30/2023).
- `end_date`: End date (MM/DD/YYYY format e.g., 12/31/2023).
- `owner_zpuid`: Updated user ZPUID for the phase owner.
- `flag`: Flag type: internal or external.
- `status_id`: ID of the milestone status.
- `tagIds`: Comma-separated tag IDs to associate with the phase.
- `budget`: Budget for the phase.
- `threshold`: Threshold value for the budget.
- `hourly_budget`: Hourly budget for the phase.
- `hourly_budget_threshold`: Hourly budget threshold.
- `revenue_budget`: Revenue budget for the phase.

### `delete_phase`

Remove a phase from a project permanently. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.

### `move_phase`

Move a phase to another project. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `phase_id`, `to_project`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `to_project`: Target project ID where the phase should be moved.

### `clone_phase`

Clone a phase within the same project. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.

### `get_phase_activities`

Get all activities performed on a phase. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_phase_status_transition`

Retrieve the status transition history of a phase. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.

### `get_phase_followers`

Retrieve all followers of a phase. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `phase_id`, `page`, `per_page`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `add_phase_followers`

Add followers to a phase to receive updates. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `phase_id`, `followers`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `followers`: Array of user ZPUIDs to add as followers for the phase (maximum 100).

### `remove_phase_followers`

Remove followers from a phase. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `phase_id`, `followers`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `followers`: Array of user ZPUIDs to remove as followers for the phase (maximum 100).

### `get_phase_comments`

Retrieve all comments on a phase. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `phase_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `sort_order`: Sort order: ascending or descending.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `add_phase_comment`

Add a comment to a phase. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `phase_id`, `content`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `content`: Comment content. Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.
- `notify`: Array of user IDs to notify about the new phase comment (maximum 100).
- `attachment_ids`: Array of attachment IDs to associate with the new phase comment (maximum 100).

### `update_phase_comment`

Update an existing comment on a phase. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `phase_id`, `comment_id`, `content`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.
- `content`: Updated comment content. Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.
- `notify`: Array of user IDs to notify about the updated phase comment (maximum 100).
- `attachment_ids`: Array of attachment IDs to associate with the updated phase comment (maximum 100).

### `delete_phase_comment`

Remove a comment from a phase. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `phase_id`, `comment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `phase_id`: Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.

## Search

### `search`

Search across portal or project. Use `project_id` to scope the search to one project, or omit it to search at portal level before choosing a more specific tool.

Required: `search_term`.

Parameters:
- `search_term`: Search text to match against the selected records.
- `project_id`: Project ID when you want to limit the search to a single project. Omit it for portal-level search.
- `module`: Module to search within. Allowed values: `all`, `projects`, `tasks`, `issues`, `milestones`, `forums`, `events`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

## Task Lists

### `list_tasklists`

List task lists from a project or portal. Use `project_id` to scope the task list lookup to one project, or omit it for portal-level task list listing when that behavior is supported.

Required: none.

Parameters:
- `project_id`: Project ID when you want to limit task lists to one project. Omit it for portal-level task list listing when supported.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_tasklist`

Get details of a specific task list. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.

### `create_tasklist`

Create a new task list in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `name`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `name`: Task list name to create.
- `milestone_id`: Milestone or phase ID to associate with the task list.
- `flag`: Task list visibility flag. Allowed values: `internal`, `external`.
- `status`: Task list status text accepted by Zoho.

### `update_tasklist`

Update a task list. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `name`: Updated task list name.
- `milestone_id`: Updated milestone or phase ID for the task list.
- `flag`: Updated task list visibility flag. Allowed values: `internal`, `external`.
- `status`: Updated task list status text accepted by Zoho.

### `delete_tasklist`

Delete a task list. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.

### `create_default_tasklist`

Create a default task list for a project. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `flag`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `flag`: Visibility flag for the default task list to create. Allowed values: `internal`, `external`.

### `get_tasklist_comments`

Retrieve multiple comments from a task list. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `sort_by`: Comment sort expression. Use `ASC(field_name)` or `DESC(field_name)`.

### `get_tasklist_comment`

Retrieve a specific comment from a task list. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `tasklist_id`, `comment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.

### `add_tasklist_comment`

Add a comment to a task list. Use this to create a new record or association once you already have the required parent identifiers and payload values.

Required: `project_id`, `tasklist_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `comment`: Comment text to create or update.
- `attachment_ids`: Array of attachment IDs to associate with the new task list comment (maximum 10 items).

### `update_tasklist_comment`

Modify a comment in a task list. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required.

Required: `project_id`, `tasklist_id`, `comment_id`, `comment`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.
- `comment`: Comment text to create or update.
- `attachment_ids`: Array of attachment IDs to associate with the updated task list comment (maximum 10 items).

### `delete_tasklist_comment`

Remove a comment from a task list. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `tasklist_id`, `comment_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `comment_id`: Comment ID. Obtain from the relevant list-comments tool.

### `get_tasklist_followers`

Retrieve followers for a task list. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `follow_tasklist`

Follow a task list in a project to receive updates and notifications. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.

### `unfollow_tasklist`

Unfollow a task list in a project to stop receiving updates and notifications. Use this to manage relationships, duplication, movement, or follow state between existing records.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.

### `get_tasklist_templates`

Retrieve task lists that are associated with a template in the Zoho Projects portal. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: none.

Parameters:
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_tasks_from_tasklist_template`

Retrieve tasks from a task list template. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `tasklist_id`.

Parameters:
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `make_tasklist_template`

Convert a task list into a template in a project. Use this when the returned action or record matches the identifiers and filters you already have available.

Required: `project_id`, `tasklist_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `tasklist_id`: Task list ID. Obtain from `list_tasklists` or the relevant template tool.

## Teams

### `get_team_details`

Retrieve team details from the Zoho Projects portal. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: none.

Parameters:
- `id`: Team ID to retrieve. Omit it to browse teams using the other filters.
- `search_term`: Team name text to search for.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `last_modified_time`: Filter records changed after the given date or timestamp in the format accepted by Zoho.
- `sort_by`: Sort expression for the result set, for example `desc(name)` or `asc(name)`.

### `get_projects_team`

Retrieve teams from a specific project. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `id`: Team ID to retrieve within the project. Omit it to browse teams using the other filters.
- `search_term`: Team name text to search for within the project.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `last_modified_time`: Filter records changed after the given date or timestamp in the format accepted by Zoho.
- `sort_by`: Sort expression for the result set, for example `desc(name)` or `asc(name)`.

### `get_team_users`

Retrieve users from one or more teams. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: none.

Parameters:
- `team_ids`: Team IDs expressed in the Zoho-accepted array-string format, for example `[4000000062001,4000000015029]`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `last_modified_time`: Filter records changed after the given date or timestamp in the format accepted by Zoho.

### `get_teams_projects`

Retrieve projects associated with one or more teams. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: none.

Parameters:
- `team_ids`: Team IDs expressed in the Zoho-accepted array-string format, for example `[4000000062001,4000000015029]`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `last_modified_time`: Filter records changed after the given date or timestamp in the format accepted by Zoho.

## Tags

### `list_tags`

List all tags in a portal. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools.

Required: none.

Parameters:
- `name`: Filter tags by name (optional).

### `delete_tag`

Delete a tag from the portal. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `tag_id`.

Parameters:
- `tag_id`: Tag ID. Obtain from `list_tags`.

## Users

### `list_users`

Retrieve all users, client users, contacts and resources from the Zoho Projects portal or a specific project. Supports filtering by user type, active/inactive status, sorting, and pagination. Use `project_id` to limit the result to one project, or omit it to list users across the portal.

Required: `portal_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.
- `project_id`: Project ID when you want to limit the result to one project. Omit it for portal-level users.
- `type`: User type filter.
- `view_type`: User activity-status filter.
- `sort`: Sort expression such as `alphabetical:asc` or `last_accessed_time:desc`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `ids`: Comma-separated IDs used to limit the result set to specific records.
- `company_ids`: Comma-separated company or customer IDs used to filter results.
- `view`: Response view style.

### `get_user_details`

Retrieve detailed information about a specific user from the Zoho Projects portal, including profile, role, budget rates, and status. Can be queried by ZPUID or email address. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `portal_id`, `user_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.
- `user_id`: User ZPUID or email address. Obtain ZPUID from list_users tool.

### `get_user_projects`

Retrieve all projects associated with a specific user from the Zoho Projects portal. Returns project details including status, name, and group information. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `portal_id`, `user_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.
- `user_id`: User ZPUID. Obtain from list_users or get_user_details tool.
- `status`: Project status filter to apply to the user project list.
- `search_term`: Search text to match against the selected records.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.

### `get_project_users`

Retrieve all users associated with a specific project. Supports filtering by user type (portal users, client users, contacts, resources), active/inactive status, and sorting options. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `portal_id`, `project_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.
- `project_id`: Project ID. Obtain from `list_projects`.
- `type`: User type filter for the project membership list.
- `view_type`: User activity-status filter for the project membership list.
- `sort`: Sort expression such as `last_accessed_time:desc`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `ids`: Comma-separated IDs used to limit the result set to specific records.
- `company_ids`: Comma-separated company or customer IDs used to filter results.

### `get_project_user_details`

Retrieve detailed information about a specific user within a project context. Returns user profile, role in the project, budget rates, and project-specific settings. Can be queried by ZPUID or email address. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `portal_id`, `project_id`, `user_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.
- `project_id`: Project ID. Obtain from `list_projects`.
- `user_id`: User ZPUID or email address. Obtain ZPUID from get_project_users tool.

### `get_user_license_details`

Retrieve license usage details for the Zoho Projects portal, including counts for portal users, client users, lite users, and readonly users. Shows used, remaining, and total counts for each license type. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `portal_id`.

Parameters:
- `portal_id`: Portal ID. Obtain from `list_portals`.

## Time Logs

### `list_time_logs`

List time logs for a project timesheet view. Use this to inspect project timesheet entries, optionally narrowing by date range, module, or pagination. Formats: `start_date`, `end_date` use YYYY-MM-DD.

Required: `project_id`, `view_type`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `page`: Page number for pagination (1-based; default: 1).
- `per_page`: Maximum number of records to return per page for pagination.
- `view_type`: Timesheet view type for the time log list. Allowed values: `day`, `week`, `month`, `customdate`.
- `start_date`: Start date in YYYY-MM-DD format.
- `end_date`: End date in YYYY-MM-DD format.
- `module_type`: Time log module type. Allowed values: `task`, `issue`, `general`.
- `module_id`: Task or issue ID associated with the time log; required unless module_type is general.
- `fetch_by_modified_time`: Filter by modified date instead of start date.

### `get_time_log`

Get details of a specific time log. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `log_id`, `module_type`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.
- `module_type`: Time log module type. Allowed values: `task`, `issue`, `general`.

### `create_time_log`

Create a new time log entry in a project timesheet. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `date` uses YYYY-MM-DD; `hours` may use HH:MM when required by Zoho.

Required: `project_id`, `module_type`, `date`, `bill_status`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `module_type`: Time log module type. Allowed values: `task`, `issue`, `general`.
- `module_id`: Task or issue ID associated with the time log; required unless module_type is general.
- `log_name`: Name of the time log.
- `date`: Time log date in YYYY-MM-DD format.
- `bill_status`: Billing status of the time log. Allowed values: `Billable`, `Non Billable`.
- `hours`: Logged hours value.
- `notes`: Additional notes for the time log.
- `owner_zpuid`: Owner ZPUID for the time log.
- `approver`: Approver ZPUID for the time log.
- `start_time`: Start time in the format accepted by Zoho.
- `end_time`: End time in the format accepted by Zoho.
- `status`: Approval status of the time log. Allowed values: `Approved`, `Unapproved`, `Rejected`.
- `cost_rate_per_hour`: Cost rate per hour.
- `for_timer`: Whether this time log originated from a timer.
- `cf_number`: Numeric custom field value.
- `cf_user_picklist`: User picklist custom field value.
- `cf_single_line`: Single-line custom field value.
- `cf_multi_line`: Multi-line custom field value.
- `cf_email`: Email custom field value.
- `cf_date`: Date custom field value.
- `cf_decimal`: Decimal custom field value.
- `cf_check_box`: Checkbox custom field value.
- `sprints_logid`: Zoho Sprints log ID.

### `update_time_log`

Update an existing time log entry. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `date` uses YYYY-MM-DD when provided; `hours` may use HH:MM when required by Zoho.

Required: `project_id`, `log_id`, `module_type`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.
- `module_type`: Time log module type. Allowed values: `task`, `issue`, `general`.
- `module_id`: Task or issue ID associated with the time log; required unless module_type is general.
- `log_name`: Name of the time log.
- `date`: Time log date in YYYY-MM-DD format.
- `bill_status`: Billing status of the time log. Allowed values: `Billable`, `Non Billable`.
- `hours`: Logged hours value.
- `notes`: Additional notes for the time log.
- `owner_zpuid`: Owner ZPUID for the time log.
- `approver`: Approver ZPUID for the time log.
- `start_time`: Start time in the format accepted by Zoho.
- `end_time`: End time in the format accepted by Zoho.
- `status`: Approval status of the time log. Allowed values: `Approved`, `Unapproved`, `Rejected`.
- `cost_rate_per_hour`: Cost rate per hour.
- `for_timer`: Whether this time log originated from a timer.
- `cf_number`: Numeric custom field value.
- `cf_user_picklist`: User picklist custom field value.
- `cf_single_line`: Single-line custom field value.
- `cf_multi_line`: Multi-line custom field value.
- `cf_email`: Email custom field value.
- `cf_date`: Date custom field value.
- `cf_decimal`: Decimal custom field value.
- `cf_check_box`: Checkbox custom field value.
- `sprints_logid`: Zoho Sprints log ID.
- `approval_status`: Approval status to apply to the time log. Allowed values: `Approved`, `Unapproved`, `Rejected`.
- `extra_data`: Additional time entry details.
  - `extra_data.start_time`: Updated start time for the time log entry in the format accepted by Zoho.
  - `extra_data.end_time`: Updated end time for the time log entry in the format accepted by Zoho.
  - `extra_data.notes`: Extra entry notes.
- `is_draft`: Whether to save the updated time log as a draft. Allowed values: `true`, `false`.

### `delete_time_log`

Delete a time log entry. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `project_id`, `log_id`, `module_type`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.
- `module_type`: Time log module type. Allowed values: `task`, `issue`, `general`.

## Timers

### `get_running_timers`

Retrieve running timers from the Zoho Projects portal. Use this to inspect active timers before pausing, resuming, stopping, or deleting one.

Required: none.

Parameters:
- `type`: Timer type filter. Allowed values: `all`, `generic`, `task`, `issue`.
- `for_all`: Whether to return timers for all users instead of only the current user. Allowed values: `true`, `false`.

### `start_timer`

Start a new timer. Use this to begin timing a task or issue when you already have the parent project and entity identifiers.

Required: none.

Parameters:
- `entity_id`: Task or issue ID to start timing against.
- `project_id`: Project ID. Obtain from `list_projects`.
- `module_id`: Module ID for the task or issue being timed.
- `check_existing_timers`: Whether Zoho should check for existing running timers before starting a new one. Allowed values: `true`, `false`.

### `get_timer_details_by_log_id`

Retrieve timer details for a task or issue time log. Use this when you already know the parent record or identifier and need the returned details or related records.

Required: `project_id`, `entity_type`, `log_id`.

Parameters:
- `project_id`: Project ID. Obtain from `list_projects`.
- `entity_type`: Entity path type for timer log lookup. Allowed values: `task`, `issue`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.

### `pause_timer`

Pause a running timer. Use this to pause a running timer while preserving its current work item context.

Required: `timer_id`, `type`.

Parameters:
- `timer_id`: Timer ID. Obtain from `get_running_timers` or a timer detail response.
- `notes`: Additional timer notes.
- `type`: Module type for the timer. Allowed values: `task`, `issue`, `general`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.
- `entity_id`: Task or issue ID currently associated with the timer.

### `resume_timer`

Resume a paused timer. Use this to resume a paused timer for the same work item or time log context.

Required: `timer_id`, `type`.

Parameters:
- `timer_id`: Timer ID. Obtain from `get_running_timers` or a timer detail response.
- `notes`: Additional timer notes.
- `type`: Module type for the timer. Allowed values: `task`, `issue`, `general`.
- `log_id`: Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.
- `entity_id`: Task or issue ID currently associated with the timer.

### `stop_timer`

Stop a running timer and persist the time log entry. Use this to stop a running timer and optionally provide the fields needed to save the resulting time log entry. Formats: `date` uses YYYY-MM-DD; `hours` may use HH:MM when required by Zoho.

Required: `timer_id`, `date`, `type`, `bill_status`.

Parameters:
- `timer_id`: Timer ID. Obtain from `get_running_timers` or a timer detail response.
- `item_id`: Work item ID to associate with the resulting time log.
- `log_name`: Name of the resulting time log.
- `date`: Time log date in YYYY-MM-DD format.
- `project_id`: Project ID. Obtain from `list_projects`.
- `type`: Module type for the timer. Allowed values: `task`, `issue`, `general`.
- `hours`: Logged duration value. Use the Zoho-supported hour format, such as `2:30` when applicable.
- `start_time`: Start time for the resulting time log in the format accepted by Zoho.
- `end_time`: End time for the resulting time log in the format accepted by Zoho.
- `bill_status`: Billing status of the time log. Allowed values: `Billable`, `Non Billable`.
- `notes`: Additional notes for the time log.

### `delete_timer`

Delete a timer entry. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters.

Required: `timer_id`.

Parameters:
- `timer_id`: Timer ID. Obtain from `get_running_timers` or a timer detail response.

