import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ZohoClient } from '../core/ZohoClient.js';

type ModuleType = 'task' | 'issue' | 'general';

type TimeLogListParams = {
	project_id: string;
	view_type: string;
	start_date?: string;
	end_date?: string;
	page?: number;
	per_page?: number;
	module_type?: ModuleType;
	module_id?: string;
	fetch_by_modified_time?: boolean;
};

type TimeLogGetParams = {
	project_id: string;
	log_id: string;
	module_type: ModuleType;
};

type TimeLogMutationParams = {
	project_id: string;
	log_id?: string;
	module_type: ModuleType;
	module_id?: string;
};

function ensureProjectId(projectId?: string): string {
	if (!projectId) {
		throw new McpError(ErrorCode.InvalidParams, 'project_id is required');
	}

	return projectId;
}

function ensureLogId(logId?: string): string {
	if (!logId) {
		throw new McpError(ErrorCode.InvalidParams, 'log_id is required');
	}

	return logId;
}

function ensureModuleType(moduleType?: string): ModuleType {
	if (!moduleType || !['task', 'issue', 'general'].includes(moduleType)) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'module_type is required and must be one of: task, issue, general',
		);
	}

	return moduleType as ModuleType;
}

function ensureModuleId(moduleType: ModuleType, moduleId?: string): string | undefined {
	if (moduleType !== 'general' && !moduleId) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'module_id is required when module_type is task or issue',
		);
	}

	return moduleId;
}

function ensureCustomDateWindow(viewType?: string, startDate?: string, endDate?: string) {
	if (viewType === 'customdate' && (!startDate || !endDate)) {
		throw new McpError(
			ErrorCode.InvalidParams,
			'start_date and end_date are required when view_type is customdate',
		);
	}
}

function buildModulePayload(moduleType: ModuleType, moduleId?: string) {
	if (moduleType === 'general') {
		return { type: moduleType };
	}

	return {
		type: moduleType,
		id: ensureModuleId(moduleType, moduleId),
	};
}

function buildQuery(params: Record<string, unknown>): string {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) {
			continue;
		}

		if (typeof value === 'object') {
			query.append(key, JSON.stringify(value));
			continue;
		}

		query.append(key, String(value));
	}

	const queryString = query.toString();
	return queryString ? `?${queryString}` : '';
}

export class TimeLogHandler {
	constructor(private client: ZohoClient) {}

	async listTimeLogs(params: TimeLogListParams) {
		const projectId = ensureProjectId(params.project_id);
		ensureCustomDateWindow(params.view_type, params.start_date, params.end_date);

		const moduleType = params.module_type ? ensureModuleType(params.module_type) : 'general';
		const module = buildModulePayload(moduleType, params.module_id);

		const query = buildQuery({
			page: params.page ?? 1,
			per_page: params.per_page ?? 10,
			view_type: params.view_type,
			start_date: params.start_date,
			end_date: params.end_date,
			module,
			fetch_by_modified_time: params.fetch_by_modified_time,
		});

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/timelogs${query}`,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTimeLog(params: TimeLogGetParams) {
		const projectId = ensureProjectId(params.project_id);
		const logId = ensureLogId(params.log_id);
		const moduleType = ensureModuleType(params.module_type);
		const query = buildQuery({ type: moduleType });

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/logs/${logId}${query}`,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createTimeLog(params: Record<string, unknown>) {
		const projectId = ensureProjectId(params.project_id as string);
		const moduleType = ensureModuleType(params.module_type as string);
		const moduleId = ensureModuleId(moduleType, params.module_id as string | undefined);

		const { project_id, module_type, module_id, ...body } = params;
		const requestBody = {
			...body,
			module: buildModulePayload(moduleType, moduleId),
		};

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/log`,
			'POST',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async updateTimeLog(params: Record<string, unknown>) {
		const projectId = ensureProjectId(params.project_id as string);
		const logId = ensureLogId(params.log_id as string);
		const moduleType = ensureModuleType(params.module_type as string);
		const moduleId = params.module_id as string | undefined;

		const { project_id, log_id, module_type, module_id, ...body } = params;
		const requestBody: Record<string, unknown> = {
			...body,
			module: buildModulePayload(moduleType, moduleId),
		};

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/logs/${logId}`,
			'PATCH',
			requestBody,
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async deleteTimeLog(params: TimeLogMutationParams) {
		const projectId = ensureProjectId(params.project_id);
		const logId = ensureLogId(params.log_id);
		const moduleType = ensureModuleType(params.module_type);

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/logs/${logId}`,
			'DELETE',
			{ module: moduleType },
		);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
