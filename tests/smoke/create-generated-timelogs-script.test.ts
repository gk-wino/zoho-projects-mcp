#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	buildCreateTimeLogPayload,
	buildGeneratedTimeLogNotes,
	executeGeneratedTimeLogs,
	findMatchingTimeLog,
	flattenTimeLogs,
	formatTimelogNoteDate,
	formatZohoTime,
	getGeneratedTimeLogsInputPath,
	isEligibleGeneratedTimeLogDraft,
	parseTargetTimeLogCount,
	resolveTargetEmail,
} from '../../scripts/create-generated-timelogs.ts';

const targetEmail = 'geoffrey.kimani@volane.com';

type ToolCall = {
	name: string;
	arguments: Record<string, unknown>;
};

function buildToolResponse(data: unknown) {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(data),
			},
		],
	};
}

function buildListResponse(logs: Array<Record<string, unknown>>) {
	return buildToolResponse({
		time_logs: logs.map((log) => ({
			log_details: [log],
		})),
	});
}

function createFilledLogs(count: number, prefix: string): Array<Record<string, unknown>> {
	return Array.from({ length: count }, (_, index) => ({
		id: `${prefix}-${index + 1}`,
		log_name: `${prefix} log ${index + 1}`,
	}));
}

async function main() {
	const originalTargetEmail = process.env.TARGET_EMAIL;
	const originalTargetTimeLogCount = process.env.TARGET_TIMELOG_COUNT;

	try {
		delete process.env.TARGET_EMAIL;
		delete process.env.TARGET_TIMELOG_COUNT;

		assert.equal(resolveTargetEmail(undefined), targetEmail);
		process.env.TARGET_EMAIL = '  GEOFFREY.KIMANI@VOLANE.COM ';
		assert.equal(resolveTargetEmail(undefined), targetEmail);
		assert.equal(
			getGeneratedTimeLogsInputPath(targetEmail),
			path.resolve('data/tasks-geoffrey-kimani-volane-com-generated-timelogs.json'),
		);
		assert.equal(parseTargetTimeLogCount(undefined), 1);
		assert.equal(parseTargetTimeLogCount('0'), 0);
		assert.equal(parseTargetTimeLogCount(5), 5);
		assert.throws(() => parseTargetTimeLogCount('-1'), /non-negative integer/i);
		assert.throws(() => parseTargetTimeLogCount('abc'), /non-negative integer/i);
		assert.equal(formatZohoTime('08:48'), '08:48 AM');
		assert.equal(formatZohoTime('17:27'), '05:27 PM');
		assert.equal(formatZohoTime('12:05'), '12:05 PM');
		assert.equal(formatTimelogNoteDate('2026-05-29'), '29/05/2026');
		assert.equal(
			buildGeneratedTimeLogNotes({
				date: '2026-05-29',
				start_time: '13:48',
				end_time: '21:41',
				hours: '07:53',
			}),
			'Time log details: Start Time - 29/05/2026 01:48 PM End time 29/05/2026 09:41 PM Time spent - 07:53',
		);

		const payload = buildCreateTimeLogPayload({
			project_id: 'project-alpha',
			module_type: 'task',
			module_id: 'task-1',
			task_prefix: 'ALPHA-T1',
			log_name: 'Generated timelog ALPHA-T1 - Demo - 1',
			date: '2026-06-01',
			bill_status: 'Billable',
			hours: '08:30',
			start_time: '08:30',
			end_time: '17:00',
			status: 'Approved',
			used_created_at_date: false,
		});
		assert.deepEqual(Object.keys(payload).sort(), [
			'bill_status',
			'date',
			'end_time',
			'hours',
			'log_name',
			'module_id',
			'module_type',
			'notes',
			'project_id',
			'start_time',
			'status',
		]);
		assert.equal(payload.start_time, '08:30 AM');
		assert.equal(payload.end_time, '05:00 PM');
		assert.equal(
			payload.notes,
			'Time log details: Start Time - 01/06/2026 08:30 AM End time 01/06/2026 05:00 PM Time spent - 08:30',
		);

		const flattenedLogs = flattenTimeLogs(
			JSON.parse(
				JSON.stringify({
					time_logs: [
						{
							log_details: [{ id: '1', log_name: 'Matched draft' }],
						},
					],
				}),
			),
		);
		assert.equal(flattenedLogs.length, 1);
		assert.equal(
			findMatchingTimeLog(
				{
					project_id: 'project-alpha',
					module_type: 'task',
					module_id: 'task-1',
					task_prefix: 'ALPHA-T1',
					log_name: 'Matched draft',
					date: '2026-06-01',
					bill_status: 'Billable',
					hours: '08:30',
					start_time: '08:30',
					end_time: '17:00',
					status: 'Approved',
					used_created_at_date: false,
				},
				flattenedLogs,
			)?.id,
			'1',
		);
		assert.equal(
			isEligibleGeneratedTimeLogDraft({
				project_id: 'project-alpha',
				module_type: 'task',
				module_id: 'task-1',
				task_prefix: 'ALPHA-T1',
				log_name: 'Eligible draft',
				date: '2026-06-01',
				bill_status: 'Billable',
				hours: '08:30',
				start_time: '08:30',
				end_time: '17:00',
				status: 'Approved',
				used_created_at_date: false,
			}),
			true,
		);
		assert.equal(
			isEligibleGeneratedTimeLogDraft({
				project_id: 'project-alpha',
				module_type: 'task',
				module_id: 'task-1',
				task_prefix: 'ALPHA-T1',
				log_name: 'Completed draft',
				date: '2026-06-01',
				bill_status: 'Billable',
				hours: '08:30',
				start_time: '08:30',
				end_time: '17:00',
				status: 'completed',
				used_created_at_date: false,
				id: 'timelog-1',
			}),
			false,
		);

		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'create-generated-timelogs-'));
		const limitedInputPath = path.join(tempDir, 'limited-generated-timelogs.json');
		await fs.writeFile(
			limitedInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-1',
						task_prefix: 'ALPHA-T0',
						log_name: 'Already completed',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'completed',
						used_created_at_date: false,
					},
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-1',
						task_prefix: 'ALPHA-TX',
						log_name: 'Already identified',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
						id: 'timelog-existing',
					},
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-1',
						task_prefix: 'ALPHA-T1',
						log_name: 'Matched draft',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
					},
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-1',
						task_prefix: 'ALPHA-T2',
						log_name: 'Should remain pending',
						date: '2026-06-02',
						bill_status: 'Billable',
						hours: '08:45',
						start_time: '08:40',
						end_time: '17:25',
						status: 'Approved',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const limitedCalls: ToolCall[] = [];
		const limitedResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: limitedInputPath,
			targetCount: 1,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						limitedCalls.push({ name, arguments: args });
						assert.equal(name, 'list_time_logs');
						assert.equal(args.project_id, 'project-alpha');
						assert.equal(args.module_type, 'task');
						assert.equal(args.module_id, 'task-1');
						return buildListResponse([{ id: 'matched-id', log_name: 'Matched draft' }]);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(limitedResult.targetCount, 1);
		assert.equal(limitedResult.totalDrafts, 4);
		assert.equal(limitedResult.eligibleBeforeRun, 2);
		assert.equal(limitedResult.skippedResolved, 2);
		assert.equal(limitedResult.processedCount, 1);
		assert.equal(limitedResult.matchedExistingCount, 1);
		assert.equal(limitedResult.createdCount, 0);
		assert.equal(limitedResult.errorCount, 0);
		assert.equal(limitedResult.remainingEligible, 1);
		assert.equal(limitedCalls.length, 1);

		const limitedWritten = JSON.parse(await fs.readFile(limitedInputPath, 'utf8'));
		assert.equal(limitedWritten[2].id, 'matched-id');
		assert.equal(limitedWritten[2].status, 'completed');
		assert.equal(limitedWritten[3].id, undefined);

		const startDateTasksPath = path.join(tempDir, 'start-date-tasks.json');
		await fs.writeFile(
			startDateTasksPath,
			`${JSON.stringify(
				[
					{
						id: 'task-start-date',
						project: { id: 'project-start-date', name: 'Project Start Date' },
						start_date: '2026-05-20T08:00:00.000Z',
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const startDateInputPath = path.join(tempDir, 'start-date-generated-timelogs.json');
		await fs.writeFile(
			startDateInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-start-date',
						module_type: 'task',
						module_id: 'task-start-date',
						task_prefix: 'START-T1',
						log_name: 'Uses task start date',
						date: '2026-06-15',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const startDateCalls: ToolCall[] = [];
		const startDateResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: startDateInputPath,
			tasksFilePath: startDateTasksPath,
			targetCount: 1,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						startDateCalls.push({ name, arguments: args });

						if (name === 'list_time_logs') {
							return buildListResponse([]);
						}

						if (name === 'create_time_log') {
							return buildToolResponse({ id: 'created-start-date-1' });
						}

						throw new Error(`Unexpected tool call: ${name}`);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(startDateResult.processedCount, 1);
		assert.equal(startDateResult.createdCount, 1);
		const startDateListCall = startDateCalls.find((call) => call.name === 'list_time_logs');
		assert.equal(startDateListCall?.arguments.start_date, '2026-05-20');
		assert.equal(startDateListCall?.arguments.end_date, '2026-05-20');
		const startDateCreateCall = startDateCalls.find((call) => call.name === 'create_time_log');
		assert.equal(startDateCreateCall?.arguments.date, '2026-05-20');
		assert.equal(
			startDateCreateCall?.arguments.notes,
			'Time log details: Start Time - 20/05/2026 08:30 AM End time 20/05/2026 05:00 PM Time spent - 08:30',
		);
		const startDateWritten = JSON.parse(await fs.readFile(startDateInputPath, 'utf8'));
		assert.equal(startDateWritten[0].date, '2026-05-20');
		assert.equal(startDateWritten[0].id, 'created-start-date-1');
		assert.equal(startDateWritten[0].status, 'completed');

		const priorityInputPath = path.join(tempDir, 'priority-generated-timelogs.json');
		await fs.writeFile(
			priorityInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-priority',
						module_type: 'task',
						module_id: 'task-priority',
						task_prefix: 'PRIORITY-T1',
						log_name: 'Retry later',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'error',
						error: 'previous failure',
						used_created_at_date: false,
					},
					{
						project_id: 'project-priority',
						module_type: 'task',
						module_id: 'task-priority',
						task_prefix: 'PRIORITY-T2',
						log_name: 'Fresh draft first',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const priorityCalls: ToolCall[] = [];
		const priorityResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: priorityInputPath,
			targetCount: 1,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						priorityCalls.push({ name, arguments: args });

						if (name === 'list_time_logs') {
							return buildListResponse([{ id: 'fresh-match-id', log_name: 'Fresh draft first' }]);
						}

						throw new Error(`Unexpected tool call: ${name}`);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(priorityResult.processedCount, 1);
		assert.equal(priorityResult.matchedExistingCount, 1);
		assert.equal(priorityResult.createdCount, 0);
		assert.equal(priorityResult.errorCount, 0);
		const priorityWritten = JSON.parse(await fs.readFile(priorityInputPath, 'utf8'));
		assert.equal(priorityWritten[0].status, 'error');
		assert.equal(priorityWritten[1].status, 'completed');
		assert.equal(priorityWritten[1].id, 'fresh-match-id');
		assert.equal(
			priorityCalls.every(
				(call) => call.name === 'list_time_logs' && call.arguments.module_id === 'task-priority',
			),
			true,
		);

		const cappedInputPath = path.join(tempDir, 'capped-generated-timelogs.json');
		await fs.writeFile(
			cappedInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-cap',
						module_type: 'task',
						module_id: 'task-cap-a',
						task_prefix: 'CAP-T0',
						log_name: 'Existing completed 1',
						date: '2026-06-05',
						bill_status: 'Billable',
						hours: '08:31',
						start_time: '08:30',
						end_time: '17:01',
						status: 'completed',
						id: 'completed-cap-1',
						used_created_at_date: false,
					},
					{
						project_id: 'project-cap',
						module_type: 'task',
						module_id: 'task-cap-b',
						task_prefix: 'CAP-T0B',
						log_name: 'Existing completed 2',
						date: '2026-06-05',
						bill_status: 'Billable',
						hours: '08:55',
						start_time: '08:30',
						end_time: '17:25',
						status: 'completed',
						id: 'completed-cap-2',
						used_created_at_date: false,
					},
					{
						project_id: 'project-cap',
						module_type: 'task',
						module_id: 'task-cap',
						task_prefix: 'CAP-T1',
						log_name: 'Would exceed daily capacity',
						date: '2026-06-05',
						bill_status: 'Billable',
						hours: '08:45',
						start_time: '08:40',
						end_time: '17:25',
						status: 'Approved',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const cappedCalls: ToolCall[] = [];
		const cappedResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: cappedInputPath,
			targetCount: 0,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						cappedCalls.push({ name, arguments: args });

						if (name !== 'list_time_logs') {
							throw new Error(`Unexpected tool call: ${name}`);
						}

						if (args.project_id !== 'project-cap') {
							throw new Error(`Unexpected project scope: ${String(args.project_id)}`);
						}

						if (args.module_type === 'task' && args.module_id === 'task-cap') {
							return buildListResponse([]);
						}

						throw new Error(`Unexpected list_time_logs arguments: ${JSON.stringify(args)}`);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(cappedResult.processedCount, 1);
		assert.equal(cappedResult.matchedExistingCount, 0);
		assert.equal(cappedResult.createdCount, 0);
		assert.equal(cappedResult.errorCount, 1);
		assert.equal(
			cappedCalls.filter((call) => call.name === 'list_time_logs').length,
			1,
		);
		assert.equal(
			cappedCalls.filter((call) => call.name === 'create_time_log').length,
			0,
		);
		const cappedWritten = JSON.parse(await fs.readFile(cappedInputPath, 'utf8'));
		assert.equal(cappedWritten[2].status, 'error');
		assert.match(cappedWritten[2].error, /remaining/i);
		assert.match(cappedWritten[2].error, /06:34/);

		const fullInputPath = path.join(tempDir, 'full-generated-timelogs.json');
		await fs.writeFile(
			fullInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-skip',
						module_type: 'task',
						module_id: 'task-skip',
						task_prefix: 'SKIP-T1',
						log_name: 'Skip completed',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'completed',
						used_created_at_date: false,
					},
					{
						project_id: 'project-skip',
						module_type: 'task',
						module_id: 'task-skip',
						task_prefix: 'SKIP-T2',
						log_name: 'Skip id',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
						id: 'timelog-skip',
					},
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-alpha',
						task_prefix: 'ALPHA-T1',
						log_name: 'Matched draft',
						date: '2026-06-01',
						bill_status: 'Billable',
						hours: '08:30',
						start_time: '08:30',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: false,
					},
					{
						project_id: 'project-alpha',
						module_type: 'task',
						module_id: 'task-alpha',
						task_prefix: 'ALPHA-T2',
						log_name: 'Create success',
						date: '2026-06-02',
						bill_status: 'Billable',
						hours: '08:45',
						start_time: '08:40',
						end_time: '17:25',
						status: 'Approved',
						used_created_at_date: false,
					},
					{
						project_id: 'project-beta',
						module_type: 'general',
						task_prefix: 'BETA-T1',
						log_name: 'Create failure',
						date: '2026-06-03',
						bill_status: 'Billable',
						hours: '08:20',
						start_time: '08:40',
						end_time: '17:00',
						status: 'Approved',
						used_created_at_date: true,
					},
					{
						project_id: 'project-gamma',
						module_type: 'task',
						module_id: 'task-gamma',
						task_prefix: 'GAMMA-T1',
						log_name: 'Retry success',
						date: '2026-06-04',
						bill_status: 'Billable',
						hours: '08:55',
						start_time: '08:50',
						end_time: '17:45',
						status: 'error',
						error: 'stale error',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		process.env.TARGET_TIMELOG_COUNT = '0';
		const fullCalls: ToolCall[] = [];
		const sleepCalls: number[] = [];
		const alphaPageOneLogs = [
			...createFilledLogs(199, 'alpha-page-one'),
			{ id: 'existing-alpha-match', log_name: 'Matched draft' },
		];

		const fullResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: fullInputPath,
			requestDelayMs: 25,
			sleepFn: async (ms) => {
				sleepCalls.push(ms);
			},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						fullCalls.push({ name, arguments: args });

						if (name === 'list_time_logs') {
							const groupKey = `${String(args.project_id)}::${String(args.module_type)}::${String(args.module_id || '')}::${String(args.page)}`;
							switch (groupKey) {
								case 'project-alpha::task::task-alpha::1':
									return buildListResponse(alphaPageOneLogs);
								case 'project-alpha::task::task-alpha::2':
									return buildListResponse([{ id: 'alpha-page-two', log_name: 'Alpha page two log' }]);
								case 'project-beta::general::::1':
									return buildListResponse([]);
								case 'project-gamma::task::task-gamma::1':
									return buildListResponse([]);
								default:
									if (
										!('module_type' in args) &&
										args.page === 1 &&
										args.start_date === args.end_date &&
										['project-alpha', 'project-beta', 'project-gamma'].includes(String(args.project_id))
									) {
										return buildListResponse([]);
									}

									throw new Error(`Unexpected list_time_logs scope: ${groupKey}`);
							}
						}

						if (name === 'create_time_log') {
							if (args.log_name === 'Create failure') {
								throw new Error('Zoho create failed');
							}

							if (args.log_name === 'Create success') {
								return buildToolResponse({ id: 'created-alpha-1' });
							}

							if (args.log_name === 'Retry success') {
								return buildToolResponse({ id: 'created-gamma-1' });
							}
						}

						throw new Error(`Unexpected tool call: ${name}`);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(fullResult.targetCount, 0);
		assert.equal(fullResult.totalDrafts, 6);
		assert.equal(fullResult.eligibleBeforeRun, 4);
		assert.equal(fullResult.skippedResolved, 2);
		assert.equal(fullResult.processedCount, 4);
		assert.equal(fullResult.matchedExistingCount, 1);
		assert.equal(fullResult.createdCount, 2);
		assert.equal(fullResult.errorCount, 1);
		assert.equal(fullResult.remainingEligible, 1);
		assert.equal(
			fullCalls.filter((call) => call.name === 'list_time_logs').length,
			4,
		);
		assert.equal(
			fullCalls.filter((call) => call.name === 'create_time_log').length,
			3,
		);
		assert.deepEqual(sleepCalls, Array(6).fill(25));

		const alphaListCalls = fullCalls.filter(
			(call) =>
				call.name === 'list_time_logs' &&
				call.arguments.project_id === 'project-alpha' &&
				call.arguments.module_type === 'task' &&
				call.arguments.module_id === 'task-alpha',
		);
		assert.deepEqual(
			alphaListCalls.map((call) => call.arguments.page),
			[1, 2],
		);
		assert.ok(
			alphaListCalls.every(
				(call) =>
					call.arguments.per_page === 200 &&
					call.arguments.view_type === 'customdate' &&
					call.arguments.start_date === '2026-06-01' &&
					call.arguments.end_date === '2026-06-02',
			),
		);

		const betaListCall = fullCalls.find(
			(call) =>
				call.name === 'list_time_logs' &&
				call.arguments.project_id === 'project-beta',
		);
		assert.equal(betaListCall?.arguments.module_type, 'general');
		assert.equal('module_id' in (betaListCall?.arguments || {}), false);

		const createSuccessCall = fullCalls.find(
			(call) => call.name === 'create_time_log' && call.arguments.log_name === 'Create success',
		);
		assert.deepEqual(Object.keys(createSuccessCall?.arguments || {}).sort(), [
			'bill_status',
			'date',
			'end_time',
			'hours',
			'log_name',
			'module_id',
			'module_type',
			'notes',
			'project_id',
			'start_time',
			'status',
		]);
		assert.equal(createSuccessCall?.arguments.task_prefix, undefined);
		assert.equal(createSuccessCall?.arguments.used_created_at_date, undefined);
		assert.equal(createSuccessCall?.arguments.error, undefined);
		assert.equal(
			createSuccessCall?.arguments.notes,
			'Time log details: Start Time - 02/06/2026 08:40 AM End time 02/06/2026 05:25 PM Time spent - 08:45',
		);

		const fullWritten = JSON.parse(await fs.readFile(fullInputPath, 'utf8'));
		assert.equal(fullWritten[2].id, 'existing-alpha-match');
		assert.equal(fullWritten[2].status, 'completed');
		assert.equal(fullWritten[3].id, 'created-alpha-1');
		assert.equal(fullWritten[3].status, 'completed');
		assert.equal(fullWritten[4].status, 'error');
		assert.match(fullWritten[4].error, /Zoho create failed/);
		assert.equal(fullWritten[5].id, 'created-gamma-1');
		assert.equal(fullWritten[5].status, 'completed');
		assert.equal(fullWritten[5].error, undefined);
	} finally {
		if (originalTargetEmail === undefined) {
			delete process.env.TARGET_EMAIL;
		} else {
			process.env.TARGET_EMAIL = originalTargetEmail;
		}

		if (originalTargetTimeLogCount === undefined) {
			delete process.env.TARGET_TIMELOG_COUNT;
		} else {
			process.env.TARGET_TIMELOG_COUNT = originalTargetTimeLogCount;
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
