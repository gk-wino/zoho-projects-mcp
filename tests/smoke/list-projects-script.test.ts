#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { loadEnv } from './utils.js';
import {
	formatProjectsSummary,
	listAllProjects,
	projectsDataPath,
	writeProjectsFile,
} from '../../scripts/list-projects.ts';

async function main() {
	loadEnv();
	const projects = await listAllProjects();
	const output = formatProjectsSummary(projects);

	await fs.mkdir(path.dirname(projectsDataPath), { recursive: true });
	await fs.writeFile(projectsDataPath, 'stale-data', 'utf8');
	await writeProjectsFile(projects);
	const fileContents = await fs.readFile(projectsDataPath, 'utf8');

	assert.ok(Array.isArray(projects));
	assert.match(output, /Total projects:\s*\d+/);
	assert.doesNotMatch(output, /Raw JSON:/);
	assert.deepEqual(JSON.parse(fileContents), projects);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
