# Script Reference

This repository ships a mix of MCP-backed CLIs, file-based post-processing scripts, and smoke-test commands. This guide lists what each script does, how to run it, what it needs, and what it writes.

## Common Prerequisites

Most scripts fall into one of three buckets:

1. MCP-backed scripts that need a built server and live Zoho credentials.
2. File-based scripts that only read and write local JSON or Markdown files.
3. Refresh helpers that update the local `.env` file.

The most common environment variables are:

- `ZOHO_ACCESS_TOKEN`
- `ZOHO_PORTAL_ID`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_ACCOUNTS_DOMAIN`
- `TARGET_EMAIL`
- `TARGET_DATE`
- `EXCLUDED_DATES`
- `HOURS_PER_DAY`
- `ACCEPTABLE_SHORTFALL_HOURS`
- `IGNORED_TASK_PREFIXES`
- `GENERATED_TIMELOG_MAX_DAILY_HOURS`
- `TARGET_TIMELOG_COUNT`

## Package Scripts

| Script | Command | Purpose | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| Build | `npm run build` | Compile TypeScript into `dist/`. | None. | `dist/` JavaScript build output. |
| Dev | `npm run dev` | Watch-mode TypeScript compilation. | None. | Rebuilds `dist/` on change. |
| Start | `npm run start` | Run the compiled stdio MCP server. | Built `dist/index.js` plus required Zoho env vars. | MCP stdio server process. |
| Start HTTP | `npm run start:http` | Run the compiled HTTP/SSE MCP server. | Built `dist/http-server.js` plus HTTP and Zoho env vars. | HTTP server on `HTTP_PORT`. |
| Dev HTTP | `npm run dev:http` | Watch-mode compilation plus HTTP server restart. | Built source and HTTP env vars. | Rebuilds and serves HTTP/SSE mode. |
| Test | `npm run test` | Run the connection test. | Live Zoho credentials and portal ID. | Console test output only. |
| Setup | `npm run setup` | Run the repo setup shell script. | Shell environment. | Project setup side effects. |
| Refresh token | `npm run refresh:token -- [envFilePath]` | Refresh `ZOHO_ACCESS_TOKEN` using the stored refresh token and update the `.env` file in place. | Optional `.env` path. Requires `ZOHO_REFRESH_TOKEN`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and optionally `ZOHO_ACCOUNTS_DOMAIN`. | Updates `ZOHO_ACCESS_TOKEN` in the env file. |
| List projects | `npm run list:projects` | Fetch every project in the portal through MCP and write them to disk. | `ZOHO_ACCESS_TOKEN`, `ZOHO_PORTAL_ID`, built server. | `data/projects.json`. |
| List tasks | `npm run list:tasks -- <projectId>` | Fetch every task for a single project with pagination and write them to disk. | Required `projectId`, `ZOHO_ACCESS_TOKEN`, `ZOHO_PORTAL_ID`, built server. | `data/tasks-<projectId>.json`. |
| List tasks by email | `npm run list:tasks:email -- [targetEmail]` | Scan all projects, collect tasks owned by or created by the target email, and write the matched tasks to a JSON file. | Optional `targetEmail` argument, `TARGET_EMAIL` fallback, `ZOHO_ACCESS_TOKEN`, `ZOHO_PORTAL_ID`, built server. | `data/tasks-<email>.json`. |
| List weekdays without tasks by email | `npm run list:weekdays:email -- [targetEmail] [inputFilePath]` | Read a task export and report weekdays in the configured range that have no task coverage. | Optional `targetEmail`, optional task export path, `TARGET_DATE`, `EXCLUDED_DATES`, and a local tasks JSON export. | `data/tasks-<email>-missing-weekdays-summary.md`. |
| Filter tasks by email work | `npm run filter:tasks:email-work -- [targetEmail] [inputFilePath] [acceptableShortfallHours]` | Read a task export, exclude non-eligible tasks, calculate underallocated tasks, and generate underallocation plus timelog-planning outputs. | Optional `targetEmail`, optional task export path, optional shortfall override, `HOURS_PER_DAY`, `ACCEPTABLE_SHORTFALL_HOURS`, `IGNORED_TASK_PREFIXES`, and a local tasks JSON export. | `data/tasks-<email>-underallocated.json`, `data/tasks-<email>-underallocated-summary.md`, `data/tasks-<email>-generated-timelogs.json`, `data/tasks-<email>-generated-timelogs-summary.md`. |
| Create generated timelogs | `npm run create:generated:timelogs -- [targetEmail]` | Read generated timelog drafts, detect duplicates, create missing logs through MCP, and update the JSON file in place. | Optional `targetEmail`, optional `TARGET_EMAIL`, `TARGET_TIMELOG_COUNT`, `ZOHO_ACCESS_TOKEN`, `ZOHO_PORTAL_ID`, built server, and the generated timelog JSON file. | Updates `data/tasks-<email>-generated-timelogs.json` in place. |
| Debug timelog | `npm run debug:timelog -- [projectId] [--count N] [--task-id TASK_ID]` | Create sample timelogs for a project to help diagnose MCP time-log behavior. | Optional `projectId`, optional `--count`, optional `--task-id`, `ZOHO_ACCESS_TOKEN`, `ZOHO_PORTAL_ID`, built server. | `data/timelogs-<projectId>.json`. |

### Smoke Test Wrappers

These package scripts rebuild the project and then execute a targeted smoke test.

| Script | Command | Purpose |
| --- | --- | --- |
| Smoke default | `npm run test:smoke` | Run the default portal smoke test. |
| Smoke portal | `npm run test:smoke:portal` | Run the portal tool smoke test. |
| Smoke project | `npm run test:smoke:project` | Run the project tool smoke test. |
| Smoke task | `npm run test:smoke:task` | Run the task tool smoke test. |
| Smoke task list | `npm run test:smoke:tasklist` | Run the task list tool smoke test. |
| Smoke issue | `npm run test:smoke:issue` | Run the issue tool smoke test. |
| Smoke phase | `npm run test:smoke:phase` | Run the phase tool smoke test. |
| Smoke timer | `npm run test:smoke:timer` | Run the timer tool smoke test. |
| Smoke timelog | `npm run test:smoke:timelog` | Run the timelog tool smoke test. |
| Smoke user | `npm run test:smoke:user` | Run the user tool smoke test. |
| Smoke wysiwyg | `npm run test:smoke:wysiwyg` | Run the WYSIWYG/editor smoke test. |
| Smoke inspect task | `npm run inspect:task` | Inspect a task fixture and verify task-specific behavior. |

## Standalone Script Usage

These are the underlying TypeScript entrypoints that the npm scripts wrap.

### `scripts/list-projects.ts`

Fetches all projects through `list_projects`, paginates with `per_page = 100`, writes the raw projects list to `data/projects.json`, and prints a readable summary.

Use it when you need the full portal project list or a cached JSON snapshot of projects.

### `scripts/list-tasks.ts`

Fetches all tasks for a single project through `list_tasks`, paginates until the API returns fewer than 200 tasks, writes the result to `data/tasks-<projectId>.json`, and prints task status and owner details.

Required argument:

- `projectId`

### `scripts/list-tasks-by-email.ts`

Scans every project in the portal, fetches each project’s tasks, and keeps tasks whose owner email or creator email matches the target email.

Use it when you want a portal-wide task export filtered by person rather than by project.

Arguments:

- Optional `targetEmail`

Defaults:

- `targetEmail` falls back to `TARGET_EMAIL`, then `geoffrey.kimani@volane.com`

Output:

- `data/tasks-<email>.json`

### `scripts/list-weekdays-without-tasks-by-email.ts`

Reads a local task export and identifies weekdays that are missing task coverage between `TARGET_DATE` and the chosen as-of date.

Use it for simple capacity / coverage reports.

Arguments:

- Optional `targetEmail`
- Optional `inputFilePath`

Key env vars:

- `TARGET_DATE`
- `EXCLUDED_DATES`

Output:

- `data/tasks-<email>-missing-weekdays-summary.md`

### `scripts/filter-tasks-by-email-work.ts`

Reads the email-filtered task export, removes subtasks, excludes tasks in `Open`, `On Hold`, and `In Progress`, applies any ignored-prefix rules, and keeps only underallocated tasks.

It also generates timelog-planning artifacts for the filtered tasks.

Arguments:

- Optional `targetEmail`
- Optional `inputFilePath`
- Optional `acceptableShortfallHours`

Key env vars:

- `HOURS_PER_DAY`
- `ACCEPTABLE_SHORTFALL_HOURS`
- `IGNORED_TASK_PREFIXES`
- `GENERATED_TIMELOG_MAX_DAILY_HOURS`

Ignored-prefix syntax:

- Exact prefix: `PP3-T594`
- Wildcard: `PP3-*`
- Range: `PP3-T381 -- PP3-T381`

Whitespace inside each ignore string is stripped before matching.

Outputs:

- `data/tasks-<email>-underallocated.json`
- `data/tasks-<email>-underallocated-summary.md`
- `data/tasks-<email>-generated-timelogs.json`
- `data/tasks-<email>-generated-timelogs-summary.md`

### `scripts/create-generated-timelogs.ts`

Reads the generated timelog draft JSON, skips drafts that are already completed or already have an ID, checks for duplicate time logs within the same project and module, and creates missing logs through Zoho Projects bulk timelog requests in batches of up to 100 entries.

Arguments:

- Optional `targetEmail`

Key env vars:

- `TARGET_EMAIL`
- `TARGET_TIMELOG_COUNT`
- `GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP`
  When truthy, the script includes `force_allow.overlap=true` in each bulk log object and skips the local 24-hour/day precheck so Zoho can evaluate the overlap override itself.
- `ZOHO_ACCESS_TOKEN`
- `ZOHO_PORTAL_ID`

Output:

- Updates `data/tasks-<email>-generated-timelogs.json` in place

### `scripts/create-timelogs.ts`

Creates ad hoc timelog samples for a project, optionally linked to a task, then lists today’s logs back for verification and writes a project-specific JSON snapshot.

Arguments:

- Optional positional `projectId`
- Optional `--count N`
- Optional `--task-id TASK_ID`

Output:

- `data/timelogs-<projectId>.json`

### `scripts/refresh-token.ts`

Reads the Zoho refresh-token configuration from the env file, requests a new access token from Zoho, and writes the new `ZOHO_ACCESS_TOKEN` back into the same env file.

Arguments:

- Optional `envFilePath`

Required env file keys:

- `ZOHO_REFRESH_TOKEN`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`

Optional env file key:

- `ZOHO_ACCOUNTS_DOMAIN`

### `npm run debug:timelog` (`scripts/create-timelogs.ts`)

This is a convenience wrapper around `scripts/create-timelogs.ts`. It is useful when you want to create a small number of sample time logs and immediately inspect the resulting project-level JSON snapshot.

## Validation Commands

The repository includes per-feature smoke tests that mirror the scripts above. These are useful when you want to verify a specific workflow without running the full suite.

| Command | Purpose |
| --- | --- |
| `npx tsx tests/smoke/portal.test.ts` | Portal tool smoke test. |
| `npx tsx tests/smoke/project.test.ts` | Project tool smoke test. |
| `npx tsx tests/smoke/task.test.ts` | Task tool smoke test. |
| `npx tsx tests/smoke/tasklist.test.ts` | Task list tool smoke test. |
| `npx tsx tests/smoke/issue.test.ts` | Issue tool smoke test. |
| `npx tsx tests/smoke/phase.test.ts` | Phase tool smoke test. |
| `npx tsx tests/smoke/timer.test.ts` | Timer tool smoke test. |
| `npx tsx tests/smoke/timelog.test.ts` | Timelog tool smoke test. |
| `npx tsx tests/smoke/user.test.ts` | User tool smoke test. |
| `npx tsx tests/smoke/list-projects-script.test.ts` | `list-projects.ts` script smoke test. |
| `npx tsx tests/smoke/list-tasks-script.test.ts` | `list-tasks.ts` script smoke test. |
| `npx tsx tests/smoke/list-tasks-by-email-script.test.ts` | `list-tasks-by-email.ts` script smoke test. |
| `npx tsx tests/smoke/list-weekdays-without-tasks-by-email-script.test.ts` | Weekday-gap report smoke test. |
| `npx tsx tests/smoke/filter-tasks-by-email-work-script.test.ts` | Underallocated-task and timelog-planning smoke test. |
| `npx tsx tests/smoke/create-generated-timelogs-script.test.ts` | Generated timelog creation smoke test. |
| `npx tsx tests/smoke/refresh-token-script.test.ts` | Refresh-token helper smoke test. |

## Suggested Workflow

If you are starting from scratch:

1. Run `npm run build`.
2. Refresh the access token if needed with `npm run refresh:token`.
3. Export tasks with `npm run list:tasks:email`.
4. Generate underallocated reports with `npm run filter:tasks:email-work`.
5. Create the queued timelogs with `npm run create:generated:timelogs`.

If you only need a project snapshot:

1. Run `npm run list:projects`.
2. Run `npm run list:tasks -- <projectId>`.
3. Optionally run `npm run debug:timelog -- <projectId>`.
