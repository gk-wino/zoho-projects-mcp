import { ZohoClient } from '../core/ZohoClient.js';

export class ProjectHandler {
	constructor(private client: ZohoClient) {}

	async listProjects(page: number = 1, perPage: number = 10) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects?page=${page}&per_page=${perPage}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getProject(projectId: string) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createProject(params: any) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects`,
			'POST',
			params,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Project created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async updateProject(params: any) {
		const { project_id, ...updateData } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}`,
			'PATCH',
			updateData,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Project updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async trashProject(projectId: string) {
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/trash`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Project moved to trash successfully. It can be restored within 30 days.`,
				},
			],
		};
	}
}
