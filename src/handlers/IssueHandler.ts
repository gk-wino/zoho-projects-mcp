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
					text: JSON.stringify(data, null, 2),
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
					text: JSON.stringify(data, null, 2),
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
					text: JSON.stringify(data, null, 2),
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
					text: JSON.stringify(data, null, 2),
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
					text: JSON.stringify(data, null, 2),
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
					text: JSON.stringify(data, null, 2),
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

	async getIssueDescription(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/description`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getIssueStatusTransition(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/statustransition`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getIssueLinkedIssues(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/linkedissues`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async linkIssues(params: any) {
		const { project_id, issue_id, link_type, issue_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/link`,
			'POST',
			{ link_type, issue_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async bulkLinkIssues(params: any) {
		const { project_id, link_type, issue_ids, linking_issue_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/bulk-link-bugs`,
			'POST',
			{ link_type, issue_ids, linking_issue_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async changeLinkType(params: any) {
		const { project_id, issue_id, link_id, link_type } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/link/${link_id}`,
			'POST',
			{ link_type },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async unlinkIssues(projectId: string, issueId: string, linkId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/link/${linkId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Issues unlinked successfully',
				},
			],
		};
	}

	async getIssueAssociatedTasks(params: any) {
		const { project_id, issue_id, sindex } = params;
		let url = `/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/associated-tasks`;
		if (sindex) {
			url += `?sindex=${sindex}`;
		}
		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async associateTasksToIssue(params: any) {
		const { project_id, issue_id, task_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/associate-tasks`,
			'POST',
			{ task_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async bulkAssociateTasks(params: any) {
		const { project_id, issue_ids, task_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/bulk-associate-tasks`,
			'POST',
			{ issue_ids, task_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async dissociateTaskFromIssue(projectId: string, issueId: string, taskId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/task/${taskId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Task dissociated successfully',
				},
			],
		};
	}

	async getIssueResolution(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/resolution`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addIssueResolution(params: any) {
		const { project_id, issue_id, resolution, status_id, attachment_ids } = params;

		const requestBody: any = { resolution };
		if (status_id) requestBody.status_id = status_id;
		if (attachment_ids) requestBody.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/resolution`,
			'POST',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async updateIssueResolution(params: any) {
		const { project_id, issue_id, resolution, status_id, attachment_ids } = params;

		const requestBody: any = { resolution };
		if (status_id) requestBody.status_id = status_id;
		if (attachment_ids) requestBody.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/resolution`,
			'PUT',
			requestBody,
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async deleteIssueResolution(projectId: string, issueId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/resolution`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Resolution deleted successfully',
				},
			],
		};
	}

	async getIssueFollowers(projectId: string, issueId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/followers`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async followIssue(params: any) {
		const { project_id, issue_id, follower_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/followers`,
			'POST',
			{ follower_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async removeIssueFollowers(projectId: string, issueId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/followers`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Followers removed successfully',
				},
			],
		};
	}

	async getIssueAttachments(params: any) {
		const { project_id, issue_id, extension_ids, app_types, sub_type } = params;

		let url = `/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/attachments`;
		const queryParams: string[] = [];

		if (extension_ids) queryParams.push(`extension_ids=${JSON.stringify(extension_ids)}`);
		if (app_types) queryParams.push(`app_types=${JSON.stringify(app_types)}`);
		if (sub_type) queryParams.push(`sub_type=${sub_type}`);

		if (queryParams.length > 0) {
			url += `?${queryParams.join('&')}`;
		}

		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async associateIssueAttachments(params: any) {
		const { project_id, issue_id, attachment_ids } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/issues/${issue_id}/attachments`,
			'POST',
			{ attachment_ids },
		);
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(data, null, 2),
				},
			],
		};
	}

	async dissociateIssueAttachment(projectId: string, issueId: string, attachmentId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/issues/${issueId}/attachments/${attachmentId}`,
			'DELETE',
		);
		return {
			content: [
				{
					type: 'text',
					text: 'Attachment dissociated successfully',
				},
			],
		};
	}
}
