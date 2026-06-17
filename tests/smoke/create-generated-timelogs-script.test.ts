#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	buildBulkCreateTimeLogPayload,
	buildGeneratedTimeLogNotes,
	executeGeneratedTimeLogs,
	findMatchingTimeLog,
	flattenTimeLogs,
	formatTimelogNoteDate,
	formatZohoTime,
	getConfiguredGeneratedTimeLogForceAllowOverlap,
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

type MockResponseInit = {
	status: number;
	body?: unknown;
	statusText?: string;
};

function buildFetchResponse(init: MockResponseInit): Response {
	return new Response(init.body === undefined ? undefined : JSON.stringify(init.body), {
		status: init.status,
		statusText: init.statusText,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

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
	const originalForceAllowOverlap = process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP;
	const originalAccessToken = process.env.ZOHO_ACCESS_TOKEN;
	const originalPortalId = process.env.ZOHO_PORTAL_ID;
	const originalRefreshToken = process.env.ZOHO_REFRESH_TOKEN;
	const originalClientId = process.env.ZOHO_CLIENT_ID;
	const originalClientSecret = process.env.ZOHO_CLIENT_SECRET;
	const originalAccountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN;
	const originalFetch = globalThis.fetch;

	try {
		delete process.env.TARGET_EMAIL;
		delete process.env.TARGET_TIMELOG_COUNT;
		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = '';
		process.env.ZOHO_ACCESS_TOKEN = 'test-access-token';
		process.env.ZOHO_PORTAL_ID = 'test-portal-id';
		process.env.ZOHO_REFRESH_TOKEN = 'test-refresh-token';
		process.env.ZOHO_CLIENT_ID = 'test-client-id';
		process.env.ZOHO_CLIENT_SECRET = 'test-client-secret';
		process.env.ZOHO_ACCOUNTS_DOMAIN = 'https://accounts.zoho.com';

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
		assert.equal(getConfiguredGeneratedTimeLogForceAllowOverlap(), false);
		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = 'true';
		assert.equal(getConfiguredGeneratedTimeLogForceAllowOverlap(), true);
		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = '0';
		assert.equal(getConfiguredGeneratedTimeLogForceAllowOverlap(), false);
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

		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = 'true';
		const payload = buildBulkCreateTimeLogPayload({
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
			'force_allow',
			'hours',
			'item_id',
			'log_name',
			'notes',
			'project_id',
			'start_time',
			'type',
		]);
		assert.equal(payload.type, 'task');
		assert.equal(payload.item_id, 'task-1');
		assert.equal(payload.start_time, '08:30 AM');
		assert.equal(payload.end_time, '05:00 PM');
		assert.equal('status' in payload, false);
		assert.deepEqual(payload.force_allow, { overlap: true });
		assert.equal(
			payload.notes,
			'Time log details: Start Time - 01/06/2026 08:30 AM End time 01/06/2026 05:00 PM Time spent - 08:30',
		);
		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = 'false';
		const generalPayload = buildBulkCreateTimeLogPayload({
			project_id: 'project-general',
			module_type: 'general',
			task_prefix: 'GENERAL-T1',
			log_name: 'Generated timelog GENERAL-T1 - Demo - 1',
			date: '2026-06-01',
			bill_status: 'Billable',
			hours: '08:30',
			start_time: '08:30',
			end_time: '17:00',
			status: 'Approved',
			used_created_at_date: false,
		});
		assert.equal(generalPayload.type, 'general');
		assert.equal('item_id' in generalPayload, false);
		assert.equal('force_allow' in generalPayload, false);

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
						{
							id: 'task-start-date-sub',
							project: { id: 'project-start-date', name: 'Project Start Date' },
							parental_info: {
								parent_task_id: 'task-start-date',
								root_task_id: 'task-start-date',
							},
							association_info: {
								has_parents: true,
							},
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
					{
						project_id: 'project-start-date',
						module_type: 'task',
						module_id: 'task-start-date-sub',
						task_prefix: 'START-T2',
						log_name: 'Should be skipped as subtask',
						date: '2026-06-16',
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
		const startDateFetchCalls: Array<{ url: string; init?: RequestInit }> = [];
		globalThis.fetch = async (input, init) => {
			startDateFetchCalls.push({
				url: typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url,
				init,
			});

			if (
				typeof input === 'string' &&
				input === 'https://projectsapi.zoho.com/api/v3/portal/test-portal-id/addbulktimelogs'
			) {
				return buildFetchResponse({
					status: 200,
					body: {
						time_logs: [
							{
								log_details: [{ id: 'created-start-date-1', log_name: 'Uses task start date' }],
							},
						],
					},
				});
			}

			throw new Error(`Unexpected fetch request: ${String(input)}`);
		};
			const startDateResult = await executeGeneratedTimeLogs(undefined, {
				inputFilePath: startDateInputPath,
				tasksFilePath: startDateTasksPath,
				targetCount: 2,
				requestDelayMs: 5,
				sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						startDateCalls.push({ name, arguments: args });

						if (name === 'list_time_logs') {
							const isRefreshList =
								args.project_id === 'project-start-date' &&
								args.module_type === 'task' &&
								args.module_id === 'task-start-date' &&
								args.start_date === '2026-05-20' &&
								args.end_date === '2026-05-20';
							if (isRefreshList && startDateCalls.filter((call) => call.name === 'list_time_logs').length > 1) {
								return buildListResponse([{ id: 'created-start-date-1', log_name: 'Uses task start date' }]);
							}
							return buildListResponse([]);
						}

						throw new Error(`Unexpected tool call: ${name}`);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

			assert.equal(startDateResult.eligibleBeforeRun, 1);
			assert.equal(startDateResult.skippedResolved, 1);
			assert.equal(startDateResult.processedCount, 1);
			assert.equal(startDateResult.createdCount, 1);
			assert.equal(startDateFetchCalls.length, 1);
			const startDateListCall = startDateCalls.find((call) => call.name === 'list_time_logs');
			assert.equal(startDateListCall?.arguments.start_date, '2026-05-20');
			assert.equal(startDateListCall?.arguments.end_date, '2026-05-20');
			const startDateFetchInit = startDateFetchCalls[0]?.init;
			assert.equal(startDateFetchInit?.method, 'POST');
			assert.match(String(startDateFetchInit?.body), /log_object=/);
			const startDateLogObjects = JSON.parse(
				new URLSearchParams(String(startDateFetchInit?.body)).get('log_object') || '[]',
			) as Array<Record<string, unknown>>;
			assert.equal(startDateLogObjects.length, 1);
			assert.equal(startDateLogObjects[0]?.log_name, 'Uses task start date');
			assert.equal(startDateLogObjects[0]?.type, 'task');
			assert.equal(startDateLogObjects[0]?.date, '2026-05-20');
			assert.equal(
				startDateLogObjects[0]?.notes,
				'Time log details: Start Time - 20/05/2026 08:30 AM End time 20/05/2026 05:00 PM Time spent - 08:30',
			);
			assert.equal(
				buildGeneratedTimeLogNotes({
					date: '2026-05-20',
					start_time: '08:30',
					end_time: '17:00',
					hours: '08:30',
				}),
			'Time log details: Start Time - 20/05/2026 08:30 AM End time 20/05/2026 05:00 PM Time spent - 08:30',
		);
			const startDateWritten = JSON.parse(await fs.readFile(startDateInputPath, 'utf8'));
			assert.equal(startDateWritten[0].date, '2026-05-20');
			assert.equal(startDateWritten[0].id, 'created-start-date-1');
			assert.equal(startDateWritten[0].status, 'completed');
			assert.equal(startDateWritten[1].date, '2026-06-16');
			assert.equal(startDateWritten[1].id, undefined);
			assert.equal(startDateWritten[1].status, 'Approved');

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

		const remoteCappedInputPath = path.join(tempDir, 'remote-capped-generated-timelogs.json');
		await fs.writeFile(
			remoteCappedInputPath,
			`${JSON.stringify(
				[
					{
						project_id: 'project-remote-cap',
						module_type: 'task',
						module_id: 'task-remote-cap',
						task_prefix: 'REMOTE-T1',
						log_name: 'Would exceed because of remote logs',
						date: '2026-06-07',
						bill_status: 'Billable',
						hours: '06:00',
						start_time: '09:00',
						end_time: '15:00',
						status: 'Approved',
						used_created_at_date: false,
					},
				],
				null,
				2,
			)}\n`,
			'utf8',
		);

		const remoteCappedCalls: ToolCall[] = [];
		globalThis.fetch = async () => {
			throw new Error('Fetch should not be called when remote logs already exhaust capacity');
		};
		const remoteCappedResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: remoteCappedInputPath,
			targetCount: 0,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
				client: {
					callTool: async ({ name, arguments: args }) => {
						remoteCappedCalls.push({ name, arguments: args });

						if (name !== 'list_time_logs') {
							throw new Error(`Unexpected tool call: ${name}`);
						}

						return buildListResponse([
							{
								id: 'remote-existing-1',
								log_name: 'Existing remote hours',
								date: '2026-06-07',
								log_hour: '19:00',
							},
						]);
					},
					close: async () => {},
				},
				close: async () => {},
			}),
		});

		assert.equal(remoteCappedResult.processedCount, 1);
		assert.equal(remoteCappedResult.createdCount, 0);
		assert.equal(remoteCappedResult.errorCount, 1);
		assert.equal(
			remoteCappedCalls.filter((call) => call.name === 'list_time_logs').length,
			1,
		);
		const remoteCappedWritten = JSON.parse(await fs.readFile(remoteCappedInputPath, 'utf8'));
		assert.equal(remoteCappedWritten[0].status, 'error');
		assert.match(remoteCappedWritten[0].error, /remaining/i);
		assert.match(remoteCappedWritten[0].error, /05:00/);

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
		const fullFetchCalls: Array<{ url: string; init?: RequestInit }> = [];
		let bulkAttemptCount = 0;
		const alphaPageOneLogs = [
			...createFilledLogs(199, 'alpha-page-one'),
			{ id: 'existing-alpha-match', log_name: 'Matched draft' },
		];
		process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = 'true';
		globalThis.fetch = async (input, init) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
			fullFetchCalls.push({ url, init });

			if (url === 'https://accounts.zoho.com/oauth/v2/token') {
				return buildFetchResponse({
					status: 200,
					body: {
						access_token: 'refreshed-access-token',
						expires_in: 3600,
					},
				});
			}

			if (url === 'https://projectsapi.zoho.com/api/v3/portal/test-portal-id/addbulktimelogs') {
				const logObjects = JSON.parse(
					new URLSearchParams(String(init?.body)).get('log_object') || '[]',
				) as Array<Record<string, unknown>>;
				const logNames = logObjects.map((entry) => String(entry.log_name || ''));

				if (
					logNames.includes('Create success') &&
					logNames.includes('Create failure') &&
					logNames.includes('Retry success')
				) {
					bulkAttemptCount += 1;
					if (bulkAttemptCount === 1) {
						return buildFetchResponse({
							status: 401,
							body: { message: 'token expired' },
							statusText: 'Unauthorized',
						});
					}

					return buildFetchResponse({
						status: 500,
						body: { message: 'bulk retry failed' },
						statusText: 'Internal Server Error',
					});
				}

				if (logNames.includes('Create success')) {
					return buildFetchResponse({
						status: 200,
						body: {
							time_logs: [{ log_details: [{ id: 'created-alpha-1', log_name: 'Create success' }] }],
						},
					});
				}

				if (logNames.includes('Create failure')) {
					return buildFetchResponse({
						status: 500,
						body: { message: 'Zoho create failed' },
						statusText: 'Internal Server Error',
					});
				}

				if (logNames.includes('Retry success')) {
					return buildFetchResponse({
						status: 200,
						body: {
							time_logs: [{ log_details: [{ id: 'created-gamma-1', log_name: 'Retry success' }] }],
						},
					});
				}
			}

			throw new Error(`Unexpected fetch request: ${url}`);
		};

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
									if (fullCalls.filter((call) => call.name === 'list_time_logs' && call.arguments.project_id === 'project-alpha').length > 2) {
										return buildListResponse([
											...alphaPageOneLogs,
											{ id: 'created-alpha-1', log_name: 'Create success' },
										]);
									}
									return buildListResponse(alphaPageOneLogs);
								case 'project-alpha::task::task-alpha::2':
									return buildListResponse([{ id: 'alpha-page-two', log_name: 'Alpha page two log' }]);
								case 'project-beta::general::::1':
									if (fullCalls.filter((call) => call.name === 'list_time_logs' && call.arguments.project_id === 'project-beta').length > 1) {
										return buildListResponse([]);
									}
									return buildListResponse([]);
								case 'project-gamma::task::task-gamma::1':
									if (fullCalls.filter((call) => call.name === 'list_time_logs' && call.arguments.project_id === 'project-gamma').length > 1) {
										return buildListResponse([{ id: 'created-gamma-1', log_name: 'Retry success' }]);
									}
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
			fullCalls.filter((call) => call.name === 'list_time_logs').length >= 4,
			true,
		);
		assert.equal(
			fullCalls.filter((call) => call.name === 'create_time_log').length,
			0,
		);
		assert.equal(fullFetchCalls.length >= 5, true);
		assert.equal(
			fullFetchCalls.filter((call) => call.url.endsWith('/addbulktimelogs')).length >= 4,
			true,
		);
		assert.equal(sleepCalls.length >= 6, true);

		const alphaListCalls = fullCalls.filter(
			(call) =>
				call.name === 'list_time_logs' &&
				call.arguments.project_id === 'project-alpha' &&
				call.arguments.module_type === 'task' &&
				call.arguments.module_id === 'task-alpha',
		);
		assert.deepEqual(
			alphaListCalls.map((call) => call.arguments.page),
			[1, 2, 1, 2],
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

		const bulkCreateCall = fullFetchCalls.find((call) => {
			if (!call.url.endsWith('/addbulktimelogs')) {
				return false;
			}

			const logObjects = JSON.parse(
				new URLSearchParams(String(call.init?.body)).get('log_object') || '[]',
			) as Array<Record<string, unknown>>;
			return logObjects.some((entry) => entry.log_name === 'Create success');
		});
		assert.ok(bulkCreateCall);
		const bulkCreateLogObjects = JSON.parse(
			new URLSearchParams(String(bulkCreateCall?.init?.body)).get('log_object') || '[]',
		) as Array<Record<string, unknown>>;
		const createSuccessEntry = bulkCreateLogObjects.find((entry) => entry.log_name === 'Create success');
		assert.deepEqual(createSuccessEntry?.force_allow, { overlap: true });
		assert.equal(
			createSuccessEntry?.notes,
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

		const chunkedInputPath = path.join(tempDir, 'chunked-generated-timelogs.json');
		const chunkedDrafts = Array.from({ length: 101 }, (_, index) => ({
			project_id: 'project-chunk',
			module_type: 'task',
			module_id: `task-chunk-${index + 1}`,
			task_prefix: `CHUNK-T${index + 1}`,
			log_name: `Chunked draft ${index + 1}`,
			date: '2026-06-10',
			bill_status: 'Billable',
			hours: '01:00',
			start_time: '08:00',
			end_time: '09:00',
			status: 'Approved',
			used_created_at_date: false,
		}));
		await fs.writeFile(chunkedInputPath, `${JSON.stringify(chunkedDrafts, null, 2)}\n`, 'utf8');
		const chunkedCalls: ToolCall[] = [];
		const chunkedFetchBodies: string[] = [];
		const chunkedListCounts = new Map<string, number>();
		globalThis.fetch = async (input, init) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
			if (url.endsWith('/addbulktimelogs')) {
				const logObjects = JSON.parse(
					new URLSearchParams(String(init?.body)).get('log_object') || '[]',
				) as Array<Record<string, unknown>>;
				const body = JSON.stringify(logObjects);
				chunkedFetchBodies.push(body);
				const match = body.match(/Chunked draft (\d+)/);
				const startIndex = match ? Number(match[1]) : 1;
				const count = logObjects.length;
				const logs = Array.from({ length: count }, (_, offset) => ({
					id: `chunked-created-${startIndex + offset}`,
					log_name: `Chunked draft ${startIndex + offset}`,
				}));
				return buildFetchResponse({
					status: 200,
					body: {
						time_logs: [{ log_details: logs }],
					},
				});
			}

			throw new Error(`Unexpected fetch request: ${url}`);
		};
		const chunkedResult = await executeGeneratedTimeLogs(undefined, {
			inputFilePath: chunkedInputPath,
			targetCount: 0,
			requestDelayMs: 5,
			sleepFn: async () => {},
			clientFactory: async () => ({
					client: {
						callTool: async ({ name, arguments: args }) => {
							chunkedCalls.push({ name, arguments: args });
							if (name === 'list_time_logs') {
								const scopeKey = `${String(args.project_id)}::${String(args.module_id || '')}`;
								const currentCount = (chunkedListCounts.get(scopeKey) || 0) + 1;
								chunkedListCounts.set(scopeKey, currentCount);
								if (currentCount === 1) {
									return buildListResponse([]);
								}

								const draftIndexMatch = String(args.module_id || '').match(/task-chunk-(\d+)/);
								const draftIndex = draftIndexMatch ? Number(draftIndexMatch[1]) : 1;
								return buildListResponse([
									{
										id: `chunked-created-${draftIndex}`,
										log_name: `Chunked draft ${draftIndex}`,
									},
								]);
							}
							throw new Error(`Unexpected tool call: ${name}`);
						},
					close: async () => {},
				},
				close: async () => {},
			}),
		});
		assert.equal(chunkedResult.createdCount, 101);
		assert.equal(chunkedFetchBodies.length, 2);
		assert.equal((chunkedFetchBodies[0].match(/Chunked draft/g) || []).length, 100);
		assert.equal((chunkedFetchBodies[1].match(/Chunked draft/g) || []).length, 1);
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

		if (originalForceAllowOverlap === undefined) {
			delete process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP;
		} else {
			process.env.GENERATED_TIMELOG_FORCE_ALLOW_OVERLAP = originalForceAllowOverlap;
		}

		if (originalAccessToken === undefined) {
			delete process.env.ZOHO_ACCESS_TOKEN;
		} else {
			process.env.ZOHO_ACCESS_TOKEN = originalAccessToken;
		}

		if (originalPortalId === undefined) {
			delete process.env.ZOHO_PORTAL_ID;
		} else {
			process.env.ZOHO_PORTAL_ID = originalPortalId;
		}

		if (originalRefreshToken === undefined) {
			delete process.env.ZOHO_REFRESH_TOKEN;
		} else {
			process.env.ZOHO_REFRESH_TOKEN = originalRefreshToken;
		}

		if (originalClientId === undefined) {
			delete process.env.ZOHO_CLIENT_ID;
		} else {
			process.env.ZOHO_CLIENT_ID = originalClientId;
		}

		if (originalClientSecret === undefined) {
			delete process.env.ZOHO_CLIENT_SECRET;
		} else {
			process.env.ZOHO_CLIENT_SECRET = originalClientSecret;
		}

		if (originalAccountsDomain === undefined) {
			delete process.env.ZOHO_ACCOUNTS_DOMAIN;
		} else {
			process.env.ZOHO_ACCOUNTS_DOMAIN = originalAccountsDomain;
		}

		globalThis.fetch = originalFetch;
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
