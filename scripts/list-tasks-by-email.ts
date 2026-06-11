#!/usr/bin/env node

import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAllProjects } from './list-projects.ts';
import { listProjectTasks } from './list-tasks.ts';

type TaskOwner = {
	name?: string;
	email?: string;
};

type TaskProject = {
	id?: number | string;
	name?: string;
};

type Task = Record<string, unknown> & {
	id?: number | string;
	name?: string;
	project?: TaskProject;
	status?: {
		name?: string;
	};
	owners_and_work?: {
		owners?: TaskOwner[];
	};
	created_by?: {
		name?: string;
		email?: string;
	};
};

const DEFAULT_TARGET_EMAIL = 'geoffrey.kimani@volane.com';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function requireEmail(email: string): string {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail) {
		throw new Error('A target email is required.');
	}

	return normalizedEmail;
}

function sanitizeEmailForFilename(email: string): string {
	return requireEmail(email).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getTasksByEmailDataPath(email: string): string {
	return path.resolve(
		repoRoot,
		'data',
		`tasks-${sanitizeEmailForFilename(email)}.json`,
	);
}

export function taskMatchesEmail(task: Task, email: string): boolean {
	const normalizedEmail = requireEmail(email);
	const ownerEmails =
		task.owners_and_work?.owners
			?.map((owner) => owner.email?.trim().toLowerCase())
			.filter((ownerEmail): ownerEmail is string => Boolean(ownerEmail)) || [];

	if (ownerEmails.includes(normalizedEmail)) {
		return true;
	}

	return task.created_by?.email?.trim().toLowerCase() === normalizedEmail;
}

export async function listAllTasksByEmail(
	email: string = DEFAULT_TARGET_EMAIL,
): Promise<{ projectsScanned: number; allTasks: Task[]; matchedTasks: Task[] }> {
	const normalizedEmail = requireEmail(email);
	const projects = await listAllProjects(100);
	const scannableProjects = projects.filter(
		(project): project is { id: number | string; name?: string } =>
			project.id !== undefined && project.id !== null && String(project.id).trim().length > 0,
	);
	const allTasks: Task[] = [];

	for (const project of scannableProjects) {
		const taskData = await listProjectTasks(String(project.id), 100);
		allTasks.push(...(taskData.tasks as Task[]));
	}

	const matchedTasks = allTasks.filter((task) => taskMatchesEmail(task, normalizedEmail));

	return {
		projectsScanned: scannableProjects.length,
		allTasks,
		matchedTasks,
	};
}

export async function writeTasksByEmailFile(email: string, tasks: Task[]): Promise<void> {
	const dataPath = getTasksByEmailDataPath(email);
	await fsp.mkdir(path.dirname(dataPath), { recursive: true });
	await fsp.writeFile(dataPath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
}

export function formatTasksByEmailSummary(
	email: string,
	projectsScanned: number,
	allTasks: Task[],
	matchedTasks: Task[],
): string {
	const normalizedEmail = requireEmail(email);
	const lines = [
		`Target email: ${normalizedEmail}`,
		`Projects scanned: ${projectsScanned}`,
		`Total fetched tasks: ${allTasks.length}`,
		`Matched tasks: ${matchedTasks.length}`,
	];

	if (matchedTasks.length === 0) {
		lines.push('No tasks matched the supplied email.');
	} else {
		for (const [index, task] of matchedTasks.entries()) {
			const status = task.status?.name || 'N/A';
			const owner = task.owners_and_work?.owners?.[0]?.name || task.created_by?.name || 'N/A';
			const projectName = task.project?.name || 'Unknown project';
			const projectId = task.project?.id || 'N/A';

			lines.push(
				`${index + 1}. ${task.name || 'Unnamed task'} (ID: ${task.id || 'N/A'}) - Project: ${projectName} (${projectId}) - Status: ${status} - Owner: ${owner}`,
			);
		}
	}

	return lines.join('\n');
}

async function main(): Promise<void> {
	try {
		const targetEmail = process.argv[2] || DEFAULT_TARGET_EMAIL;
		const { projectsScanned, allTasks, matchedTasks } = await listAllTasksByEmail(targetEmail);

		await writeTasksByEmailFile(targetEmail, matchedTasks);
		console.log(formatTasksByEmailSummary(targetEmail, projectsScanned, allTasks, matchedTasks));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to list tasks by email: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}
