#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	formatMissingWeekdaysSummary,
	getMissingWeekdaysSummaryPath,
	summarizeMissingWeekdaysByEmail,
	writeMissingWeekdaysSummaryFile,
} from '../../scripts/list-weekdays-without-tasks-by-email.ts';

const targetEmail = 'geoffrey.kimani@volane.com';

async function main() {
	const originalExcludedDates = process.env.EXCLUDED_DATES;
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'list-weekdays-without-tasks-'));
	const inputPath = path.join(tempDir, 'tasks-geoffrey-kimani-volane-com.json');

	const fixtureTasks = [
		{
			id: 'task-1',
			name: 'Monday work',
			start_date: '2026-01-05T08:00:00.000Z',
			end_date: '2026-01-05T17:00:00.000Z',
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
		{
			id: 'task-2',
			name: 'Midweek work',
			start_date: '2026-01-07T08:00:00.000Z',
			end_date: '2026-01-08T17:00:00.000Z',
			owners_and_work: {
				owners: [{ email: targetEmail, name: 'Geoffrey' }],
			},
			created_by: { email: targetEmail, name: 'Geoffrey' },
		},
	];

	await fs.writeFile(inputPath, `${JSON.stringify(fixtureTasks, null, 2)}\n`, 'utf8');

	try {
		delete process.env.EXCLUDED_DATES;

		const kenyaHolidayReport = await summarizeMissingWeekdaysByEmail(targetEmail, inputPath, {
			targetDate: '01-01-2026',
			asOfDate: new Date('2026-01-02T00:00:00.000Z'),
		});

		assert.equal(kenyaHolidayReport.email, targetEmail);
		assert.equal(kenyaHolidayReport.targetDate, '2026-01-01');
		assert.equal(kenyaHolidayReport.asOfDate, '2026-01-02');
		assert.equal(kenyaHolidayReport.totalTasks, 2);
		assert.equal(kenyaHolidayReport.totalWeekdaysInRange, 2);
		assert.equal(kenyaHolidayReport.excludedDatesCount, 1);
		assert.equal(kenyaHolidayReport.coveredWeekdaysCount, 3);
		assert.equal(kenyaHolidayReport.missingWeekdaysCount, 1);
		assert.deepEqual(kenyaHolidayReport.excludedDates, [{ date: '2026-01-01', weekday: 'Thursday' }]);
		assert.deepEqual(kenyaHolidayReport.missingWeekdays, [{ date: '2026-01-02', weekday: 'Friday' }]);

		const kenyaHolidaySummary = formatMissingWeekdaysSummary(kenyaHolidayReport);
		const summaryPath = getMissingWeekdaysSummaryPath(targetEmail, inputPath);
		await writeMissingWeekdaysSummaryFile(targetEmail, kenyaHolidaySummary, inputPath);
		const writtenSummary = await fs.readFile(summaryPath, 'utf8');

		assert.match(kenyaHolidaySummary, /# Missing Weekdays Summary/);
		assert.match(kenyaHolidaySummary, /Target Date:\s*2026-01-01/);
		assert.match(kenyaHolidaySummary, /\| 2026-01-01 \| Thursday \|/);
		assert.match(kenyaHolidaySummary, /\| 2026-01-02 \| Friday \|/);
		assert.equal(writtenSummary, `${kenyaHolidaySummary}\n`);

		process.env.EXCLUDED_DATES = '2026-01-06';

		const report = await summarizeMissingWeekdaysByEmail(targetEmail, inputPath, {
			targetDate: '02-01-2026',
			asOfDate: new Date('2026-01-08T00:00:00.000Z'),
		});

		assert.equal(report.email, targetEmail);
		assert.equal(report.targetDate, '2026-01-02');
		assert.equal(report.asOfDate, '2026-01-08');
		assert.equal(report.totalTasks, 2);
		assert.equal(report.totalWeekdaysInRange, 5);
		assert.equal(report.excludedDatesCount, 1);
		assert.equal(report.coveredWeekdaysCount, 3);
		assert.equal(report.missingWeekdaysCount, 1);
		assert.deepEqual(report.excludedDates, [{ date: '2026-01-06', weekday: 'Tuesday' }]);
		assert.deepEqual(report.missingWeekdays, [{ date: '2026-01-02', weekday: 'Friday' }]);

		const summary = formatMissingWeekdaysSummary(report);
		assert.match(summary, /# Missing Weekdays Summary/);
		assert.match(summary, /Target Date:\s*2026-01-02/);
		assert.match(summary, /\| 2026-01-06 \| Tuesday \|/);
		assert.match(summary, /\| 2026-01-02 \| Friday \|/);
	} finally {
		if (originalExcludedDates === undefined) {
			delete process.env.EXCLUDED_DATES;
		} else {
			process.env.EXCLUDED_DATES = originalExcludedDates;
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
