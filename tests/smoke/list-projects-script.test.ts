#!/usr/bin/env node

import assert from 'node:assert/strict';
import { loadEnv } from './utils.js';
import { formatProjectsReport, listAllProjects } from '../../scripts/list-projects.ts';

async function main() {
	loadEnv();
	const projects = await listAllProjects();
	const output = formatProjectsReport(projects);

	assert.ok(Array.isArray(projects));
	assert.match(output, /Total projects:\s*\d+/);
	assert.match(output, /Raw JSON:/);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
