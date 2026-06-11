#!/usr/bin/env node

import * as dotenv from 'dotenv';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTasksByEmailDataPath, taskMatchesEmail } from './list-tasks-by-email.ts';

type TaskOwner = {
	email?: string;
	name?: string;
};

type TaskProject = {
	id?: number | string;
	name?: string;
};

type TaskList = {
	id?: number | string;
	name?: string;
};

type TaskDuration = {
	value?: string | number;
	type?: string;
};

type TaskLogHours = {
	billable_hours?: string | number;
	non_billable_hours?: string | number;
	total_hours?: string | number;
};

export type Task = Record<string, unknown> & {
	id?: number | string;
	name?: string;
	prefix?: string;
	project?: TaskProject;
	tasklist?: TaskList;
	status?: {
		name?: string;
	};
	duration?: TaskDuration;
	start_date?: string;
	end_date?: string;
	log_hours?: TaskLogHours;
	owners_and_work?: {
		owners?: TaskOwner[];
	};
	created_by?: {
		email?: string;
		name?: string;
	};
};

type FilterTasksByEmailWorkResult = {
	allTasks: Task[];
	matchingTasks: Task[];
	excludedTasks: Task[];
	eligibleTasks: Task[];
	filteredTasks: Task[];
	compliantTasks: Task[];
};

type FilteredTasksSummaryData = FilterTasksByEmailWorkResult & {
	email: string;
	inputFilePath: string;
	outputFilePath: string;
	summaryFilePath: string;
	acceptableShortfallHours: number;
};

const DEFAULT_TARGET_EMAIL = 'geoffrey.kimani@volane.com';
const DEFAULT_HOURS_PER_DAY = 9.5;
const DEFAULT_ACCEPTABLE_SHORTFALL_HOURS = 4;
const EXCLUDED_STATUSES = new Set(['open', 'on hold']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(repoRoot, '.env');

let envLoaded = false;

function requireEmail(email: string): string {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail) {
		throw new Error('A target email is required.');
	}

	return normalizedEmail;
}

function resolveInputFilePath(email: string, inputFilePath?: string): string {
	if (inputFilePath) {
		const normalizedInputPath = inputFilePath.trim();
		if (!normalizedInputPath) {
			throw new Error('An input file path is required when provided.');
		}

		return path.resolve(normalizedInputPath);
	}

	return getTasksByEmailDataPath(email);
}

function loadOptionalEnv(): void {
	if (envLoaded) {
		return;
	}

	dotenv.config({ path: envPath });
	envLoaded = true;
}

function parseNonNegativeNumber(value: unknown, fallback: number, label: string): number {
	if (value === undefined || value === null || value === '') {
		return fallback;
	}

	const parsedValue =
		typeof value === 'number'
			? value
			: typeof value === 'string'
				? Number(value.trim())
				: Number.NaN;

	if (!Number.isFinite(parsedValue) || parsedValue < 0) {
		throw new Error(`${label} must be a non-negative number.`);
	}

	return parsedValue;
}

function getConfiguredHoursPerDay(): number {
	loadOptionalEnv();
	return parseNonNegativeNumber(process.env.HOURS_PER_DAY, DEFAULT_HOURS_PER_DAY, 'HOURS_PER_DAY');
}

function getConfiguredAcceptableShortfallHours(): number {
	loadOptionalEnv();
	return parseNonNegativeNumber(
		process.env.ACCEPTABLE_SHORTFALL_HOURS,
		DEFAULT_ACCEPTABLE_SHORTFALL_HOURS,
		'ACCEPTABLE_SHORTFALL_HOURS',
	);
}

export function parseThresholdHours(value: unknown): number {
	if (value === undefined) {
		return getConfiguredAcceptableShortfallHours();
	}

	return parseNonNegativeNumber(value, DEFAULT_ACCEPTABLE_SHORTFALL_HOURS, 'Acceptable shortfall hours');
}

function getSiblingOutputPath(inputFilePath: string, suffix: string): string {
	const resolvedPath = path.resolve(inputFilePath);
	const parsedPath = path.parse(resolvedPath);
	const baseName = parsedPath.ext === '.json' ? parsedPath.name : parsedPath.base;

	return path.resolve(parsedPath.dir, `${baseName}${suffix}`);
}

function formatNumberToHours(hours: number): string {
	return `${hours.toFixed(2)}h`;
}

function normalizeText(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function formatDisplayText(value: unknown, fallback: string = 'N/A'): string {
	const normalizedValue = normalizeText(value);
	return normalizedValue || fallback;
}

function escapeMarkdownCell(value: string): string {
	return value.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
}

function formatDate(value: unknown): string {
	if (typeof value !== 'string') {
		return 'N/A';
	}

	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return 'N/A';
	}

	const isoDateMatch = trimmedValue.match(/^\d{4}-\d{2}-\d{2}/);
	return isoDateMatch ? isoDateMatch[0] : 'N/A';
}

function formatDurationDisplay(task: Task): string {
	const rawValue = task.duration?.value;
	const rawType = normalizeText(task.duration?.type) || 'days';
	const displayValue =
		typeof rawValue === 'string' || typeof rawValue === 'number' ? String(rawValue) : '0';

	return `${displayValue} ${rawType} (${formatNumberToHours(getTaskDurationHours(task))})`;
}

function compareTasks(a: Task, b: Task): number {
	const projectComparison = formatDisplayText(a.project?.name).localeCompare(
		formatDisplayText(b.project?.name),
	);
	if (projectComparison !== 0) {
		return projectComparison;
	}

	const taskListComparison = formatDisplayText(a.tasklist?.name).localeCompare(
		formatDisplayText(b.tasklist?.name),
	);
	if (taskListComparison !== 0) {
		return taskListComparison;
	}

	const prefixComparison = formatDisplayText(a.prefix).localeCompare(formatDisplayText(b.prefix));
	if (prefixComparison !== 0) {
		return prefixComparison;
	}

	return formatDisplayText(a.name).localeCompare(formatDisplayText(b.name));
}

export function getFilteredTasksByEmailDataPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-underallocated.json');
}

export function getFilteredTasksByEmailSummaryPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-underallocated-summary.md');
}

export function parseHourValue(value: unknown): number {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value !== 'string') {
		return 0;
	}

	const trimmedValue = value.trim();
	if (!trimmedValue) {
		return 0;
	}

	const timeMatch = trimmedValue.match(/^(\d+):(\d{2})$/);
	if (timeMatch) {
		const hours = Number(timeMatch[1]);
		const minutes = Number(timeMatch[2]);
		if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
			return 0;
		}

		return hours + minutes / 60;
	}

	const numericValue = Number(trimmedValue);
	return Number.isFinite(numericValue) ? numericValue : 0;
}

export function isExcludedStatus(task: Task): boolean {
	const normalizedStatus = normalizeText(task.status?.name).toLowerCase();
	return EXCLUDED_STATUSES.has(normalizedStatus);
}

export function getTaskBillableHours(task: Task): number {
	return parseHourValue(task.log_hours?.billable_hours);
}

export function getTaskNonBillableHours(task: Task): number {
	return parseHourValue(task.log_hours?.non_billable_hours);
}

export function getTaskDurationHours(task: Task): number {
	const duration = task.duration;
	if (!duration) {
		return 0;
	}

	const normalizedType = normalizeText(duration.type).toLowerCase();
	const resolvedType = normalizedType || 'days';

	if (resolvedType === 'hours') {
		return parseHourValue(duration.value);
	}

	return parseHourValue(duration.value) * getConfiguredHoursPerDay();
}

export function getMinimumAcceptableBillableHours(
	task: Task,
	acceptableShortfallHours: number = getConfiguredAcceptableShortfallHours(),
): number {
	const durationHours = getTaskDurationHours(task);
	return Math.max(durationHours - parseThresholdHours(acceptableShortfallHours), 0);
}

export function taskIsUnderallocated(
	task: Task,
	acceptableShortfallHours: number = getConfiguredAcceptableShortfallHours(),
): boolean {
	const billableHours = getTaskBillableHours(task);
	const minimumAcceptableHours = getMinimumAcceptableBillableHours(
		task,
		acceptableShortfallHours,
	);
	return billableHours <= 0 || billableHours < minimumAcceptableHours;
}

export async function filterTasksByEmailWork(
	email: string = DEFAULT_TARGET_EMAIL,
	inputFilePath?: string,
	acceptableShortfallHours: number = getConfiguredAcceptableShortfallHours(),
): Promise<FilterTasksByEmailWorkResult> {
	const normalizedEmail = requireEmail(email);
	const resolvedInputPath = resolveInputFilePath(normalizedEmail, inputFilePath);
	const normalizedShortfallHours = parseThresholdHours(acceptableShortfallHours);
	const fileContents = await fsp.readFile(resolvedInputPath, 'utf8');
	const parsedData = JSON.parse(fileContents);

	if (!Array.isArray(parsedData)) {
		throw new Error(`Expected task data array in ${resolvedInputPath}`);
	}

	const allTasks = parsedData as Task[];
	const matchingTasks = allTasks.filter((task) => taskMatchesEmail(task, normalizedEmail));
	const excludedTasks = matchingTasks.filter((task) => isExcludedStatus(task));
	const eligibleTasks = matchingTasks.filter((task) => !isExcludedStatus(task));
	const filteredTasks = eligibleTasks.filter((task) =>
		taskIsUnderallocated(task, normalizedShortfallHours),
	);
	const compliantTasks = eligibleTasks.filter(
		(task) => !taskIsUnderallocated(task, normalizedShortfallHours),
	);

	return {
		allTasks,
		matchingTasks,
		excludedTasks,
		eligibleTasks,
		filteredTasks,
		compliantTasks,
	};
}

export async function writeFilteredTasksByEmailFile(
	email: string,
	tasks: Task[],
	inputFilePath?: string,
): Promise<void> {
	const dataPath = getFilteredTasksByEmailDataPath(email, inputFilePath);
	await fsp.mkdir(path.dirname(dataPath), { recursive: true });
	await fsp.writeFile(dataPath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
}

export function formatFilteredTasksByEmailSummary(data: FilteredTasksSummaryData): string {
	const zeroBillableTasks = data.filteredTasks.filter((task) => getTaskBillableHours(task) <= 0);
	const partiallyLoggedTasks = data.filteredTasks.filter((task) => getTaskBillableHours(task) > 0);
	const lines = [
		'# Underallocated Tasks Summary',
		'',
		`- Target Email: ${data.email}`,
		`- Input JSON Path: ${data.inputFilePath}`,
		`- Filtered JSON Path: ${data.outputFilePath}`,
		`- Summary Markdown Path: ${data.summaryFilePath}`,
		`- Acceptable Shortfall Hours: ${data.acceptableShortfallHours}`,
		'',
		'## Summary Metrics',
		'',
		'| Metric | Count |',
		'| --- | ---: |',
		`| Initial Task Count | ${data.allTasks.length} |`,
		`| Validated Email-Matching Task Count | ${data.matchingTasks.length} |`,
		`| Excluded Status Count (Open/On Hold) | ${data.excludedTasks.length} |`,
		`| Eligible Task Count | ${data.eligibleTasks.length} |`,
		`| Filtered Task Count | ${data.filteredTasks.length} |`,
		`| Tasks With Zero Billable Hours Logged | ${zeroBillableTasks.length} |`,
		`| Underallocated Tasks With Some Billable Hours | ${partiallyLoggedTasks.length} |`,
		`| Compliant Tasks (Tasks With Relevant Logged Hours) | ${data.compliantTasks.length} |`,
		'',
		'## Filtered Tasks By Project And Task List',
		'',
	];

	if (data.filteredTasks.length === 0) {
		lines.push('No underallocated tasks were found after applying the email and status filters.');
		return lines.join('\n');
	}

	const sortedTasks = [...data.filteredTasks].sort(compareTasks);
	const projectGroups = new Map<string, { projectName: string; projectId: string; tasks: Task[] }>();

	for (const task of sortedTasks) {
		const projectName = formatDisplayText(task.project?.name, 'Unknown project');
		const projectId = formatDisplayText(task.project?.id, 'N/A');
		const projectKey = `${projectName}::${projectId}`;
		const group = projectGroups.get(projectKey) || { projectName, projectId, tasks: [] };
		group.tasks.push(task);
		projectGroups.set(projectKey, group);
	}

	for (const projectGroup of projectGroups.values()) {
		lines.push(`### Project: ${projectGroup.projectName} (${projectGroup.projectId})`);
		lines.push('');

		const taskListGroups = new Map<
			string,
			{ taskListName: string; taskListId: string; tasks: Task[] }
		>();

		for (const task of projectGroup.tasks) {
			const taskListName = formatDisplayText(task.tasklist?.name, 'Unknown task list');
			const taskListId = formatDisplayText(task.tasklist?.id, 'N/A');
			const taskListKey = `${taskListName}::${taskListId}`;
			const taskListGroup = taskListGroups.get(taskListKey) || {
				taskListName,
				taskListId,
				tasks: [],
			};
			taskListGroup.tasks.push(task);
			taskListGroups.set(taskListKey, taskListGroup);
		}

		for (const taskListGroup of taskListGroups.values()) {
			lines.push(`#### Task List: ${taskListGroup.taskListName} (${taskListGroup.taskListId})`);
			lines.push('');
			lines.push(
				'| Prefix | Task Name | Status | Duration | Start Date | End Date | Billable Hours Logged | Non Billable Hours Logged |',
			);
			lines.push('| --- | --- | --- | --- | --- | --- | ---: | ---: |');

			for (const task of taskListGroup.tasks) {
				lines.push(
					[
						'|',
						escapeMarkdownCell(formatDisplayText(task.prefix)),
						'|',
						escapeMarkdownCell(formatDisplayText(task.name)),
						'|',
						escapeMarkdownCell(formatDisplayText(task.status?.name)),
						'|',
						escapeMarkdownCell(formatDurationDisplay(task)),
						'|',
						escapeMarkdownCell(formatDate(task.start_date)),
						'|',
						escapeMarkdownCell(formatDate(task.end_date)),
						'|',
						escapeMarkdownCell(formatDisplayText(task.log_hours?.billable_hours, '00:00')),
						'|',
						escapeMarkdownCell(formatDisplayText(task.log_hours?.non_billable_hours, '00:00')),
						'|',
					].join(' '),
				);
			}

			lines.push('');
		}
	}

	return lines.join('\n');
}

export async function writeFilteredTasksByEmailSummaryFile(
	email: string,
	data: Omit<FilteredTasksSummaryData, 'email' | 'outputFilePath' | 'summaryFilePath'> &
		Partial<Pick<FilteredTasksSummaryData, 'outputFilePath' | 'summaryFilePath'>>,
	inputFilePath?: string,
): Promise<void> {
	const normalizedEmail = requireEmail(email);
	const summaryFilePath =
		data.summaryFilePath || getFilteredTasksByEmailSummaryPath(normalizedEmail, inputFilePath);
	const outputFilePath =
		data.outputFilePath || getFilteredTasksByEmailDataPath(normalizedEmail, inputFilePath);
	const summary = formatFilteredTasksByEmailSummary({
		email: normalizedEmail,
		inputFilePath: data.inputFilePath,
		outputFilePath,
		summaryFilePath,
		acceptableShortfallHours: data.acceptableShortfallHours,
		allTasks: data.allTasks,
		matchingTasks: data.matchingTasks,
		excludedTasks: data.excludedTasks,
		eligibleTasks: data.eligibleTasks,
		filteredTasks: data.filteredTasks,
		compliantTasks: data.compliantTasks,
	});

	await fsp.mkdir(path.dirname(summaryFilePath), { recursive: true });
	await fsp.writeFile(summaryFilePath, summary, 'utf8');
}

async function main(): Promise<void> {
	try {
		const targetEmail = process.argv[2] || DEFAULT_TARGET_EMAIL;
		const secondArg = process.argv[3];
		const thirdArg = process.argv[4];
		const inputFilePath =
			secondArg && Number.isNaN(Number(secondArg.trim())) ? secondArg : undefined;
		const acceptableShortfallHours = parseThresholdHours(
			thirdArg ?? (inputFilePath ? undefined : secondArg),
		);
		const normalizedEmail = requireEmail(targetEmail);
		const resolvedInputPath = resolveInputFilePath(normalizedEmail, inputFilePath);
		const outputFilePath = getFilteredTasksByEmailDataPath(normalizedEmail, resolvedInputPath);
		const summaryFilePath = getFilteredTasksByEmailSummaryPath(normalizedEmail, resolvedInputPath);
		const result = await filterTasksByEmailWork(
			normalizedEmail,
			resolvedInputPath,
			acceptableShortfallHours,
		);

		await writeFilteredTasksByEmailFile(normalizedEmail, result.filteredTasks, resolvedInputPath);
		await writeFilteredTasksByEmailSummaryFile(
			normalizedEmail,
			{
				inputFilePath: resolvedInputPath,
				outputFilePath,
				summaryFilePath,
				acceptableShortfallHours,
				...result,
			},
			resolvedInputPath,
		);

		console.log(
			formatFilteredTasksByEmailSummary({
				email: normalizedEmail,
				inputFilePath: resolvedInputPath,
				outputFilePath,
				summaryFilePath,
				acceptableShortfallHours,
				...result,
			}),
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to filter tasks by email work: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}

void repoRoot;
