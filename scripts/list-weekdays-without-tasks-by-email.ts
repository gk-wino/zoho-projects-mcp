#!/usr/bin/env node

import * as dotenv from 'dotenv';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTasksByEmailDataPath } from './list-tasks-by-email.ts';

type Task = Record<string, unknown> & {
	id?: number | string;
	name?: string;
	start_date?: string;
	end_date?: string;
	created_date?: string;
	completed_date?: string;
	closed_date?: string;
	last_updated_time?: string;
};

export type MissingWeekdayEntry = {
	date: string;
	weekday: string;
};

export type MissingWeekdaysSummaryData = {
	email: string;
	inputFilePath: string;
	summaryFilePath: string;
	targetDate: string;
	asOfDate: string;
	totalTasks: number;
	totalWeekdaysInRange: number;
	coveredWeekdaysCount: number;
	missingWeekdaysCount: number;
	missingWeekdays: MissingWeekdayEntry[];
};

type WeekdaySummaryOptions = {
	targetDate?: string;
	asOfDate?: Date;
};

const DEFAULT_TARGET_EMAIL = 'geoffrey.kimani@volane.com';
const DEFAULT_TARGET_DATE = '2026-01-02';
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

function loadOptionalEnv(): void {
	if (envLoaded) {
		return;
	}

	dotenv.config({ path: envPath });
	envLoaded = true;
}

function resolveTargetEmail(explicitEmail?: string): string {
	if (explicitEmail !== undefined) {
		return requireEmail(explicitEmail);
	}

	loadOptionalEnv();
	return requireEmail(process.env.TARGET_EMAIL || DEFAULT_TARGET_EMAIL);
}

function buildUtcIsoDate(year: number, month: number, day: number, label: string): string {
	const parsed = new Date(Date.UTC(year, month - 1, day));
	if (
		parsed.getUTCFullYear() !== year ||
		parsed.getUTCMonth() + 1 !== month ||
		parsed.getUTCDate() !== day
	) {
		throw new Error(`${label} is invalid: ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
	}

	return parsed.toISOString().slice(0, 10);
}

function parseDateString(value: unknown, label: string): string {
	if (value === undefined || value === null) {
		throw new Error(`${label} is required.`);
	}

	const normalizedValue = String(value).trim();
	if (!normalizedValue) {
		throw new Error(`${label} is required.`);
	}

	const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) {
		const [, year, month, day] = isoMatch;
		return buildUtcIsoDate(Number(year), Number(month), Number(day), label);
	}

	const dmyMatch = normalizedValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (dmyMatch) {
		const [, day, month, year] = dmyMatch;
		return buildUtcIsoDate(Number(year), Number(month), Number(day), label);
	}

	const parsed = new Date(normalizedValue);
	if (Number.isNaN(parsed.getTime())) {
		throw new Error(`${label} is invalid: ${normalizedValue}`);
	}

	return parsed.toISOString().slice(0, 10);
}

function getConfiguredTargetDate(): string {
	loadOptionalEnv();
	return parseDateString(process.env.TARGET_DATE || DEFAULT_TARGET_DATE, 'TARGET_DATE');
}

function getCurrentUtcDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function getSiblingOutputPath(inputFilePath: string, suffix: string): string {
	const resolvedPath = path.resolve(inputFilePath);
	const parsedPath = path.parse(resolvedPath);
	const baseName = parsedPath.ext === '.json' ? parsedPath.name : parsedPath.base;

	return path.resolve(parsedPath.dir, `${baseName}${suffix}`);
}

function resolveInputFilePath(email: string, inputFilePath?: string): string {
	if (inputFilePath !== undefined) {
		const trimmedPath = inputFilePath.trim();
		if (!trimmedPath) {
			throw new Error('An input file path is required when provided.');
		}

		return path.resolve(trimmedPath);
	}

	return getTasksByEmailDataPath(requireEmail(email));
}

function getWeekdayName(date: string): string {
	const [year, month, day] = date.split('-').map(Number);
	const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
	return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday];
}

function isWeekend(date: string): boolean {
	const [year, month, day] = date.split('-').map(Number);
	const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
	return weekday === 0 || weekday === 6;
}

function addDays(date: string, days: number): string {
	const [year, month, day] = date.split('-').map(Number);
	const shifted = new Date(Date.UTC(year, month - 1, day + days));
	return shifted.toISOString().slice(0, 10);
}

function buildWeekdaysInRange(startDate: string, endDate: string): string[] {
	if (startDate > endDate) {
		throw new Error('TARGET_DATE cannot be after the as-of date.');
	}

	const dates: string[] = [];
	let currentDate = startDate;
	while (currentDate <= endDate) {
		if (!isWeekend(currentDate)) {
			dates.push(currentDate);
		}

		currentDate = addDays(currentDate, 1);
	}

	return dates;
}

function normalizeTaskDate(value: unknown): string | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	const normalized = value.trim();
	if (!normalized) {
		return undefined;
	}

	const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (isoMatch) {
		const [, year, month, day] = isoMatch;
		return buildUtcIsoDate(Number(year), Number(month), Number(day), 'Task date');
	}

	const dmyMatch = normalized.match(/^(\d{2})-(\d{2})-(\d{4})$/);
	if (dmyMatch) {
		return buildUtcIsoDate(Number(dmyMatch[3]), Number(dmyMatch[2]), Number(dmyMatch[1]), 'Task date');
	}

	const parsed = new Date(normalized);
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	return parsed.toISOString().slice(0, 10);
}

function getTaskCoverageRange(task: Task): { startDate: string; endDate: string } | undefined {
	const normalizedStartDate =
		normalizeTaskDate(task.start_date) ||
		normalizeTaskDate(task.created_date) ||
		normalizeTaskDate(task.completed_date) ||
		normalizeTaskDate(task.closed_date) ||
		normalizeTaskDate(task.last_updated_time);
	if (!normalizedStartDate) {
		return undefined;
	}

	const normalizedEndDate =
		normalizeTaskDate(task.end_date) ||
		normalizeTaskDate(task.completed_date) ||
		normalizeTaskDate(task.closed_date) ||
		normalizedStartDate;

	if (normalizedEndDate < normalizedStartDate) {
		return {
			startDate: normalizedStartDate,
			endDate: normalizedStartDate,
		};
	}

	return {
		startDate: normalizedStartDate,
		endDate: normalizedEndDate,
	};
}

function collectTaskWeekdays(tasks: Task[]): Set<string> {
	const coveredWeekdays = new Set<string>();

	for (const task of tasks) {
		const range = getTaskCoverageRange(task);
		if (!range) {
			continue;
		}

		for (const date of buildWeekdaysInRange(range.startDate, range.endDate)) {
			coveredWeekdays.add(date);
		}
	}

	return coveredWeekdays;
}

async function readTasksFile(inputFilePath: string): Promise<Task[]> {
	const data = JSON.parse(await fsp.readFile(inputFilePath, 'utf8')) as unknown;
	if (!Array.isArray(data)) {
		throw new Error('Task input file must contain a JSON array.');
	}

	return data as Task[];
}

export function getMissingWeekdaysSummaryPath(email: string, inputFilePath?: string): string {
	const resolvedInputPath = resolveInputFilePath(requireEmail(email), inputFilePath);
	return getSiblingOutputPath(resolvedInputPath, '-missing-weekdays-summary.md');
}

export async function summarizeMissingWeekdaysByEmail(
	email: string = DEFAULT_TARGET_EMAIL,
	inputFilePath?: string,
	options: WeekdaySummaryOptions = {},
): Promise<MissingWeekdaysSummaryData> {
	const normalizedEmail = requireEmail(email);
	const resolvedInputPath = resolveInputFilePath(normalizedEmail, inputFilePath);
	const tasks = await readTasksFile(resolvedInputPath);
	const targetDate = parseDateString(options.targetDate || getConfiguredTargetDate(), 'TARGET_DATE');
	const asOfDate = parseDateString(
		options.asOfDate?.toISOString().slice(0, 10) || getCurrentUtcDate(),
		'AS_OF_DATE',
	);
	const weekdayRange = buildWeekdaysInRange(targetDate, asOfDate);
	const taskWeekdays = collectTaskWeekdays(tasks);
	const missingWeekdays = weekdayRange
		.filter((date) => !taskWeekdays.has(date))
		.map((date) => ({
			date,
			weekday: getWeekdayName(date),
		}));

	return {
		email: normalizedEmail,
		inputFilePath: resolvedInputPath,
		summaryFilePath: getMissingWeekdaysSummaryPath(normalizedEmail, resolvedInputPath),
		targetDate,
		asOfDate,
		totalTasks: tasks.length,
		totalWeekdaysInRange: weekdayRange.length,
		coveredWeekdaysCount: taskWeekdays.size,
		missingWeekdaysCount: missingWeekdays.length,
		missingWeekdays,
	};
}

export function formatMissingWeekdaysSummary(data: MissingWeekdaysSummaryData): string {
	const lines = [
		'# Missing Weekdays Summary',
		'',
		`- Target Email: ${data.email}`,
		`- Input JSON Path: ${data.inputFilePath}`,
		`- Summary Markdown Path: ${data.summaryFilePath}`,
		`- Target Date: ${data.targetDate}`,
		`- As Of Date: ${data.asOfDate}`,
		'',
		'## Summary Metrics',
		'',
		'| Metric | Count |',
		'| --- | ---: |',
		`| Tasks Considered | ${data.totalTasks} |`,
		`| Weekdays In Range | ${data.totalWeekdaysInRange} |`,
		`| Weekdays With Tasks | ${data.coveredWeekdaysCount} |`,
		`| Weekdays With No Tasks | ${data.missingWeekdaysCount} |`,
		'',
		'## Weekdays With No Tasks',
		'',
	];

	if (data.missingWeekdays.length === 0) {
		lines.push('No missing weekdays were found for the selected date range.');
		return lines.join('\n');
	}

	lines.push('| Date | Weekday |');
	lines.push('| --- | --- |');

	for (const entry of data.missingWeekdays) {
		lines.push(`| ${entry.date} | ${entry.weekday} |`);
	}

	return lines.join('\n');
}

export async function writeMissingWeekdaysSummaryFile(
	email: string,
	summary: string,
	inputFilePath?: string,
): Promise<void> {
	const summaryFilePath = getMissingWeekdaysSummaryPath(email, inputFilePath);
	await fsp.mkdir(path.dirname(summaryFilePath), { recursive: true });
	await fsp.writeFile(summaryFilePath, `${summary}\n`, 'utf8');
}

async function main(): Promise<void> {
	try {
		const targetEmail = resolveTargetEmail(process.argv[2]);
		const inputFilePath = process.argv[3];
		const report = await summarizeMissingWeekdaysByEmail(targetEmail, inputFilePath);
		const summary = formatMissingWeekdaysSummary(report);

		await writeMissingWeekdaysSummaryFile(targetEmail, summary, inputFilePath);
		console.log(summary);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to summarize missing weekdays by email: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

if (isEntrypoint) {
	await main();
}
