#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type GeneratedTimeLogDraft,
	getGeneratedTimeLogsDataPath,
} from './filter-tasks-by-email-work.ts';

type ExecutableGeneratedTimeLogDraft = GeneratedTimeLogDraft & {
	id?: number | string;
	status?: 'completed' | 'error';
	error?: string;
};

type TimeLogListEntry = Record<string, unknown> & {
	id?: number | string;
	log_name?: string;
};

type ScopedDraftGroup = {
	key: string;
	projectId: string;
	moduleType: 'task' | 'issue' | 'general';
	moduleId?: string;
	startDate: string;
	endDate: string;
};

type ToolResponse = {
	content?: Array<{
		type?: string;
		text?: string;
	}>;
};

type McpToolClient = {
	callTool(args: { name: string; arguments: Record<string, unknown> }): Promise<unknown>;
	close(): Promise<void>;
};

type McpClientConnection = {
	client: McpToolClient;
	close(): Promise<void>;
};

type ExecuteGeneratedTimeLogsOptions = {
	inputFilePath?: string;
	targetCount?: number;
	requestDelayMs?: number;
	sleepFn?: (ms: number) => Promise<void>;
	clientFactory?: () => Promise<McpClientConnection>;
};

export type ExecuteGeneratedTimeLogsResult = {
	email: string;
	inputFilePath: string;
	targetCount: number;
	requestDelayMs: number;
	totalDrafts: number;
	eligibleBeforeRun: number;
	skippedResolved: number;
	processedCount: number;
	matchedExistingCount: number;
	createdCount: number;
	errorCount: number;
	remainingEligible: number;
	drafts: ExecutableGeneratedTimeLogDraft[];
};

const DEFAULT_TARGET_EMAIL = 'geoffrey.kimani@volane.com';
const DEFAULT_TARGET_TIMELOG_COUNT = 1;
const DEFAULT_REQUEST_DELAY_MS = 1000;
const LIST_TIME_LOGS_PER_PAGE = 200;
const REQUIRED_ENV_VARS = ['ZOHO_ACCESS_TOKEN', 'ZOHO_PORTAL_ID'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(repoRoot, '.env');
const serverPath = path.resolve(repoRoot, 'dist', 'index.js');

let envLoaded = false;

function requireEmail(email: string): string {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail) {
		throw new Error('A target email is required.');
	}

	return normalizedEmail;
}

function loadOptionalEnv(): void {
	if (envLoaded) {
		return;
	}

	dotenv.config({ path: envPath });
	envLoaded = true;
}

function requireConfiguredEnv(): void {
	const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());
	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
	}
}

function ensureBuiltServer(): void {
	if (!fs.existsSync(serverPath)) {
		throw new Error(`Built MCP server not found at ${serverPath}. Run "npm run build" first.`);
	}
}

export function resolveTargetEmail(explicitEmail?: string): string {
	if (explicitEmail !== undefined) {
		return requireEmail(explicitEmail);
	}

	loadOptionalEnv();
	return requireEmail(process.env.TARGET_EMAIL || DEFAULT_TARGET_EMAIL);
}

export function parseTargetTimeLogCount(value: unknown): number {
	if (value === undefined || value === null || value === '') {
		return DEFAULT_TARGET_TIMELOG_COUNT;
	}

	const parsedValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number(value.trim())
				: Number.NaN;

	if (!Number.isInteger(parsedValue) || parsedValue < 0) {
		throw new Error('TARGET_TIMELOG_COUNT must be a non-negative integer.');
	}

	return parsedValue;
}

export function getConfiguredTargetTimeLogCount(): number {
	loadOptionalEnv();
	return parseTargetTimeLogCount(process.env.TARGET_TIMELOG_COUNT);
}

export function getGeneratedTimeLogsInputPath(email: string, inputFilePath?: string): string {
	if (inputFilePath !== undefined) {
		const trimmedPath = inputFilePath.trim();
		if (!trimmedPath) {
			throw new Error('An input file path is required when provided.');
		}

		return path.resolve(trimmedPath);
	}

	return getGeneratedTimeLogsDataPath(requireEmail(email));
}

export function hasGeneratedTimeLogId(draft: ExecutableGeneratedTimeLogDraft): boolean {
	if (draft.id === undefined || draft.id === null) {
		return false;
	}

	return String(draft.id).trim().length > 0;
}

export function isCompletedGeneratedTimeLogDraft(
	draft: ExecutableGeneratedTimeLogDraft,
): boolean {
	return draft.status === 'completed';
}

export function isEligibleGeneratedTimeLogDraft(
	draft: ExecutableGeneratedTimeLogDraft,
): boolean {
	return !isCompletedGeneratedTimeLogDraft(draft) && !hasGeneratedTimeLogId(draft);
}

export async function readGeneratedTimeLogsFile(
	inputFilePath: string,
): Promise<ExecutableGeneratedTimeLogDraft[]> {
	const data = JSON.parse(await fsp.readFile(inputFilePath, 'utf8')) as unknown;

	if (!Array.isArray(data)) {
		throw new Error('Generated timelog input file must contain a JSON array.');
	}

	return data as ExecutableGeneratedTimeLogDraft[];
}

export async function writeGeneratedTimeLogsFile(
	inputFilePath: string,
	drafts: ExecutableGeneratedTimeLogDraft[],
): Promise<void> {
	await fsp.mkdir(path.dirname(inputFilePath), { recursive: true });
	await fsp.writeFile(inputFilePath, `${JSON.stringify(drafts, null, 2)}\n`, 'utf8');
}

function normalizeString(value: unknown, fieldName: string): string {
	if (value === undefined || value === null) {
		throw new Error(`Generated timelog draft is missing ${fieldName}.`);
	}

	const normalizedValue = String(value).trim();
	if (!normalizedValue) {
		throw new Error(`Generated timelog draft is missing ${fieldName}.`);
	}

	return normalizedValue;
}

function normalizeModuleType(value: unknown): 'task' | 'issue' | 'general' {
	const moduleType = normalizeString(value, 'module_type');
	if (moduleType !== 'task' && moduleType !== 'issue' && moduleType !== 'general') {
		throw new Error(`Unsupported module_type: ${moduleType}`);
	}

	return moduleType;
}

export function formatZohoTime(value: unknown): string {
	const normalizedValue = normalizeString(value, 'time');
	const twelveHourMatch = normalizedValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
	if (twelveHourMatch) {
		return `${twelveHourMatch[1].padStart(2, '0')}:${twelveHourMatch[2]} ${twelveHourMatch[3].toUpperCase()}`;
	}

	const twentyFourHourMatch = normalizedValue.match(/^(\d{1,2}):(\d{2})$/);
	if (!twentyFourHourMatch) {
		return normalizedValue;
	}

	const hours = Number(twentyFourHourMatch[1]);
	const minutes = twentyFourHourMatch[2];
	if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
		return normalizedValue;
	}

	const period = hours >= 12 ? 'PM' : 'AM';
	const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
	return `${String(twelveHour).padStart(2, '0')}:${minutes} ${period}`;
}

export function formatTimelogNoteDate(value: unknown): string {
	const normalizedValue = normalizeString(value, 'date');
	const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) {
		return normalizedValue;
	}

	return `${match[3]}/${match[2]}/${match[1]}`;
}

export function buildGeneratedTimeLogNotes(
	draft: Pick<ExecutableGeneratedTimeLogDraft, 'date' | 'start_time' | 'end_time' | 'hours'>,
): string {
	const noteDate = formatTimelogNoteDate(draft.date);
	const startTime = formatZohoTime(draft.start_time);
	const endTime = formatZohoTime(draft.end_time);
	const hours = normalizeString(draft.hours, 'hours');

	return `Time log details: Start Time - ${noteDate} ${startTime} End time ${noteDate} ${endTime} Time spent - ${hours}`;
}

function maybeNormalizeModuleId(
	moduleType: 'task' | 'issue' | 'general',
	value: unknown,
): string | undefined {
	if (moduleType === 'general') {
		return undefined;
	}

	return normalizeString(value, 'module_id');
}

function parseToolResponse(response: unknown): unknown {
	if (
		!response ||
		typeof response !== 'object' ||
		!('content' in response) ||
		!Array.isArray((response as ToolResponse).content) ||
		(response as ToolResponse).content!.length === 0
	) {
		throw new Error('Empty response from MCP tool');
	}

	const [firstContent] = (response as ToolResponse).content!;
	if (!firstContent || firstContent.type !== 'text' || typeof firstContent.text !== 'string') {
		throw new Error('Unexpected MCP tool response content');
	}

	try {
		return JSON.parse(firstContent.text);
	} catch {
		return firstContent.text;
	}
}

export function flattenTimeLogs(data: unknown): TimeLogListEntry[] {
	if (!data || typeof data !== 'object' || !Array.isArray((data as any).time_logs)) {
		return [];
	}

	return (data as any).time_logs.flatMap((entry: any) =>
		Array.isArray(entry?.log_details) ? entry.log_details : [],
	);
}

function buildScopedDraftKey(
	projectId: string,
	moduleType: 'task' | 'issue' | 'general',
	moduleId?: string,
): string {
	return `${projectId}::${moduleType}::${moduleId || ''}`;
}

function buildScopedDraftGroups(
	drafts: ExecutableGeneratedTimeLogDraft[],
): Map<string, ScopedDraftGroup> {
	const groups = new Map<string, ScopedDraftGroup>();

	for (const draft of drafts) {
		if (!isEligibleGeneratedTimeLogDraft(draft)) {
			continue;
		}

		const projectId = normalizeString(draft.project_id, 'project_id');
		const moduleType = normalizeModuleType(draft.module_type);
		const moduleId = maybeNormalizeModuleId(moduleType, draft.module_id);
		const date = normalizeString(draft.date, 'date');
		const key = buildScopedDraftKey(projectId, moduleType, moduleId);
		const existingGroup = groups.get(key);

		if (!existingGroup) {
			groups.set(key, {
				key,
				projectId,
				moduleType,
				moduleId,
				startDate: date,
				endDate: date,
			});
			continue;
		}

		if (date < existingGroup.startDate) {
			existingGroup.startDate = date;
		}
		if (date > existingGroup.endDate) {
			existingGroup.endDate = date;
		}
	}

	return groups;
}

function extractTimeLogId(data: unknown): string | undefined {
	if (!data || typeof data !== 'object') {
		return undefined;
	}

	const directId = (data as Record<string, unknown>).id;
	if (directId !== undefined && directId !== null && String(directId).trim()) {
		return String(directId);
	}

	for (const nestedKey of ['time_log', 'log', 'data']) {
		const nestedValue = (data as Record<string, unknown>)[nestedKey];
		const nestedId = extractTimeLogId(nestedValue);
		if (nestedId) {
			return nestedId;
		}
	}

	return undefined;
}

export function findMatchingTimeLog(
	draft: ExecutableGeneratedTimeLogDraft,
	logs: TimeLogListEntry[],
): TimeLogListEntry | undefined {
	const draftLogName = normalizeString(draft.log_name, 'log_name');

	return logs.find((log) => {
		if (!log) {
			return false;
		}

		if (!extractTimeLogId(log)) {
			return false;
		}

		return String(log.log_name || '').trim() === draftLogName;
	});
}

export function buildCreateTimeLogPayload(
	draft: ExecutableGeneratedTimeLogDraft,
): Record<string, unknown> {
	const moduleType = normalizeModuleType(draft.module_type);
	const payload: Record<string, unknown> = {
		project_id: normalizeString(draft.project_id, 'project_id'),
		module_type: moduleType,
		log_name: normalizeString(draft.log_name, 'log_name'),
		date: normalizeString(draft.date, 'date'),
		bill_status: normalizeString(draft.bill_status, 'bill_status'),
		hours: normalizeString(draft.hours, 'hours'),
		start_time: formatZohoTime(draft.start_time),
		end_time: formatZohoTime(draft.end_time),
		notes: buildGeneratedTimeLogNotes(draft),
		status: normalizeString(draft.status, 'status'),
	};

	if (moduleType !== 'general') {
		payload.module_id = maybeNormalizeModuleId(moduleType, draft.module_id);
	}

	return payload;
}

async function createMcpClient(): Promise<McpClientConnection> {
	loadOptionalEnv();
	requireConfiguredEnv();
	ensureBuiltServer();

	const transport = new StdioClientTransport({
		command: 'node',
		args: [serverPath],
		env: process.env as Record<string, string>,
	});

	const client = new Client(
		{
			name: 'create-generated-timelogs-script',
			version: '1.0.0',
		},
		{
			capabilities: {},
		},
	);

	await client.connect(transport);

	return {
		client: client as unknown as McpToolClient,
		close: async () => {
			await client.close();
			await transport.close();
		},
	};
}

export async function listScopedTimeLogs(
	client: McpToolClient,
	scope: ScopedDraftGroup,
	callToolWithDelay: (
		name: string,
		args: Record<string, unknown>,
	) => Promise<unknown>,
): Promise<TimeLogListEntry[]> {
	const allLogs: TimeLogListEntry[] = [];

	for (let page = 1; ; page += 1) {
		const response = await callToolWithDelay('list_time_logs', {
			project_id: scope.projectId,
			view_type: 'customdate',
			start_date: scope.startDate,
			end_date: scope.endDate,
			page,
			per_page: LIST_TIME_LOGS_PER_PAGE,
			module_type: scope.moduleType,
			...(scope.moduleId ? { module_id: scope.moduleId } : {}),
		});
		const data = parseToolResponse(response);
		const pageLogs = flattenTimeLogs(data);
		allLogs.push(...pageLogs);

		if (pageLogs.length < LIST_TIME_LOGS_PER_PAGE) {
			break;
		}
	}

	return allLogs;
}

function setCompletedDraftState(
	draft: ExecutableGeneratedTimeLogDraft,
	id: string,
): void {
	draft.id = id;
	draft.status = 'completed';
	delete draft.error;
}

function setErroredDraftState(
	draft: ExecutableGeneratedTimeLogDraft,
	error: unknown,
): void {
	draft.status = 'error';
	draft.error = error instanceof Error ? error.message : String(error);
}

export function formatGeneratedTimeLogExecutionSummary(
	result: ExecuteGeneratedTimeLogsResult,
): string {
	return [
		`Target Email: ${result.email}`,
		`Input JSON Path: ${result.inputFilePath}`,
		`Target Timelog Count: ${result.targetCount}`,
		`Request Delay: ${result.requestDelayMs}ms`,
		`Total Drafts: ${result.totalDrafts}`,
		`Eligible Before Run: ${result.eligibleBeforeRun}`,
		`Skipped Resolved: ${result.skippedResolved}`,
		`Processed This Run: ${result.processedCount}`,
		`Matched Existing: ${result.matchedExistingCount}`,
		`Created: ${result.createdCount}`,
		`Errored: ${result.errorCount}`,
		`Remaining Eligible: ${result.remainingEligible}`,
	].join('\n');
}

export async function executeGeneratedTimeLogs(
	explicitEmail?: string,
	options: ExecuteGeneratedTimeLogsOptions = {},
): Promise<ExecuteGeneratedTimeLogsResult> {
	const email = resolveTargetEmail(explicitEmail);
	const inputFilePath = getGeneratedTimeLogsInputPath(email, options.inputFilePath);
	const targetCount = parseTargetTimeLogCount(
		options.targetCount ?? getConfiguredTargetTimeLogCount(),
	);
	const requestDelayMs = options.requestDelayMs ?? DEFAULT_REQUEST_DELAY_MS;
	const sleepFn = options.sleepFn ?? (async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
	const drafts = await readGeneratedTimeLogsFile(inputFilePath);
	const scopedGroups = buildScopedDraftGroups(drafts);
	const scopedLogCache = new Map<string, TimeLogListEntry[]>();
	const totalDrafts = drafts.length;
	const eligibleBeforeRun = drafts.filter(isEligibleGeneratedTimeLogDraft).length;
	const skippedResolved = totalDrafts - eligibleBeforeRun;
	let processedCount = 0;
	let matchedExistingCount = 0;
	let createdCount = 0;
	let errorCount = 0;
	let previousZohoCallCompleted = false;

	const connection = options.clientFactory
		? await options.clientFactory()
		: await createMcpClient();

	const callToolWithDelay = async (
		name: string,
		args: Record<string, unknown>,
	): Promise<unknown> => {
		if (previousZohoCallCompleted) {
			await sleepFn(requestDelayMs);
		}

		const response = await connection.client.callTool({
			name,
			arguments: args,
		});
		previousZohoCallCompleted = true;
		return response;
	};

	try {
		for (const draft of drafts) {
			if (!isEligibleGeneratedTimeLogDraft(draft)) {
				continue;
			}

			if (targetCount !== 0 && processedCount >= targetCount) {
				break;
			}

			try {
				const projectId = normalizeString(draft.project_id, 'project_id');
				const moduleType = normalizeModuleType(draft.module_type);
				const moduleId = maybeNormalizeModuleId(moduleType, draft.module_id);
				const scopeKey = buildScopedDraftKey(projectId, moduleType, moduleId);
				const scope = scopedGroups.get(scopeKey);

				if (!scope) {
					throw new Error('Could not resolve a project/module scope for the generated timelog draft.');
				}

				let scopedLogs = scopedLogCache.get(scopeKey);
				if (!scopedLogs) {
					scopedLogs = await listScopedTimeLogs(connection.client, scope, callToolWithDelay);
					scopedLogCache.set(scopeKey, scopedLogs);
				}

				const matchedLog = findMatchingTimeLog(draft, scopedLogs);
				if (matchedLog) {
					const matchedId = extractTimeLogId(matchedLog);
					if (!matchedId) {
						throw new Error('Matched existing timelog did not include an id.');
					}

					setCompletedDraftState(draft, matchedId);
					matchedExistingCount += 1;
					processedCount += 1;
					await writeGeneratedTimeLogsFile(inputFilePath, drafts);
					continue;
				}

				const createResponse = await callToolWithDelay(
					'create_time_log',
					buildCreateTimeLogPayload(draft),
				);
				const createdData = parseToolResponse(createResponse);
				const createdId = extractTimeLogId(createdData);
				if (!createdId) {
					throw new Error('Created timelog response did not include an id.');
				}

				setCompletedDraftState(draft, createdId);
				scopedLogs.push({
					id: createdId,
					log_name: draft.log_name,
				});
				createdCount += 1;
				processedCount += 1;
				await writeGeneratedTimeLogsFile(inputFilePath, drafts);
			} catch (error) {
				setErroredDraftState(draft, error);
				errorCount += 1;
				processedCount += 1;
				await writeGeneratedTimeLogsFile(inputFilePath, drafts);
			}
		}
	} finally {
		await connection.close();
	}

	return {
		email,
		inputFilePath,
		targetCount,
		requestDelayMs,
		totalDrafts,
		eligibleBeforeRun,
		skippedResolved,
		processedCount,
		matchedExistingCount,
		createdCount,
		errorCount,
		remainingEligible: drafts.filter(isEligibleGeneratedTimeLogDraft).length,
		drafts,
	};
}

async function main(): Promise<void> {
	try {
		const email = process.argv[2];
		const result = await executeGeneratedTimeLogs(email);
		console.log(formatGeneratedTimeLogExecutionSummary(result));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to create generated timelogs: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}
