# Zoho Projects MCP Tool Routing

Use this file to decide which Zoho Projects MCP tool family to load before opening the full catalog.

## ID Discovery Order

- Portal-scoped flows: start with `list_portals`, then use the returned `portal_id`.
- Project-scoped flows: start with `list_projects`, then use the returned `project_id`.
- Task list flows: start with `list_tasklists`, then use `tasklist_id`.
- Task flows: start with `list_tasks`, then use `task_id`.
- Issue flows: start with `list_issues`, then use `issue_id`.
- Phase flows: use `get_phases` or `list_phases`, then use `phase_id`.
- User flows: use `list_users` or `get_project_users`, then use `user_id` or `zpuid`.
- Time log flows: use `list_time_logs`, then use `log_id`.
- Timer flows: use `get_running_timers`, then use `timer_id`.
- Tag flows: use `list_tags`, then use `tag_id`.

## Domain Routing

### Portals And Users

- Use `list_portals` and `get_portal` for portal discovery and portal detail.
- Use `list_users`, `get_user_details`, `get_project_users`, and `get_project_user_details` for people and membership lookups.
- Use `get_user_projects` to pivot from a known user to their projects.
- Use `get_user_license_details` for license capacity and usage.

### Projects

- Use `list_projects` to browse and collect `project_id`.
- Use `get_project` for a full project record.
- Use `create_project`, `update_project`, and `trash_project` for project lifecycle changes.

### Task Lists And Tasks

- Use `list_tasklists` before creating tasks or managing task list comments and followers.
- Use `create_default_tasklist` if a project needs a default/general list before task creation.
- Use `list_tasks` before `get_task`, `update_task`, comment tools, clone/move tools, or bug association tools.
- Use task comment tools for task-level discussion.
- Use task list comment tools for task-list-level discussion.

### Issues

- Use `list_issues` before any issue mutation.
- Use `get_issue` for the primary issue record.
- Use issue comment tools for discussion.
- Use link tools when connecting issues to other issues.
- Use issue-task association tools when connecting tasks to issues.
- Use resolution, follower, and attachment tools only after the issue is known.

### Phases

- Use `get_phases` for portal-wide phase browsing.
- Use `list_phases` for project-scoped phase browsing.
- Use `get_phase_detail` before updating, cloning, moving, or deleting a phase.
- Use follower and comment tools after `phase_id` is known.

### Search, Tags, Teams

- Use `search` when you only have text and need to discover likely records quickly.
- Use `list_tags` and `delete_tag` for tag maintenance.
- Use team tools for cross-project grouping, project teams, team users, and team-project relationships.

### Time Logs And Timers

- Use `list_time_logs` and `get_time_log` for existing time entries.
- Use `create_time_log`, `update_time_log`, and `delete_time_log` for timesheet edits.
- Use `get_running_timers` before acting on timers.
- Use `start_timer` to begin live tracking.
- Use `pause_timer` and `resume_timer` for temporary interruptions.
- Use `stop_timer` to end tracking and optionally persist a final time log payload.

## Format Shortcuts

- `YYYY-MM-DD`: common for project, issue, time-log, and timer date fields.
- ISO 8601: task `start_date` and `end_date`.
- `MM/DD/YYYY`: phase dates.
- `HH:MM`: duration or hour-based time values where required.

## Enum Rule

When a parameter has allowed enum values, use exactly one of the values listed in [tool-catalog.md](tool-catalog.md). Do not invent synonyms.
