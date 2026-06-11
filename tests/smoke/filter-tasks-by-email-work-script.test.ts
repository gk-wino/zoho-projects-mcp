#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { getTasksByEmailDataPath } from '../../scripts/list-tasks-by-email.ts';
import {
	filterTasksByEmailWork,
	formatFilteredTasksByEmailSummary,
	getFilteredTasksByEmailDataPath,
	getFilteredTasksByEmailSummaryPath,
	parseHourValue,
	writeFilteredTasksByEmailFile,
	writeFilteredTasksByEmailSummaryFile,
} from '../../scripts/filter-tasks-by-email-work.ts';

const targetEmail = 'geoffrey.kimani@volane.com';

async function main() {
	await assert.rejects(
		() => filterTasksByEmailWork('', path.resolve('data/test.json')),
		/error|required/i,
	);

	assert.equal(
		getFilteredTasksByEmailDataPath(targetEmail),
		path.resolve('data/tasks-geoffrey-kimani-volane-com-underallocated.json'),
	);
	assert.equal(
		getFilteredTasksByEmailSummaryPath(targetEmail),
		path.resolve('data/tasks-geoffrey-kimani-volane-com-underallocated-summary.md'),
	);
	assert.equal(
		getTasksByEmailDataPath(targetEmail),
		path.resolve('data/tasks-geoffrey-kimani-volane-com.json'),
	);

	assert.equal(parseHourValue('09:30'), 9.5);
	assert.equal(parseHourValue('01:15'), 1.25);
	assert.equal(parseHourValue(' 3 '), 3);

	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filter-tasks-by-email-work-'));
	const inputPath = path.join(tempDir, 'tasks-geoffrey-kimani-volane-com.json');
	const outputPath = getFilteredTasksByEmailDataPath(targetEmail, inputPath);
	const summaryPath = getFilteredTasksByEmailSummaryPath(targetEmail, inputPath);

	const fixtureTasks = [
		{
			id: 'task-1',
			prefix: 'ALPHA-T1',
			name: 'Zero billable work',
			project: { id: 'project-alpha', name: 'Project Alpha' },
			tasklist: { id: 'tasklist-sprint-1', name: 'Sprint 1' },
			status: { name: 'Closed' },
			duration: { value: '1', type: 'days' },
			start_date: '2026-06-01T04:00:00.000Z',
			end_date: '2026-06-01T13:30:00.000Z',
			log_hours: {
				billable_hours: '00:00',
				non_billable_hours: '00:30',
				total_hours: '00:30',
			},
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-2',
			prefix: 'ALPHA-T2',
			name: 'Under duration hours',
			project: { id: 'project-alpha', name: 'Project Alpha' },
			tasklist: { id: 'tasklist-sprint-1', name: 'Sprint 1' },
			status: { name: 'In Progress' },
			duration: { value: '1', type: 'days' },
			start_date: '2026-06-02T04:00:00.000Z',
			end_date: '2026-06-02T13:30:00.000Z',
			log_hours: {
				billable_hours: '06:00',
				non_billable_hours: '01:00',
				total_hours: '07:00',
			},
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: 'someone.else@volane.com', name: 'Someone Else' },
		},
		{
			id: 'task-3',
			prefix: 'ALPHA-T3',
			name: 'Exactly compliant day task',
			project: { id: 'project-alpha', name: 'Project Alpha' },
			tasklist: { id: 'tasklist-sprint-2', name: 'Sprint 2' },
			status: { name: 'Closed' },
			duration: { value: '1', type: 'days' },
			start_date: '2026-06-03T04:00:00.000Z',
			end_date: '2026-06-03T13:30:00.000Z',
			log_hours: {
				billable_hours: '09:30',
				non_billable_hours: '00:00',
				total_hours: '09:30',
			},
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-4',
			prefix: 'BETA-T1',
			name: 'Over duration hours',
			project: { id: 'project-beta', name: 'Project Beta' },
			tasklist: { id: 'tasklist-general', name: 'General' },
			status: { name: 'Closed' },
			duration: { value: '04:00', type: 'hours' },
			start_date: '2026-06-04T04:00:00.000Z',
			end_date: '2026-06-04T08:00:00.000Z',
			log_hours: {
				billable_hours: '05:00',
				non_billable_hours: '00:15',
				total_hours: '05:15',
			},
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-5',
			prefix: 'BETA-T2',
			name: 'Open task should be excluded',
			project: { id: 'project-beta', name: 'Project Beta' },
			tasklist: { id: 'tasklist-general', name: 'General' },
			status: { name: ' Open ' },
			duration: { value: '2', type: 'days' },
			start_date: '2026-06-05T04:00:00.000Z',
			end_date: '2026-06-06T13:30:00.000Z',
			log_hours: {
				billable_hours: '00:00',
				non_billable_hours: '00:00',
				total_hours: '00:00',
			},
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-6',
			prefix: 'BETA-T3',
			name: 'Creator match with zero billable',
			project: { id: 'project-beta', name: 'Project Beta' },
			tasklist: { id: 'tasklist-general', name: 'General' },
			status: { name: 'completed' },
			duration: { value: '2', type: 'hours' },
			start_date: '2026-06-06T04:00:00.000Z',
			end_date: '2026-06-06T06:00:00.000Z',
			log_hours: {
				billable_hours: '00:00',
				non_billable_hours: '00:00',
				total_hours: '00:00',
			},
			owners_and_work: {
				owners: [{ email: 'another.owner@volane.com', name: 'Another Owner' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-7',
			prefix: 'GAMMA-T1',
			name: 'Creator match on hold should be excluded',
			project: { id: 'project-gamma', name: 'Project Gamma' },
			tasklist: { id: 'tasklist-backlog', name: 'Backlog' },
			status: { name: ' on hold ' },
			duration: { value: '1', type: 'days' },
			start_date: '2026-06-07T04:00:00.000Z',
			end_date: '2026-06-07T13:30:00.000Z',
			log_hours: {
				billable_hours: '00:00',
				non_billable_hours: '00:00',
				total_hours: '00:00',
			},
			owners_and_work: {
				owners: [{ email: 'another.owner@volane.com', name: 'Another Owner' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-8',
			prefix: 'DELTA-T1',
			name: 'Different user task',
			project: { id: 'project-delta', name: 'Project Delta' },
			tasklist: { id: 'tasklist-other', name: 'Other' },
			status: { name: 'Closed' },
			duration: { value: '1', type: 'days' },
			start_date: '2026-06-08T04:00:00.000Z',
			end_date: '2026-06-08T13:30:00.000Z',
			log_hours: {
				billable_hours: '00:00',
				non_billable_hours: '00:00',
				total_hours: '00:00',
			},
			owners_and_work: {
				owners: [{ email: 'someone.else@volane.com', name: 'Someone Else' }],
			},
			created_by: { email: 'someone.else@volane.com', name: 'Someone Else' },
		},
	];

	await fs.writeFile(inputPath, `${JSON.stringify(fixtureTasks, null, 2)}\n`, 'utf8');

	const result = await filterTasksByEmailWork(undefined, inputPath);
	const summary = formatFilteredTasksByEmailSummary({
		email: targetEmail,
		inputFilePath: inputPath,
		outputFilePath: outputPath,
		summaryFilePath: summaryPath,
		...result,
	});

	await fs.writeFile(outputPath, 'stale-json', 'utf8');
	await fs.writeFile(summaryPath, 'stale-md', 'utf8');
	await writeFilteredTasksByEmailFile(targetEmail, result.filteredTasks, inputPath);
	await writeFilteredTasksByEmailSummaryFile(
		targetEmail,
		{
			inputFilePath: inputPath,
			outputFilePath: outputPath,
			summaryFilePath: summaryPath,
			...result,
		},
		inputPath,
	);

	const filteredFileContents = await fs.readFile(outputPath, 'utf8');
	const summaryFileContents = await fs.readFile(summaryPath, 'utf8');

	assert.equal(result.allTasks.length, 8);
	assert.equal(result.matchingTasks.length, 7);
	assert.equal(result.excludedTasks.length, 2);
	assert.equal(result.eligibleTasks.length, 5);
	assert.equal(result.filteredTasks.length, 3);
	assert.equal(result.compliantTasks.length, 2);
	assert.deepEqual(
		result.filteredTasks.map((task) => task.id),
		['task-1', 'task-2', 'task-6'],
	);
	assert.deepEqual(
		result.compliantTasks.map((task) => task.id),
		['task-3', 'task-4'],
	);
	assert.deepEqual(JSON.parse(filteredFileContents), result.filteredTasks);
	assert.equal(summaryFileContents, summary);
	assert.match(summary, /Initial Task Count\s*\|\s*8/);
	assert.match(summary, /Validated Email-Matching Task Count\s*\|\s*7/);
	assert.match(summary, /Excluded Status Count \(Open\/On Hold\)\s*\|\s*2/);
	assert.match(summary, /Eligible Task Count\s*\|\s*5/);
	assert.match(summary, /Filtered Task Count\s*\|\s*3/);
	assert.match(summary, /Tasks With Zero Billable Hours Logged\s*\|\s*2/);
	assert.match(summary, /Underallocated Tasks With Some Billable Hours\s*\|\s*1/);
	assert.match(summary, /Compliant Tasks \(Tasks With Relevant Logged Hours\)\s*\|\s*2/);
	assert.match(summary, /### Project: Project Alpha \(project-alpha\)/);
	assert.match(summary, /#### Task List: Sprint 1 \(tasklist-sprint-1\)/);
	assert.match(summary, /### Project: Project Beta \(project-beta\)/);
	assert.match(summary, /\| Prefix \| Task Name \| Status \| Duration \| Start Date \| End Date \| Billable Hours Logged \| Non Billable Hours Logged \|/);
	assert.match(summary, /\| ALPHA-T1 \| Zero billable work \| Closed \| 1 days \(9\.50h\) \| 2026-06-01 \| 2026-06-01 \| 00:00 \| 00:30 \|/);
	assert.match(summary, /\| ALPHA-T2 \| Under duration hours \| In Progress \| 1 days \(9\.50h\) \| 2026-06-02 \| 2026-06-02 \| 06:00 \| 01:00 \|/);
	assert.match(summary, /\| BETA-T3 \| Creator match with zero billable \| completed \| 2 hours \(2\.00h\) \| 2026-06-06 \| 2026-06-06 \| 00:00 \| 00:00 \|/);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
