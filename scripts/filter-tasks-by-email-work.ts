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
	created_time?: string;
	created_date?: string;
	completed_date?: string;
	closed_date?: string;
	last_updated_time?: string;
	log_hours?: TaskLogHours;
	owners_and_work?: {
		owners?: TaskOwner[];
	};
	created_by?: {
		email?: string;
		name?: string;
	};
};

export type FilterTasksByEmailWorkResult = {
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

export type GeneratedTimeLogDraft = {
	project_id: string;
	module_type: 'task';
	module_id: string;
	task_prefix: string;
	log_name: string;
	date: string;
	bill_status: 'Billable';
	hours: string;
	start_time: string;
	end_time: string;
	status: 'Approved';
	used_created_at_date: boolean;
};

export type GeneratedTimeLogTaskPlan = {
	task: Task;
	currentBillableHours: number;
	targetThresholdHours: number;
	additionalHoursNeeded: number;
	generatedDrafts: GeneratedTimeLogDraft[];
};

export type GenerateTimeLogDraftsResult = {
	tasksNeedingGeneratedTimeLogs: number;
	totalGeneratedTimeLogs: number;
	totalPlannedBillableHours: number;
	zeroDurationFallbackTasks: number;
	createdTimeDatedDrafts: number;
	generatedTimeLogs: GeneratedTimeLogDraft[];
	taskPlans: GeneratedTimeLogTaskPlan[];
};

type GeneratedTimeLogSummaryData = GenerateTimeLogDraftsResult & {
	email: string;
	inputFilePath: string;
	outputFilePath: string;
	summaryFilePath: string;
	acceptableShortfallHours: number;
	generatedTimeLogMaxDailyHours: number;
	filteredTasks: Task[];
};

type GenerateTimeLogDraftOptions = {
	acceptableShortfallHours?: number;
	randomFn?: () => number;
	runDate?: Date;
};

const DEFAULT_TARGET_EMAIL = 'geoffrey.kimani@volane.com';
const DEFAULT_HOURS_PER_DAY = 9.5;
const DEFAULT_ACCEPTABLE_SHORTFALL_HOURS = 4;
const DEFAULT_GENERATED_TIMELOG_MAX_DAILY_HOURS = 9;
const FULL_DAY_MIN_HOURS = 7;
const FULL_DAY_MAX_HOURS = 14;
const ZERO_DURATION_MIN_HOURS = 7;
const ZERO_DURATION_MAX_HOURS = 14;
const GENERATED_START_HOUR = 8;
const GENERATED_START_MINUTE = 30;
const GENERATED_START_OFFSET_MINUTES = 30;
const GENERATED_END_HOUR = 17;
const GENERATED_END_MINUTE = 0;
const GENERATED_END_OFFSET_MINUTES = 60;
const GENERATED_START_MAX_HOUR = 9;
const GENERATED_START_MAX_MINUTE = 0;
const GENERATED_END_MAX_HOUR = 18;
const GENERATED_END_MAX_MINUTE = 0;
const GENERATED_MINIMUM_END_HOUR = 17;
const MAX_GENERATED_DRAFT_HOURS = 17 + 59 / 60;
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

function getConfiguredGeneratedTimeLogMaxDailyHours(): number {
	loadOptionalEnv();
	return parseNonNegativeNumber(
		process.env.GENERATED_TIMELOG_MAX_DAILY_HOURS,
		DEFAULT_GENERATED_TIMELOG_MAX_DAILY_HOURS,
		'GENERATED_TIMELOG_MAX_DAILY_HOURS',
	);
}

export function parseThresholdHours(value: unknown): number {
	if (value === undefined) {
		return getConfiguredAcceptableShortfallHours();
	}

	return parseNonNegativeNumber(
		value,
		DEFAULT_ACCEPTABLE_SHORTFALL_HOURS,
		'Acceptable shortfall hours',
	);
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

function getTaskSortDate(task: Task): string {
	const fallbackDateCandidates = [
		task.start_date,
		task.end_date,
		task.created_time,
		task.created_date,
		task.completed_date,
		task.closed_date,
		task.last_updated_time,
	];

	for (const candidate of fallbackDateCandidates) {
		const normalizedDate = formatDate(candidate);
		if (normalizedDate !== 'N/A') {
			return normalizedDate;
		}
	}

	return '9999-12-31';
}

function compareTasks(a: Task, b: Task): number {
	const startDateComparison = getTaskSortDate(a).localeCompare(getTaskSortDate(b));
	if (startDateComparison !== 0) {
		return startDateComparison;
	}

	const projectComparison = formatDisplayText(a.project?.name).localeCompare(
		formatDisplayText(b.project?.name),
	);
	if (projectComparison !== 0) {
		return projectComparison;
	}

	const taskComparison = formatDisplayText(a.prefix).localeCompare(formatDisplayText(b.prefix));
	if (taskComparison !== 0) {
		return taskComparison;
	}

	return formatDisplayText(a.name).localeCompare(formatDisplayText(b.name));
}

function sanitizeRandomValue(randomFn: () => number): number {
	const value = randomFn();
	if (!Number.isFinite(value)) {
		return 0;
	}

	if (value <= 0) {
		return 0;
	}

	if (value >= 1) {
		return 0.999999999999;
	}

	return value;
}

function randomInt(min: number, max: number, randomFn: () => number): number {
	if (max <= min) {
		return min;
	}

	return min + Math.floor(sanitizeRandomValue(randomFn) * (max - min + 1));
}

function hoursToMinutes(hours: number): number {
	return Math.max(0, Math.ceil(hours * 60 - 1e-9));
}

function minutesToHours(totalMinutes: number): number {
	return totalMinutes / 60;
}

function formatMinutesAsHours(totalMinutes: number): string {
	const safeMinutes = Math.max(0, Math.round(totalMinutes));
	const hours = Math.floor(safeMinutes / 60);
	const minutes = safeMinutes % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeOfDay(totalMinutes: number): string {
	const dayMinutes = ((Math.round(totalMinutes) % (24 * 60)) + 24 * 60) % (24 * 60);
	const hours = Math.floor(dayMinutes / 60);
	const minutes = dayMinutes % 60;
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getTaskIdentifier(task: Task): string {
	const taskId = task.id;
	if (taskId === undefined || taskId === null || String(taskId).trim().length === 0) {
		throw new Error(`Task is missing an id: ${task.name || 'Unnamed task'}`);
	}

	return String(taskId);
}

function getProjectIdentifier(task: Task): string {
	const projectId = task.project?.id;
	if (projectId === undefined || projectId === null || String(projectId).trim().length === 0) {
		throw new Error(`Task is missing a project id: ${task.name || 'Unnamed task'}`);
	}

	return String(projectId);
}

function getTaskThresholdHours(
	task: Task,
	acceptableShortfallHours: number = getConfiguredAcceptableShortfallHours(),
): number {
	return getMinimumAcceptableBillableHours(task, acceptableShortfallHours);
}

function getTaskOwnedFallbackDate(task: Task): string {
	const fallbackDateCandidates = [
		task.created_time,
		task.created_date,
		task.completed_date,
		task.closed_date,
		task.last_updated_time,
	];

	for (const candidate of fallbackDateCandidates) {
		const normalizedDate = formatDate(candidate);
		if (normalizedDate !== 'N/A') {
			return normalizedDate;
		}
	}

	return 'N/A';
}

function getEffectiveTaskDates(task: Task, runDate: Date): { dates: string[]; usedCreatedAtDate: boolean } {
	const normalizedStartDate = formatDate(task.start_date);
	const normalizedEndDate = formatDate(task.end_date);

	if (normalizedStartDate !== 'N/A') {
		return {
			dates: [normalizedStartDate],
			usedCreatedAtDate: false,
		};
	}

	if (normalizedEndDate !== 'N/A') {
		return {
			dates: [normalizedEndDate],
			usedCreatedAtDate: false,
		};
	}

	const createdAtDate = getTaskOwnedFallbackDate(task);
	if (createdAtDate !== 'N/A') {
		return {
			dates: [createdAtDate],
			usedCreatedAtDate: true,
		};
	}

	return {
		dates: [runDate.toISOString().slice(0, 10)],
		usedCreatedAtDate: false,
	};
}

function buildGeneratedTimeLogName(task: Task, index: number): string {
	const prefix = formatDisplayText(task.prefix, 'TASK');
	const taskName = formatDisplayText(task.name, 'Unnamed task');
	return `Generated timelog ${prefix} - ${taskName} - ${index + 1}`;
}

function getMinimumGeneratedDraftMinutes(): number {
	return (
		GENERATED_END_HOUR * 60 +
		GENERATED_END_MINUTE -
		(GENERATED_START_MAX_HOUR * 60 + GENERATED_START_MAX_MINUTE)
	);
}

function getMaximumGeneratedDraftMinutes(): number {
	return (
		GENERATED_END_MAX_HOUR * 60 +
		GENERATED_END_MAX_MINUTE -
		(GENERATED_START_HOUR * 60 + GENERATED_START_MINUTE)
	);
}

function getGeneratedTimeLogMaxDailyMinutes(): number {
	const configuredMaxHours = Math.min(getConfiguredGeneratedTimeLogMaxDailyHours(), MAX_GENERATED_DRAFT_HOURS);
	const minimumDraftMinutes = getMinimumGeneratedDraftMinutes();
	const maximumDraftMinutes = getMaximumGeneratedDraftMinutes();
	return Math.max(
		minimumDraftMinutes,
		Math.min(hoursToMinutes(configuredMaxHours), maximumDraftMinutes),
	);
}

function buildDraftFromMinutes(
	task: Task,
	date: string,
	durationMinutes: number,
	draftIndex: number,
	usedCreatedAtDate: boolean,
	randomFn: () => number,
): GeneratedTimeLogDraft {
	const earliestAllowedStartMinutes = GENERATED_START_HOUR * 60 + GENERATED_START_MINUTE;
	const latestAllowedStartMinutes = GENERATED_START_MAX_HOUR * 60 + GENERATED_START_MAX_MINUTE;
	const earliestAllowedEndMinutes = GENERATED_END_HOUR * 60 + GENERATED_END_MINUTE;
	const latestAllowedEndMinutes = GENERATED_END_MAX_HOUR * 60 + GENERATED_END_MAX_MINUTE;

	let startMinutes =
		GENERATED_START_HOUR * 60 +
		GENERATED_START_MINUTE +
		randomInt(0, GENERATED_START_OFFSET_MINUTES, randomFn);
	let endMinutes =
		GENERATED_END_HOUR * 60 +
		GENERATED_END_MINUTE +
		randomInt(0, GENERATED_END_OFFSET_MINUTES, randomFn);
	const minimumDurationMinutes = Math.min(
		Math.max(durationMinutes, getMinimumGeneratedDraftMinutes()),
		getMaximumGeneratedDraftMinutes(),
	);
	const currentDurationMinutes = endMinutes - startMinutes;

	if (currentDurationMinutes < minimumDurationMinutes) {
		let remainingMinutesNeeded = minimumDurationMinutes - currentDurationMinutes;
		const availableEarlierStartMinutes = startMinutes - earliestAllowedStartMinutes;
		const startShiftMinutes = Math.min(availableEarlierStartMinutes, remainingMinutesNeeded);
		startMinutes -= startShiftMinutes;
		remainingMinutesNeeded -= startShiftMinutes;

		if (remainingMinutesNeeded > 0) {
			const availableLaterEndMinutes = latestAllowedEndMinutes - endMinutes;
			const endShiftMinutes = Math.min(availableLaterEndMinutes, remainingMinutesNeeded);
			endMinutes += endShiftMinutes;
		}
	}

	startMinutes = Math.min(Math.max(startMinutes, earliestAllowedStartMinutes), latestAllowedStartMinutes);
	endMinutes = Math.min(Math.max(endMinutes, earliestAllowedEndMinutes), latestAllowedEndMinutes);
	const effectiveDurationMinutes = endMinutes - startMinutes;

	return {
		project_id: getProjectIdentifier(task),
		module_type: 'task',
		module_id: getTaskIdentifier(task),
		task_prefix: formatDisplayText(task.prefix, 'TASK'),
		log_name: buildGeneratedTimeLogName(task, draftIndex),
		date,
		bill_status: 'Billable',
		hours: formatMinutesAsHours(effectiveDurationMinutes),
		start_time: formatTimeOfDay(startMinutes),
		end_time: formatTimeOfDay(endMinutes),
		status: 'Approved',
		used_created_at_date: usedCreatedAtDate,
	};
}

function buildPartialDayDurationMinutes(
	requiredMinutes: number,
	maxDailyMinutes: number,
	randomFn: () => number,
): number {
	const minimumGeneratedDraftMinutes = Math.min(getMinimumGeneratedDraftMinutes(), maxDailyMinutes);
	if (requiredMinutes <= minimumGeneratedDraftMinutes) {
		return minimumGeneratedDraftMinutes;
	}

	const normalizedRequiredMinutes = Math.max(requiredMinutes, minimumGeneratedDraftMinutes);
	const wholeHours = Math.floor(normalizedRequiredMinutes / 60);
	const minimumMinutes = normalizedRequiredMinutes - wholeHours * 60;
	const maximumMinutes = Math.min(59, maxDailyMinutes - wholeHours * 60);

	if (wholeHours * 60 >= maxDailyMinutes || maximumMinutes <= minimumMinutes) {
		return Math.min(Math.max(normalizedRequiredMinutes, wholeHours * 60 + minimumMinutes), maxDailyMinutes);
	}

	return wholeHours * 60 + randomInt(minimumMinutes, maximumMinutes, randomFn);
}

function buildGeneratedTimeLogDurations(
	task: Task,
	acceptableShortfallHours: number,
	randomFn: () => number,
): number[] {
	const maxDailyMinutes = getGeneratedTimeLogMaxDailyMinutes();
	const taskDurationMinutes = hoursToMinutes(getTaskDurationHours(task));
	const minimumGeneratedDraftMinutes = Math.min(getMinimumGeneratedDraftMinutes(), maxDailyMinutes);

	if (taskDurationMinutes <= 0) {
		const upperMinutes = Math.max(
			minimumGeneratedDraftMinutes,
			Math.min(hoursToMinutes(ZERO_DURATION_MAX_HOURS), maxDailyMinutes),
		);
		const lowerMinutes = Math.min(
			Math.max(hoursToMinutes(ZERO_DURATION_MIN_HOURS), minimumGeneratedDraftMinutes),
			upperMinutes,
		);
		return [randomInt(lowerMinutes, upperMinutes, randomFn)];
	}

	let remainingMinutes = hoursToMinutes(
		getAdditionalBillableHoursNeeded(task, acceptableShortfallHours),
	);
	if (remainingMinutes <= 0) {
		return [];
	}

	const durations: number[] = [];
	const fullDayMinimumMinutes = Math.min(
		Math.max(hoursToMinutes(FULL_DAY_MIN_HOURS), minimumGeneratedDraftMinutes),
		maxDailyMinutes,
	);
	const fullDayMaximumMinutes = Math.max(
		fullDayMinimumMinutes,
		Math.min(hoursToMinutes(FULL_DAY_MAX_HOURS), maxDailyMinutes),
	);

	while (remainingMinutes > maxDailyMinutes) {
		const fullDayDuration = randomInt(fullDayMinimumMinutes, fullDayMaximumMinutes, randomFn);
		durations.push(fullDayDuration);
		remainingMinutes -= fullDayDuration;
	}

	if (remainingMinutes > 0) {
		durations.push(buildPartialDayDurationMinutes(remainingMinutes, maxDailyMinutes, randomFn));
	}

	return durations;
}

export function getFilteredTasksByEmailDataPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-underallocated.json');
}

export function getFilteredTasksByEmailSummaryPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-underallocated-summary.md');
}

export function getGeneratedTimeLogsDataPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-generated-timelogs.json');
}

export function getGeneratedTimeLogsSummaryPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-generated-timelogs-summary.md');
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

export function getAdditionalBillableHoursNeeded(
	task: Task,
	acceptableShortfallHours: number = getConfiguredAcceptableShortfallHours(),
): number {
	const targetHours = getMinimumAcceptableBillableHours(task, acceptableShortfallHours);
	return Math.max(targetHours - getTaskBillableHours(task), 0);
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
	const sortedMatchingTasks = [...matchingTasks].sort(compareTasks);
	const excludedTasks = sortedMatchingTasks.filter((task) => isExcludedStatus(task));
	const eligibleTasks = sortedMatchingTasks.filter((task) => !isExcludedStatus(task));
	const filteredTasks = eligibleTasks.filter((task) =>
		taskIsUnderallocated(task, normalizedShortfallHours),
	);
	const compliantTasks = eligibleTasks.filter(
		(task) => !taskIsUnderallocated(task, normalizedShortfallHours),
	);

	return {
		allTasks,
		matchingTasks: sortedMatchingTasks,
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

export function generateTimeLogDraftsForTask(
	task: Task,
	options: GenerateTimeLogDraftOptions = {},
): GeneratedTimeLogDraft[] {
	const normalizedShortfallHours = parseThresholdHours(options.acceptableShortfallHours);
	const randomFn = options.randomFn || Math.random;
	const runDate = options.runDate || new Date();
	const durations = buildGeneratedTimeLogDurations(task, normalizedShortfallHours, randomFn);
	if (durations.length === 0) {
		return [];
	}

	const planningDates = getEffectiveTaskDates(task, runDate);

	return durations.map((durationMinutes, index) =>
		buildDraftFromMinutes(
			task,
			planningDates.dates[Math.min(index, planningDates.dates.length - 1)],
			durationMinutes,
			index,
			planningDates.usedCreatedAtDate,
			randomFn,
		),
	);
}

export function generateTimeLogDraftsForFilteredTasks(
	filteredTasks: Task[],
	options: GenerateTimeLogDraftOptions = {},
): GenerateTimeLogDraftsResult {
	const normalizedShortfallHours = parseThresholdHours(options.acceptableShortfallHours);
	const taskPlans: GeneratedTimeLogTaskPlan[] = [];
	const generatedTimeLogs: GeneratedTimeLogDraft[] = [];
	const sortedFilteredTasks = [...filteredTasks].sort(compareTasks);

	for (const task of sortedFilteredTasks) {
		const currentBillableHours = getTaskBillableHours(task);
		const targetThresholdHours = getTaskThresholdHours(task, normalizedShortfallHours);
		const additionalHoursNeeded = getAdditionalBillableHoursNeeded(task, normalizedShortfallHours);
		const generatedDrafts = generateTimeLogDraftsForTask(task, {
			acceptableShortfallHours: normalizedShortfallHours,
			randomFn: options.randomFn,
			runDate: options.runDate,
		});

		if (generatedDrafts.length === 0) {
			continue;
		}

		taskPlans.push({
			task,
			currentBillableHours,
			targetThresholdHours,
			additionalHoursNeeded,
			generatedDrafts,
		});
		generatedTimeLogs.push(...generatedDrafts);
	}

	return {
		tasksNeedingGeneratedTimeLogs: taskPlans.length,
		totalGeneratedTimeLogs: generatedTimeLogs.length,
		totalPlannedBillableHours: minutesToHours(
			generatedTimeLogs.reduce((sum, draft) => sum + hoursToMinutes(parseHourValue(draft.hours)), 0),
		),
		zeroDurationFallbackTasks: taskPlans.filter(
			(plan) => hoursToMinutes(getTaskDurationHours(plan.task)) <= 0,
		).length,
		createdTimeDatedDrafts: generatedTimeLogs.filter((draft) => draft.used_created_at_date).length,
		generatedTimeLogs,
		taskPlans,
	};
}

export async function writeGeneratedTimeLogsFile(
	email: string,
	generatedTimeLogs: GeneratedTimeLogDraft[],
	inputFilePath?: string,
): Promise<void> {
	const dataPath = getGeneratedTimeLogsDataPath(email, inputFilePath);
	await fsp.mkdir(path.dirname(dataPath), { recursive: true });
	await fsp.writeFile(dataPath, `${JSON.stringify(generatedTimeLogs, null, 2)}\n`, 'utf8');
}

export function formatGeneratedTimeLogsSummary(data: GeneratedTimeLogSummaryData): string {
	const lines = [
		'# Generated Timelogs Summary',
		'',
		`- Target Email: ${data.email}`,
		`- Input JSON Path: ${data.inputFilePath}`,
		`- Generated Timelog JSON Path: ${data.outputFilePath}`,
		`- Generated Timelog Summary Path: ${data.summaryFilePath}`,
		`- Acceptable Shortfall Hours: ${data.acceptableShortfallHours}`,
		`- Generated Timelog Max Daily Hours: ${data.generatedTimeLogMaxDailyHours}`,
		'',
		'## Summary Metrics',
		'',
		'| Metric | Count |',
		'| --- | ---: |',
		`| Filtered Task Count | ${data.filteredTasks.length} |`,
		`| Tasks Needing Generated Timelogs | ${data.tasksNeedingGeneratedTimeLogs} |`,
		`| Total Generated Timelogs | ${data.totalGeneratedTimeLogs} |`,
		`| Total Planned Billable Hours | ${formatNumberToHours(data.totalPlannedBillableHours)} |`,
		`| Zero Duration Fallback Tasks | ${data.zeroDurationFallbackTasks} |`,
		`| Created-Time-Dated Drafts | ${data.createdTimeDatedDrafts} |`,
		'',
		'## Generated Timelogs By Project And Task',
		'',
	];

	if (data.taskPlans.length === 0) {
		lines.push('No generated timelog drafts were needed for the filtered tasks.');
		return lines.join('\n');
	}

	const sortedPlans = [...data.taskPlans].sort((a, b) => compareTasks(a.task, b.task));
	const projectGroups = new Map<string, { projectName: string; projectId: string; taskPlans: GeneratedTimeLogTaskPlan[] }>();

	for (const plan of sortedPlans) {
		const projectName = formatDisplayText(plan.task.project?.name, 'Unknown project');
		const projectId = formatDisplayText(plan.task.project?.id, 'N/A');
		const projectKey = `${projectName}::${projectId}`;
		const group = projectGroups.get(projectKey) || {
			projectName,
			projectId,
			taskPlans: [],
		};
		group.taskPlans.push(plan);
		projectGroups.set(projectKey, group);
	}

	for (const projectGroup of projectGroups.values()) {
		lines.push(`### Project: ${projectGroup.projectName} (${projectGroup.projectId})`);
		lines.push('');

		for (const plan of projectGroup.taskPlans) {
			const taskId = formatDisplayText(plan.task.id);
			const taskLabel = `${formatDisplayText(plan.task.prefix)} - ${formatDisplayText(plan.task.name)}`;
			lines.push(`#### Task: ${taskLabel} (${taskId})`);
			lines.push('');
			lines.push(
				`Current Billable Hours: ${formatNumberToHours(plan.currentBillableHours)} | Target Threshold Hours: ${formatNumberToHours(plan.targetThresholdHours)} | Additional Hours Needed: ${formatNumberToHours(plan.additionalHoursNeeded)} | Generated Timelog Count: ${plan.generatedDrafts.length}`,
			);
			lines.push('');
			lines.push('| Date | Hours | Start Time | End Time | Used Created At Date |');
			lines.push('| --- | ---: | --- | --- | --- |');

			for (const draft of plan.generatedDrafts) {
				lines.push(
					`| ${escapeMarkdownCell(draft.date)} | ${escapeMarkdownCell(draft.hours)} | ${escapeMarkdownCell(draft.start_time)} | ${escapeMarkdownCell(draft.end_time)} | ${draft.used_created_at_date ? 'true' : 'false'} |`,
				);
			}

			lines.push('');
		}
	}

	return lines.join('\n');
}

export async function writeGeneratedTimeLogsSummaryFile(
	email: string,
	data: Omit<GeneratedTimeLogSummaryData, 'email' | 'outputFilePath' | 'summaryFilePath'> &
		Partial<Pick<GeneratedTimeLogSummaryData, 'outputFilePath' | 'summaryFilePath'>>,
	inputFilePath?: string,
): Promise<void> {
	const normalizedEmail = requireEmail(email);
	const summaryFilePath =
		data.summaryFilePath || getGeneratedTimeLogsSummaryPath(normalizedEmail, inputFilePath);
	const outputFilePath =
		data.outputFilePath || getGeneratedTimeLogsDataPath(normalizedEmail, inputFilePath);
	const summary = formatGeneratedTimeLogsSummary({
		email: normalizedEmail,
		inputFilePath: data.inputFilePath,
		outputFilePath,
		summaryFilePath,
		acceptableShortfallHours: data.acceptableShortfallHours,
		generatedTimeLogMaxDailyHours: data.generatedTimeLogMaxDailyHours,
		filteredTasks: data.filteredTasks,
		tasksNeedingGeneratedTimeLogs: data.tasksNeedingGeneratedTimeLogs,
		totalGeneratedTimeLogs: data.totalGeneratedTimeLogs,
		totalPlannedBillableHours: data.totalPlannedBillableHours,
		zeroDurationFallbackTasks: data.zeroDurationFallbackTasks,
		createdTimeDatedDrafts: data.createdTimeDatedDrafts,
		generatedTimeLogs: data.generatedTimeLogs,
		taskPlans: data.taskPlans,
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
		const filteredOutputFilePath = getFilteredTasksByEmailDataPath(normalizedEmail, resolvedInputPath);
		const filteredSummaryFilePath = getFilteredTasksByEmailSummaryPath(
			normalizedEmail,
			resolvedInputPath,
		);
		const generatedOutputFilePath = getGeneratedTimeLogsDataPath(normalizedEmail, resolvedInputPath);
		const generatedSummaryFilePath = getGeneratedTimeLogsSummaryPath(
			normalizedEmail,
			resolvedInputPath,
		);
		const filteredResult = await filterTasksByEmailWork(
			normalizedEmail,
			resolvedInputPath,
			acceptableShortfallHours,
		);
		const generatedTimeLogResult = generateTimeLogDraftsForFilteredTasks(
			filteredResult.filteredTasks,
			{
				acceptableShortfallHours,
			},
		);

		await writeFilteredTasksByEmailFile(
			normalizedEmail,
			filteredResult.filteredTasks,
			resolvedInputPath,
		);
		await writeFilteredTasksByEmailSummaryFile(
			normalizedEmail,
			{
				inputFilePath: resolvedInputPath,
				outputFilePath: filteredOutputFilePath,
				summaryFilePath: filteredSummaryFilePath,
				acceptableShortfallHours,
				...filteredResult,
			},
			resolvedInputPath,
		);
		await writeGeneratedTimeLogsFile(
			normalizedEmail,
			generatedTimeLogResult.generatedTimeLogs,
			resolvedInputPath,
		);
		await writeGeneratedTimeLogsSummaryFile(
			normalizedEmail,
			{
				inputFilePath: resolvedInputPath,
				outputFilePath: generatedOutputFilePath,
				summaryFilePath: generatedSummaryFilePath,
				acceptableShortfallHours,
				generatedTimeLogMaxDailyHours: getConfiguredGeneratedTimeLogMaxDailyHours(),
				filteredTasks: filteredResult.filteredTasks,
				...generatedTimeLogResult,
			},
			resolvedInputPath,
		);

		console.log(
			[
				formatFilteredTasksByEmailSummary({
					email: normalizedEmail,
					inputFilePath: resolvedInputPath,
					outputFilePath: filteredOutputFilePath,
					summaryFilePath: filteredSummaryFilePath,
					acceptableShortfallHours,
					...filteredResult,
				}),
				'',
				formatGeneratedTimeLogsSummary({
					email: normalizedEmail,
					inputFilePath: resolvedInputPath,
					outputFilePath: generatedOutputFilePath,
					summaryFilePath: generatedSummaryFilePath,
					acceptableShortfallHours,
					generatedTimeLogMaxDailyHours: getConfiguredGeneratedTimeLogMaxDailyHours(),
					filteredTasks: filteredResult.filteredTasks,
					...generatedTimeLogResult,
				}),
			].join('\n'),
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
