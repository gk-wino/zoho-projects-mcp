import { ZohoClient } from '../core/ZohoClient.js';

export class TaskListHandler {
	constructor(private client: ZohoClient) {}

	async listTaskLists(projectId?: string, page: number = 1, perPage: number = 10) {
		const endpoint = projectId
			? `/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists?page=${page}&per_page=${perPage}`
			: `/portal/${this.client.getPortalId()}/all-tasklists?page=${page}&per_page=${perPage}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTaskList(projectId: string, tasklistId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createTaskList(params: any) {
		const { project_id, name, milestone_id, flag, status } = params;
		const tasklistData: any = { name };

		if (milestone_id) {
			tasklistData.milestone = { id: milestone_id };
		}
		if (flag) {
			tasklistData.flag = flag;
		}
		if (status) {
			tasklistData.status = status;
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists`,
			'POST',
			tasklistData,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task list created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async updateTaskList(params: any) {
		const { project_id, tasklist_id, name, milestone_id, flag, status } = params;
		const tasklistData: any = {};

		if (name) tasklistData.name = name;
		if (milestone_id) {
			tasklistData.milestone = { id: milestone_id };
		}
		if (flag) tasklistData.flag = flag;
		if (status) tasklistData.status = status;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists/${tasklist_id}`,
			'PATCH',
			tasklistData,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task list updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async deleteTaskList(projectId: string, tasklistId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task list deleted successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async createDefaultTaskList(projectId: string, flag: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/default-tasklists`,
			'POST',
			{ flag },
		);
		return {
			content: [
				{
					type: 'text',
					text: `Default task list created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}
}
