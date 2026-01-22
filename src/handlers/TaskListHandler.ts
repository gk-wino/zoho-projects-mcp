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

	// Comments operations
	async getTaskListComments(params: any) {
		const { project_id, tasklist_id, page = 1, per_page = 25, sort_by } = params;
		let url = `/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists/${tasklist_id}/comments?page=${page}&per_page=${per_page}`;

		if (sort_by) {
			url += `&sort_by=${sort_by}`;
		}

		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTaskListComment(projectId: string, tasklistId: string, commentId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}/comments/${commentId}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addTaskListComment(params: any) {
		const { project_id, tasklist_id, comment, attachment_ids } = params;
		const body: any = { comment };

		if (attachment_ids && attachment_ids.length > 0) {
			body.attachments = attachment_ids;
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists/${tasklist_id}/comments`,
			'POST',
			body,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Comment added successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async updateTaskListComment(params: any) {
		const { project_id, tasklist_id, comment_id, comment, attachment_ids } = params;
		const body: any = { comment };

		if (attachment_ids && attachment_ids.length > 0) {
			body.attachments = attachment_ids;
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists/${tasklist_id}/comments/${comment_id}`,
			'PATCH',
			body,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Comment updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async deleteTaskListComment(projectId: string, tasklistId: string, commentId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}/comments/${commentId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Comment deleted successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	// Followers operations
	async getTaskListFollowers(params: any) {
		const { project_id, tasklist_id, page = 1, per_page = 25 } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasklists/${tasklist_id}/followers?page=${page}&per_page=${per_page}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async followTaskList(projectId: string, tasklistId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}/follow`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Successfully followed task list:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async unfollowTaskList(projectId: string, tasklistId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}/unfollow`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Successfully unfollowed task list:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	// Template operations
	async getTaskListTemplates(page: number = 1, perPage: number = 25) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/templates/tasklists?page=${page}&per_page=${perPage}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTasksFromTaskListTemplate(tasklistId: string, page: number = 1, perPage: number = 25) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/templates/tasklists/${tasklistId}/tasks?page=${page}&per_page=${perPage}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async makeTaskListTemplate(projectId: string, tasklistId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasklists/${tasklistId}/make-as-template`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task list converted to template successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}
}
