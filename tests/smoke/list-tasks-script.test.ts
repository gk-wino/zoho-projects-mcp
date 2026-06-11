#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { loadEnv } from './utils.js';
import {
	formatTasksSummary,
	getTasksDataPath,
	listProjectTasks,
	writeTasksFile,
} from '../../scripts/list-tasks.ts';

const projectId = '1817452000005212057';

async function main() {
	loadEnv();

	await assert.rejects(
		() => listProjectTasks(''),
		/error|required/i,
	);

	const taskData = await listProjectTasks(projectId);
	const output = formatTasksSummary(projectId, taskData.tasks);
	const dataPath = getTasksDataPath(projectId);

	await fs.mkdir(path.dirname(dataPath), { recursive: true });
	await fs.writeFile(dataPath, 'stale-data', 'utf8');
	await writeTasksFile(projectId, taskData.tasks);
	const fileContents = await fs.readFile(dataPath, 'utf8');

	assert.ok(Array.isArray(taskData.tasks));
	assert.match(output, /Project ID:\s*1817452000005212057/);
	assert.match(output, /Total tasks:\s*\d+/);
	assert.doesNotMatch(output, /Raw JSON:/);
	assert.deepEqual(JSON.parse(fileContents), taskData.tasks);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
