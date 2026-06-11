import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ZohoClient } from '../core/ZohoClient.js';

type RunningTimerType = 'all' | 'generic' | 'task' | 'issue';
type TimerModuleType = 'task' | 'issue' | 'general';
type TimerEntityType = 'task' | 'issue';

type RunningTimerParams = {
	type?: RunningTimerType;
	for_all?: string;
};

type TimerLogParams = {
	project_id: string;
	entity_type: TimerEntityType;
	log_id: string;
};

function ensureProjectId(projectId?: string): string {
	if (!projectId) {
		throw new McpError(ErrorCode.InvalidParams, 'project_id is required');
	}

	return projectId;
}

function ensureTimerId(timerId?: string): string {
	if (!timerId) {
		throw new McpError(ErrorCode.InvalidParams, 'timer_id is required');
	}

	return timerId;
}

function ensureLogId(logId?: string): string {
	if (!logId) {
		throw new McpError(ErrorCode.InvalidParams, 'log_id is required');
	}

	return logId;
}

function ensureRunningTimerType(type?: string): RunningTimerType | undefined {
	if (!type) {
		return undefined;
	}

	if (!['all', 'generic', 'task', 'issue'].includes(type)) {
		throw new McpError(ErrorCode.InvalidParams, 'type must be one of: all, generic, task, issue');
	}

	return type as RunningTimerType;
}

function ensureTimerModuleType(type?: string): TimerModuleType {
	if (!type || !['task', 'issue', 'general'].includes(type)) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'type is required and must be one of: task, issue, general',
		);
	}

	return type as TimerModuleType;
}

function ensureTimerEntityType(entityType?: string): TimerEntityType {
	if (!entityType || !['task', 'issue'].includes(entityType)) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'entity_type is required and must be one of: task, issue',
		);
	}

	return entityType as TimerEntityType;
}

function buildQuery(params: Record<string, unknown>): string {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) {
			continue;
		}

		query.append(key, String(value));
	}

	const queryString = query.toString();
	return queryString ? `?${queryString}` : '';
}

export class TimerHandler {
	constructor(private client: ZohoClient) {}

	async getRunningTimers(params: RunningTimerParams = {}) {
		const query = buildQuery({
			type: ensureRunningTimerType(params.type),
			for_all: params.for_all,
		});

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers${query}`,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async startTimer(params: Record<string, unknown>) {
		const requestBody: Record<string, unknown> = {};

		if (params.entity_id) requestBody.entity_id = params.entity_id;
		if (params.project_id) requestBody.project_id = params.project_id;
		if (params.module_id) requestBody.module_id = params.module_id;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers`,
			'POST',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTimerDetailsByLogId(params: TimerLogParams) {
		const projectId = ensureProjectId(params.project_id);
		const entityType = ensureTimerEntityType(params.entity_type);
		const logId = ensureLogId(params.log_id);

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/${entityType}/timelogs/${logId}/timers`,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async pauseTimer(params: Record<string, unknown>) {
		const timerId = ensureTimerId(params.timer_id as string);
		const type = ensureTimerModuleType(params.type as string);
		const requestBody: Record<string, unknown> = { type };

		if (params.notes) requestBody.notes = params.notes;
		if (params.log_id) requestBody.log_id = params.log_id;
		if (params.entity_id) requestBody.entity_id = params.entity_id;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers/${timerId}/pause`,
			'PATCH',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async resumeTimer(params: Record<string, unknown>) {
		const timerId = ensureTimerId(params.timer_id as string);
		const type = ensureTimerModuleType(params.type as string);
		const requestBody: Record<string, unknown> = { type };

		if (params.notes) requestBody.notes = params.notes;
		if (params.log_id) requestBody.log_id = params.log_id;
		if (params.entity_id) requestBody.entity_id = params.entity_id;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers/${timerId}/resume`,
			'PATCH',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async stopTimer(params: Record<string, unknown>) {
		const timerId = ensureTimerId(params.timer_id as string);
		const type = ensureTimerModuleType(params.type as string);
		const date = params.date as string | undefined;
		const billStatus = params.bill_status as string | undefined;

		if (!date) {
			throw new McpError(ErrorCode.InvalidParams, 'date is required');
		}

		if (!billStatus) {
			throw new McpError(ErrorCode.InvalidParams, 'bill_status is required');
		}

		const requestBody: Record<string, unknown> = {
			date,
			type,
			bill_status: billStatus,
		};

		if (params.item_id) requestBody.item_id = params.item_id;
		if (params.log_name) requestBody.log_name = params.log_name;
		if (params.project_id) requestBody.project_id = params.project_id;
		if (params.hours) requestBody.hours = params.hours;
		if (params.start_time) requestBody.start_time = params.start_time;
		if (params.end_time) requestBody.end_time = params.end_time;
		if (params.notes) requestBody.notes = params.notes;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers/${timerId}/stop`,
			'PATCH',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async deleteTimer(timerId: string) {
		const resolvedTimerId = ensureTimerId(timerId);

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/timelogs/timers/${resolvedTimerId}`,
			'DELETE',
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
