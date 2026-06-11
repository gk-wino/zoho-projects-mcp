---
name: zoho-projects-mcp-tools
description: Fast tool-selection and parameter guide for this repository's Zoho Projects MCP server. Use when Codex needs to choose, sequence, or call Zoho Projects MCP tools for portals, projects, task lists, tasks, issues, phases, users, teams, tags, search, time logs, or timers, especially when it needs the correct required parameters, enum values, ID discovery steps, or date/time formats.
---

# Zoho Projects MCP Tools

## Overview

Use this skill to work faster and more accurately with the Zoho Projects MCP tools defined in this repository. It gives a quick routing workflow, common multi-tool sequences, and a schema-derived reference catalog with tool descriptions, required parameters, formats, and enum values.

## Quick Start

1. Identify the domain you need: portals, projects, task lists, tasks, issues, phases, users, teams, tags, search, time logs, or timers.
2. Read [tool-routing.md](references/tool-routing.md) first to pick the right tool family and the usual ID-discovery sequence.
3. Open only the relevant section in [tool-catalog.md](references/tool-catalog.md) for exact parameters, enum values, and format rules.
4. Prefer discovery tools first unless the user already supplied the needed IDs.
5. Treat `src/schemas/*.ts` as the final authority if you notice any mismatch.

## Tool Selection Workflow

- Use `list_*` or `search` tools to discover IDs and browse records.
- Use `get_*` tools after you already have the parent record ID and need details.
- Use `create_*` tools only after you know the parent scope and required payload fields.
- Use `update_*` tools when the target record already exists and only selected fields need changing.
- Use `delete_*`, `remove_*`, `unlink_*`, or `dissociate_*` tools only when removal is intended.
- Use association tools such as `associate_*`, `link_*`, `follow_*`, and `move_*` only after both sides of the relationship are known.

## Common Sequences

- Portal/user work:
  Start with `list_portals`, then use `list_users`, `get_user_details`, `get_project_users`, or `get_user_license_details`.
- Project work:
  Use `list_projects` to discover `project_id`, then `get_project`, `create_project`, `update_project`, or `trash_project`.
- Task work:
  Use `list_tasklists` and `list_tasks` first, then `get_task`, `create_task`, `update_task`, comments, or bug association tools.
- Issue work:
  Use `list_issues` first, then `get_issue`, comment tools, link tools, task association tools, resolution tools, follower tools, or attachment tools.
- Phase work:
  Use `get_phases` or `list_phases`, then `get_phase_detail`, `create_phase`, `update_phase`, follower tools, or comment tools.
- Time tracking:
  Use `list_time_logs` and `get_time_log` for timesheets. Use `get_running_timers`, `start_timer`, `pause_timer`, `resume_timer`, `stop_timer`, and `delete_timer` for live timers.

## Format Rules

- Project, issue, search range, and time-log date fields commonly use `YYYY-MM-DD`.
- Task schedule fields use ISO 8601 timestamps.
- Phase dates use `MM/DD/YYYY`.
- Duration or hour-based time entries may require `HH:MM`.
- Enum parameters must use one of the allowed values listed in the schema description or the catalog reference.

## Reference Files

- [tool-routing.md](references/tool-routing.md)
  Use this first for fast domain selection, ID discovery order, and common multi-tool flows.
- [tool-catalog.md](references/tool-catalog.md)
  Use this for exact tool descriptions, required parameters, parameter descriptions, nested object fields, enum values, and format hints.

## Fast Search Patterns

- Find a domain section:
  `rg "^## " .agents/skills/zoho-projects-mcp-tools/references/tool-catalog.md`
- Find a specific tool:
  `rg "^### \`tool_name\`" .agents/skills/zoho-projects-mcp-tools/references/tool-catalog.md`
- Find tools that touch a parameter:
  `rg "project_id|task_id|issue_id|portal_id" .agents/skills/zoho-projects-mcp-tools/references/tool-catalog.md`
