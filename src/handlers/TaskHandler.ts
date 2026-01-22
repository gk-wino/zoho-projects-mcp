import { ZohoClient } from '../core/ZohoClient.js';

export class TaskHandler {
	constructor(private client: ZohoClient) {}

	async listTasks(projectId?: string, page: number = 1, perPage: number = 10) {
		const endpoint = projectId
			? `/portal/${this.client.getPortalId()}/projects/${projectId}/tasks?page=${page}&per_page=${perPage}`
			: `/portal/${this.client.getPortalId()}/tasks?page=${page}&per_page=${perPage}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTask(projectId: string, taskId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createTask(params: any) {
		const { project_id, tasklist_id, parent_task_id, assignee_zpuid, ...taskData } = params;

		// Build task data according to API spec
		const requestBody: any = {
			...taskData,
		};

		// Add tasklist if provided, otherwise API will use general tasklist
		if (tasklist_id) {
			requestBody.tasklist = { id: tasklist_id };
		}

		// Add parental_info if parent_task_id is provided (for creating subtasks)
		if (parent_task_id) {
			requestBody.parental_info = { parent_task_id: parent_task_id };
		}

		// Add owners_and_work if assignee is provided
		if (assignee_zpuid) {
			requestBody.owners_and_work = {
				owners: [
					{
						zpuid: assignee_zpuid,
					},
				],
			};
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks`,
			'POST',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async updateTask(params: any) {
		const { project_id, task_id, tasklist_id, ...taskData } = params;

		// Build task data according to API spec
		const requestBody: any = {
			...taskData,
		};

		// Add tasklist if provided (for moving task to different task list)
		if (tasklist_id) {
			requestBody.tasklist = { id: tasklist_id };
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}`,
			'PATCH',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async deleteTask(projectId: string, taskId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task deleted successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async cloneTask(params: any) {
		const { project_id, task_id, no_of_instances } = params;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}/clone`,
			'POST',
			{ no_of_instances: no_of_instances },
			false,
			'application/x-www-form-urlencoded',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task cloned successfully (${no_of_instances} instance(s)):\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async moveTask(params: any) {
		const { project_id, task_id, target_tasklist_id } = params;
		const requestBody: any = {
			target_tasklist_id: target_tasklist_id,
		};

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}/move`,
			'POST',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Task moved successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async getAssociatedBugs(projectId: string, taskId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}/associated-bugs`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async associateBugs(params: any) {
		const { project_id, task_id, bug_ids } = params;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}/associate-bugs`,
			'POST',
			{ bug_ids: bug_ids },
			false,
			'application/x-www-form-urlencoded',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Bugs associated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async disassociateBug(projectId: string, taskId: string, bugId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}/bug/${bugId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Bug disassociated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async listTaskComments(
		projectId: string,
		taskId: string,
		page: number = 1,
		perPage: number = 10,
		sortBy?: string,
	) {
		let endpoint = `/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}/comments?page=${page}&per_page=${perPage}`;
		if (sortBy) {
			endpoint += `&sort_by=${encodeURIComponent(sortBy)}`;
		}
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addTaskComment(params: any) {
		const { project_id, task_id, comment, attachments } = params;

		const requestBody: any = {
			comment: comment,
		};

		if (attachments && Array.isArray(attachments) && attachments.length > 0) {
			requestBody.attachments = attachments;
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}/comments`,
			'POST',
			requestBody,
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

	async updateTaskComment(params: any) {
		const { project_id, task_id, comment_id, comment, attachments } = params;

		const requestBody: any = {
			comment: comment,
		};

		if (attachments && Array.isArray(attachments) && attachments.length > 0) {
			requestBody.attachments = attachments;
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/tasks/${task_id}/comments/${comment_id}`,
			'PATCH',
			requestBody,
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

	async deleteTaskComment(projectId: string, taskId: string, commentId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
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
}
