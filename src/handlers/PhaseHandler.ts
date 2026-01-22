import { ZohoClient } from '../core/ZohoClient.js';

export class PhaseHandler {
	constructor(private client: ZohoClient) {}

	async listPhases(projectId: string, page: number = 1, perPage: number = 10) {
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${projectId}/phases?page=${page}&per_page=${perPage}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async createPhase(params: any) {
		const { project_id, ...phaseData } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases`,
			'POST',
			phaseData,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Phase created successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}
}

export class SearchHandler {
	constructor(private client: ZohoClient) {}

	async search(params: any) {
		const { search_term, project_id, module = 'all', page = 1, per_page = 10 } = params;
		const endpoint = project_id
			? `/portal/${this.client.getPortalId()}/projects/${project_id}/search?search_term=${encodeURIComponent(search_term)}&module=${module}&page=${page}&per_page=${per_page}`
			: `/portal/${this.client.getPortalId()}/search?search_term=${encodeURIComponent(search_term)}&module=${module}&status=active&page=${page}&per_page=${per_page}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
