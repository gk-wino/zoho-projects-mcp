#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { getTasksByEmailDataPath } from '../../scripts/list-tasks-by-email.ts';
import {
	filterTasksByEmailWork,
	formatFilteredTasksByEmailSummary,
	formatGeneratedTimeLogsSummary,
	generateTimeLogDraftsForFilteredTasks,
	generateTimeLogDraftsForTask,
	getAdditionalBillableHoursNeeded,
	getFilteredTasksByEmailDataPath,
	getFilteredTasksByEmailSummaryPath,
	getGeneratedTimeLogsDataPath,
	getGeneratedTimeLogsSummaryPath,
	parseHourValue,
	parseThresholdHours,
	writeFilteredTasksByEmailFile,
	writeFilteredTasksByEmailSummaryFile,
	writeGeneratedTimeLogsFile,
	writeGeneratedTimeLogsSummaryFile,
} from '../../scripts/filter-tasks-by-email-work.ts';

const targetEmail = 'geoffrey.kimani@volane.com';
const fixedRunDate = new Date('2026-06-15T00:00:00.000Z');

function createRandomFn(...values: number[]): () => number {
	const queue = [...values];
	return () => {
		if (queue.length === 0) {
			throw new Error('Ran out of deterministic random values');
		}

		return queue.shift()!;
	};
}

function timeToMinutes(value: string): number {
	const [hours, minutes] = value.split(':').map(Number);
	return hours * 60 + minutes;
}

async function main() {
	const originalHoursPerDay = process.env.HOURS_PER_DAY;
	const originalAcceptableShortfallHours = process.env.ACCEPTABLE_SHORTFALL_HOURS;
	const originalGeneratedMaxDailyHours = process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS;

	try {
		delete process.env.HOURS_PER_DAY;
		delete process.env.ACCEPTABLE_SHORTFALL_HOURS;
		delete process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS;

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
			getGeneratedTimeLogsDataPath(targetEmail),
			path.resolve('data/tasks-geoffrey-kimani-volane-com-generated-timelogs.json'),
		);
		assert.equal(
			getGeneratedTimeLogsSummaryPath(targetEmail),
			path.resolve('data/tasks-geoffrey-kimani-volane-com-generated-timelogs-summary.md'),
		);
		assert.equal(
			getTasksByEmailDataPath(targetEmail),
			path.resolve('data/tasks-geoffrey-kimani-volane-com.json'),
		);

		assert.equal(parseHourValue('09:30'), 9.5);
		assert.equal(parseHourValue('01:15'), 1.25);
		assert.equal(parseHourValue(' 3 '), 3);
		assert.equal(parseThresholdHours(undefined), 4);
		assert.equal(parseThresholdHours('2.5'), 2.5);

		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filter-tasks-by-email-work-'));
		const inputPath = path.join(tempDir, 'tasks-geoffrey-kimani-volane-com.json');
		const filteredOutputPath = getFilteredTasksByEmailDataPath(targetEmail, inputPath);
		const filteredSummaryPath = getFilteredTasksByEmailSummaryPath(targetEmail, inputPath);
		const generatedOutputPath = getGeneratedTimeLogsDataPath(targetEmail, inputPath);
		const generatedSummaryPath = getGeneratedTimeLogsSummaryPath(targetEmail, inputPath);

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
				created_time: '2026-05-30T09:00:00.000Z',
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
				id: 'task-8',
				prefix: 'OMEGA-T1',
				name: 'Multi day underallocated task',
				project: { id: 'project-omega', name: 'Project Omega' },
				tasklist: { id: 'tasklist-phase-1', name: 'Phase 1' },
				status: { name: 'Completed' },
				duration: { value: '3', type: 'days' },
				start_date: '2026-06-07T04:00:00.000Z',
				end_date: '2026-06-09T13:30:00.000Z',
				created_time: '2026-06-05T09:00:00.000Z',
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
				id: 'task-2',
				prefix: 'ALPHA-T2',
				name: 'Threshold acceptable hours',
				project: { id: 'project-alpha', name: 'Project Alpha' },
				tasklist: { id: 'tasklist-sprint-1', name: 'Sprint 1' },
				status: { name: 'In Progress' },
				duration: { value: '1', type: 'days' },
				start_date: '2026-06-02T04:00:00.000Z',
				end_date: '2026-06-02T13:30:00.000Z',
				created_time: '2026-05-31T09:00:00.000Z',
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
				created_time: '2026-06-01T09:00:00.000Z',
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
				name: 'Open task should be excluded',
				project: { id: 'project-beta', name: 'Project Beta' },
				tasklist: { id: 'tasklist-general', name: 'General' },
				status: { name: ' Open ' },
				duration: { value: '2', type: 'days' },
				start_date: '2026-06-04T04:00:00.000Z',
				end_date: '2026-06-05T13:30:00.000Z',
				created_time: '2026-06-02T09:00:00.000Z',
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
				id: 'task-5',
				prefix: 'BETA-T2',
				name: 'Zero duration created date fallback',
				project: { id: 'project-beta', name: 'Project Beta' },
				tasklist: { id: 'tasklist-general', name: 'General' },
				status: { name: 'Completed' },
				duration: { value: '0', type: 'days' },
				created_date: '2026-06-05',
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
				name: 'Short duration zero billable',
				project: { id: 'project-beta', name: 'Project Beta' },
				tasklist: { id: 'tasklist-general', name: 'General' },
				status: { name: 'Completed' },
				duration: { value: '2', type: 'hours' },
				start_date: '2026-06-06T04:00:00.000Z',
				end_date: '2026-06-06T06:00:00.000Z',
				created_time: '2026-06-03T09:00:00.000Z',
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
				id: 'task-7',
				prefix: 'DELTA-T1',
				name: 'Different user task',
				project: { id: 'project-delta', name: 'Project Delta' },
				tasklist: { id: 'tasklist-other', name: 'Other' },
				status: { name: 'Closed' },
				duration: { value: '1', type: 'days' },
				start_date: '2026-06-07T04:00:00.000Z',
				end_date: '2026-06-07T13:30:00.000Z',
				created_time: '2026-06-04T09:00:00.000Z',
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
			{
				id: 'task-9',
				prefix: 'OMEGA-T2',
				name: 'On hold creator match',
				project: { id: 'project-omega', name: 'Project Omega' },
				tasklist: { id: 'tasklist-phase-2', name: 'Phase 2' },
				status: { name: ' on hold ' },
				duration: { value: '1', type: 'days' },
				start_date: '2026-06-10T04:00:00.000Z',
				end_date: '2026-06-10T13:30:00.000Z',
				created_time: '2026-06-06T09:00:00.000Z',
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
		];

		await fs.writeFile(inputPath, `${JSON.stringify(fixtureTasks, null, 2)}\n`, 'utf8');

		const filterResult = await filterTasksByEmailWork(undefined, inputPath);
		assert.equal(filterResult.allTasks.length, 9);
		assert.equal(filterResult.matchingTasks.length, 8);
		assert.equal(filterResult.excludedTasks.length, 2);
		assert.equal(filterResult.eligibleTasks.length, 6);
		assert.equal(filterResult.filteredTasks.length, 4);
		assert.equal(filterResult.compliantTasks.length, 2);
		assert.deepEqual(
			filterResult.filteredTasks.map((task) => task.id),
			['task-1', 'task-5', 'task-6', 'task-8'],
		);
		const unsortedGenerationResult = generateTimeLogDraftsForFilteredTasks(
			[fixtureTasks[1], fixtureTasks[0], fixtureTasks[5]],
			{
				randomFn: createRandomFn(...Array(30).fill(1)),
				runDate: fixedRunDate,
			},
		);
		assert.deepEqual(
			unsortedGenerationResult.taskPlans.map((plan) => plan.task.id),
			['task-1', 'task-5', 'task-8'],
		);
		assert.deepEqual(
			unsortedGenerationResult.generatedTimeLogs.map((draft) => draft.module_id),
			['task-1', 'task-5', 'task-8', 'task-8', 'task-8'],
		);
		assert.deepEqual(
			filterResult.compliantTasks.map((task) => task.id),
			['task-2', 'task-3'],
		);
		assert.equal(getAdditionalBillableHoursNeeded(filterResult.filteredTasks[0]), 5.5);
		assert.equal(getAdditionalBillableHoursNeeded(filterResult.filteredTasks[1]), 0);
		assert.equal(getAdditionalBillableHoursNeeded(filterResult.filteredTasks[2]), 0);
		assert.equal(getAdditionalBillableHoursNeeded(filterResult.filteredTasks[3]), 24.5);

		const filteredSummary = formatFilteredTasksByEmailSummary({
			email: targetEmail,
			inputFilePath: inputPath,
			outputFilePath: filteredOutputPath,
			summaryFilePath: filteredSummaryPath,
			acceptableShortfallHours: 4,
			...filterResult,
		});

		const generationResult = generateTimeLogDraftsForFilteredTasks(filterResult.filteredTasks, {
			randomFn: createRandomFn(...Array(30).fill(1)),
			runDate: fixedRunDate,
		});

		assert.equal(generationResult.tasksNeedingGeneratedTimeLogs, 3);
		assert.equal(generationResult.totalGeneratedTimeLogs, 5);
		assert.equal(generationResult.zeroDurationFallbackTasks, 1);
		assert.equal(generationResult.createdTimeDatedDrafts, 1);
		assert.equal(generationResult.totalPlannedBillableHours, 45);
		assert.deepEqual(
			generationResult.taskPlans.map((plan) => plan.task.id),
			['task-1', 'task-5', 'task-8'],
		);
		assert.deepEqual(
			generationResult.generatedTimeLogs.map((draft) => draft.module_id),
			['task-1', 'task-5', 'task-8', 'task-8', 'task-8'],
		);
		assert.deepEqual(generationResult.generatedTimeLogs[0], {
			project_id: 'project-alpha',
			module_type: 'task',
			module_id: 'task-1',
			task_prefix: 'ALPHA-T1',
			log_name: 'Generated timelog ALPHA-T1 - Zero billable work - 1',
			date: '2026-06-01',
			bill_status: 'Billable',
			hours: '09:00',
			start_time: '09:00',
			end_time: '18:00',
			status: 'Approved',
			used_created_at_date: false,
		});
		assert.deepEqual(generationResult.generatedTimeLogs[1], {
			project_id: 'project-beta',
			module_type: 'task',
			module_id: 'task-5',
			task_prefix: 'BETA-T2',
			log_name: 'Generated timelog BETA-T2 - Zero duration created date fallback - 1',
			date: '2026-06-05',
			bill_status: 'Billable',
			hours: '09:00',
			start_time: '09:00',
			end_time: '18:00',
			status: 'Approved',
			used_created_at_date: true,
		});
		assert.deepEqual(
			generationResult.generatedTimeLogs.slice(2).map((draft) => ({
				date: draft.date,
				hours: draft.hours,
				start_time: draft.start_time,
				end_time: draft.end_time,
			})),
			[
				{ date: '2026-06-07', hours: '09:00', start_time: '09:00', end_time: '18:00' },
				{ date: '2026-06-07', hours: '09:00', start_time: '09:00', end_time: '18:00' },
				{ date: '2026-06-07', hours: '09:00', start_time: '09:00', end_time: '18:00' },
			],
		);
		assert.ok(
			generationResult.generatedTimeLogs.every(
				(draft) =>
					timeToMinutes(draft.end_time) >= timeToMinutes('17:00') &&
					timeToMinutes(draft.end_time) <= timeToMinutes('18:00'),
			),
		);
		assert.ok(
			generationResult.generatedTimeLogs.every(
				(draft) =>
					timeToMinutes(draft.start_time) >= timeToMinutes('08:30') &&
					timeToMinutes(draft.start_time) <= timeToMinutes('09:00'),
			),
		);
		assert.ok(
			generationResult.generatedTimeLogs.every(
				(draft) => parseHourValue(draft.hours) >= 8 && parseHourValue(draft.hours) < 18,
			),
		);

		const minimumWindowDrafts = generateTimeLogDraftsForTask(fixtureTasks[0], {
			randomFn: createRandomFn(0, 0, 0),
			runDate: fixedRunDate,
		});
		assert.deepEqual(minimumWindowDrafts[0], {
			project_id: 'project-alpha',
			module_type: 'task',
			module_id: 'task-1',
			log_name: 'Generated timelog ALPHA-T1 - Zero billable work - 1',
			date: '2026-06-01',
			bill_status: 'Billable',
			task_prefix: 'ALPHA-T1',
			hours: '08:30',
			start_time: '08:30',
			end_time: '17:00',
			status: 'Approved',
			used_created_at_date: false,
		});

		const generatedSummary = formatGeneratedTimeLogsSummary({
			email: targetEmail,
			inputFilePath: inputPath,
			outputFilePath: generatedOutputPath,
			summaryFilePath: generatedSummaryPath,
			acceptableShortfallHours: 4,
			generatedTimeLogMaxDailyHours: 9,
			filteredTasks: filterResult.filteredTasks,
			...generationResult,
		});

		await fs.writeFile(filteredOutputPath, 'stale-json', 'utf8');
		await fs.writeFile(filteredSummaryPath, 'stale-md', 'utf8');
		await fs.writeFile(generatedOutputPath, 'stale-generated-json', 'utf8');
		await fs.writeFile(generatedSummaryPath, 'stale-generated-md', 'utf8');

		await writeFilteredTasksByEmailFile(targetEmail, filterResult.filteredTasks, inputPath);
		await writeFilteredTasksByEmailSummaryFile(
			targetEmail,
			{
				inputFilePath: inputPath,
				outputFilePath: filteredOutputPath,
				summaryFilePath: filteredSummaryPath,
				acceptableShortfallHours: 4,
				...filterResult,
			},
			inputPath,
		);
		await writeGeneratedTimeLogsFile(targetEmail, generationResult.generatedTimeLogs, inputPath);
		await writeGeneratedTimeLogsSummaryFile(
			targetEmail,
			{
				inputFilePath: inputPath,
				outputFilePath: generatedOutputPath,
				summaryFilePath: generatedSummaryPath,
				acceptableShortfallHours: 4,
				generatedTimeLogMaxDailyHours: 9,
				filteredTasks: filterResult.filteredTasks,
				...generationResult,
			},
			inputPath,
		);

		assert.deepEqual(
			JSON.parse(await fs.readFile(filteredOutputPath, 'utf8')),
			filterResult.filteredTasks,
		);
		assert.equal(await fs.readFile(filteredSummaryPath, 'utf8'), filteredSummary);
		assert.deepEqual(
			JSON.parse(await fs.readFile(generatedOutputPath, 'utf8')),
			generationResult.generatedTimeLogs,
		);
		assert.equal(await fs.readFile(generatedSummaryPath, 'utf8'), generatedSummary);

		assert.match(filteredSummary, /Filtered Task Count\s*\|\s*4/);
		assert.match(filteredSummary, /### Project: Project Alpha \(project-alpha\)/);
		assert.match(filteredSummary, /### Project: Project Omega \(project-omega\)/);
		assert.match(generatedSummary, /Tasks Needing Generated Timelogs\s*\|\s*3/);
		assert.match(generatedSummary, /Total Generated Timelogs\s*\|\s*5/);
		assert.match(generatedSummary, /Total Planned Billable Hours\s*\|\s*45\.00h/);
		assert.match(generatedSummary, /Zero Duration Fallback Tasks\s*\|\s*1/);
		assert.match(generatedSummary, /Created-Time-Dated Drafts\s*\|\s*1/);
		assert.match(generatedSummary, /### Project: Project Alpha \(project-alpha\)/);
		assert.match(generatedSummary, /#### Task: ALPHA-T1 - Zero billable work \(task-1\)/);
		assert.match(generatedSummary, /#### Task: BETA-T2 - Zero duration created date fallback \(task-5\)/);
		assert.match(generatedSummary, /#### Task: OMEGA-T1 - Multi day underallocated task \(task-8\)/);
		assert.match(generatedSummary, /\| 2026-06-05 \| 09:00 \| 09:00 \| 18:00 \| true \|/);
		assert.match(generatedSummary, /\| 2026-06-01 \| 09:00 \| 09:00 \| 18:00 \| false \|/);
		assert.match(generatedSummary, /\| 2026-06-07 \| 09:00 \| 09:00 \| 18:00 \| false \|/);

		process.env.HOURS_PER_DAY = '8';
		process.env.ACCEPTABLE_SHORTFALL_HOURS = '1';
		process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS = '7.5';
		assert.equal(parseThresholdHours(undefined), 1);

		const envFilterResult = await filterTasksByEmailWork(undefined, inputPath);
		assert.equal(envFilterResult.filteredTasks.length, 5);
		assert.deepEqual(
			envFilterResult.filteredTasks.map((task) => task.id),
			['task-1', 'task-2', 'task-5', 'task-6', 'task-8'],
		);
		const envGenerationResult = generateTimeLogDraftsForFilteredTasks(envFilterResult.filteredTasks, {
			randomFn: createRandomFn(...Array(40).fill(1)),
			runDate: fixedRunDate,
		});
		assert.equal(envGenerationResult.totalGeneratedTimeLogs, 7);
		assert.ok(
			envGenerationResult.generatedTimeLogs.every(
				(draft) => parseHourValue(draft.hours) >= 8 && parseHourValue(draft.hours) <= 9.5,
			),
		);
		assert.deepEqual(
			envGenerationResult.generatedTimeLogs
				.filter((draft) => draft.module_id === 'task-8')
				.map((draft) => draft.hours),
			['09:00', '09:00', '09:00'],
		);
		assert.ok(
			envGenerationResult.generatedTimeLogs.every(
				(draft) =>
					timeToMinutes(draft.end_time) >= timeToMinutes('17:00') &&
					timeToMinutes(draft.end_time) <= timeToMinutes('18:00'),
			),
		);
		assert.ok(
			envGenerationResult.generatedTimeLogs.every(
				(draft) =>
					timeToMinutes(draft.start_time) >= timeToMinutes('08:30') &&
					timeToMinutes(draft.start_time) <= timeToMinutes('09:00'),
			),
		);

		process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS = '14';
		const fourteenHourDrafts = generateTimeLogDraftsForTask(fixtureTasks[1], {
			randomFn: createRandomFn(1, 1, 1, 1, 1, 1, 1, 1),
			runDate: fixedRunDate,
		});
		assert.equal(fourteenHourDrafts.length, 3);
		assert.ok(
			fourteenHourDrafts.every(
				(draft) =>
					parseHourValue(draft.hours) >= 8 &&
					parseHourValue(draft.hours) <= 9.5 &&
					parseHourValue(draft.hours) < 18 &&
					timeToMinutes(draft.start_time) >= timeToMinutes('08:30') &&
					timeToMinutes(draft.start_time) <= timeToMinutes('09:00') &&
					timeToMinutes(draft.end_time) >= timeToMinutes('17:00') &&
					timeToMinutes(draft.end_time) <= timeToMinutes('18:00'),
			),
		);
	} finally {
		if (originalHoursPerDay === undefined) {
			delete process.env.HOURS_PER_DAY;
		} else {
			process.env.HOURS_PER_DAY = originalHoursPerDay;
		}

		if (originalAcceptableShortfallHours === undefined) {
			delete process.env.ACCEPTABLE_SHORTFALL_HOURS;
		} else {
			process.env.ACCEPTABLE_SHORTFALL_HOURS = originalAcceptableShortfallHours;
		}

		if (originalGeneratedMaxDailyHours === undefined) {
			delete process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS;
		} else {
			process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS = originalGeneratedMaxDailyHours;
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
