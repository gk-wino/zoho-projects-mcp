import { ZohoClient } from '../core/ZohoClient.js';

export class IssueHandler {
	constructor(private client: ZohoClient) {}

	async listIssues(projectId?: string, page: number = 1, perPage: number = 10) {
		const endpoint = projectId
			? `/portal/${this.client.getPortalId()}/projects/${projectId}/issues?page=${page}&per_page=${perPage}`
			: `/portal/${this.client.getPortalId()}/issues?page=${page}&per_page=${perPage}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getIssue(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createIssue(params: any) {
		const { project_id, assignee_zpuid, severity_id, classification_id, module_id, ...issueData } =
			params;

		// Build request body with proper structure
		const requestBody: any = {
			...issueData,
		};

		// Add assignee if provided
		if (assignee_zpuid) {
			requestBody.assignee = { zpuid: assignee_zpuid };
		}

		// Add severity if provided
		if (severity_id) {
			requestBody.severity = { id: severity_id };
		}

		// Add classification if provided
		if (classification_id) {
			requestBody.classification = { id: classification_id };
		}

		// Add module if provided
		if (module_id) {
			requestBody.module = { id: module_id };
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues`,
			'POST',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Issue created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async updateIssue(params: any) {
		const {
			project_id,
			issue_id,
			assignee_zpuid,
			severity_id,
			classification_id,
			module_id,
			...issueData
		} = params;

		// Build request body with proper structure
		const requestBody: any = {
			...issueData,
		};

		// Add assignee if provided
		if (assignee_zpuid) {
			requestBody.assignee = { zpuid: assignee_zpuid };
		}

		// Add severity if provided
		if (severity_id) {
			requestBody.severity = { id: severity_id };
		}

		// Add classification if provided
		if (classification_id) {
			requestBody.classification = { id: classification_id };
		}

		// Add module if provided
		if (module_id) {
			requestBody.module = { id: module_id };
		}

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}`,
			'PATCH',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Issue updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async deleteIssue(projectId: string, issueId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Issue deleted successfully',
				},
			],
		};
	}

	async moveIssue(params: any) {
		const { project_id, issue_id, to_project } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/move`,
			'POST',
			{ to_project },
		);
		return {
			content: [
				{
					type: 'text',
					text: `Issue moved successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async cloneIssue(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/clone`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Issue cloned successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async getIssueActivities(params: any) {
		const { project_id, issue_id, page = 1, per_page = 10 } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/activities?page=${page}&per_page=${per_page}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getIssueComments(params: any) {
		const { project_id, issue_id, page = 1, per_page = 10 } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/comments?page=${page}&per_page=${per_page}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addIssueComment(params: any) {
		const { project_id, issue_id, comment, notify_users, attachment_ids } = params;

		const requestBody: any = { comment };
		if (notify_users) requestBody.notify_users = notify_users;
		if (attachment_ids) requestBody.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/comments`,
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

	async updateIssueComment(params: any) {
		const { project_id, issue_id, comment_id, comment, notify_users, attachment_ids } = params;

		const requestBody: any = { comment };
		if (notify_users) requestBody.notify_users = notify_users;
		if (attachment_ids) requestBody.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/comments/${comment_id}`,
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

	async deleteIssueComment(projectId: string, issueId: string, commentId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Comment deleted successfully',
				},
			],
		};
	}
}
