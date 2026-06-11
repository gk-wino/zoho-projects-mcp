#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { loadEnv } from './utils.js';
import {
	formatTasksByEmailSummary,
	getTasksByEmailDataPath,
	listAllTasksByEmail,
	taskMatchesEmail,
	writeTasksByEmailFile,
} from '../../scripts/list-tasks-by-email.ts';

const targetEmail = 'geoffrey.kimani@volane.com';

async function main() {
	loadEnv();

	await assert.rejects(
		() => listAllTasksByEmail(''),
		/error|required/i,
	);

	const defaultResult = await listAllTasksByEmail();
	const { projectsScanned, allTasks, matchedTasks } = await listAllTasksByEmail(targetEmail);
	const output = formatTasksByEmailSummary(targetEmail, projectsScanned, allTasks, matchedTasks);
	const dataPath = getTasksByEmailDataPath(targetEmail);

	await fs.mkdir(path.dirname(dataPath), { recursive: true });
	await fs.writeFile(dataPath, 'stale-data', 'utf8');
	await writeTasksByEmailFile(targetEmail, matchedTasks);
	const fileContents = await fs.readFile(dataPath, 'utf8');

	assert.ok(defaultResult.projectsScanned > 0);
	assert.ok(Array.isArray(allTasks));
	assert.ok(Array.isArray(matchedTasks));
	assert.ok(projectsScanned > 0);
	assert.ok(allTasks.length >= matchedTasks.length);
	assert.match(output, /Target email:\s*geoffrey\.kimani@volane\.com/i);
	assert.match(output, /Projects scanned:\s*\d+/);
	assert.match(output, /Total fetched tasks:\s*\d+/);
	assert.match(output, /Matched tasks:\s*\d+/);
	assert.doesNotMatch(output, /Raw JSON:/);
	assert.deepEqual(JSON.parse(fileContents), matchedTasks);

	for (const task of matchedTasks) {
		assert.equal(taskMatchesEmail(task, targetEmail), true);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
