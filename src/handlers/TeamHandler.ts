import { ZohoClient } from '../core/ZohoClient.js';

export class TeamHandler {
	constructor(private client: ZohoClient) {}

	async getTeamDetails(params: any) {
		const queryParams = new URLSearchParams();
		if (params.id) queryParams.append('id', params.id);
		if (params.search_term) queryParams.append('search_term', params.search_term);
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.per_page) queryParams.append('per_page', params.per_page.toString());
		if (params.last_modified_time)
			queryParams.append('last_modified_time', params.last_modified_time);
		if (params.sort_by) queryParams.append('sort_by', params.sort_by);

		const endpoint = `/portal/${this.client.getPortalId()}/teams${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getProjectsTeam(params: any) {
		const queryParams = new URLSearchParams();
		if (params.id) queryParams.append('id', params.id);
		if (params.search_term) queryParams.append('search_term', params.search_term);
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.per_page) queryParams.append('per_page', params.per_page.toString());
		if (params.last_modified_time)
			queryParams.append('last_modified_time', params.last_modified_time);
		if (params.sort_by) queryParams.append('sort_by', params.sort_by);

		const endpoint = `/portal/${this.client.getPortalId()}/projects/${params.project_id}/teams${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTeamUsers(params: any) {
		const queryParams = new URLSearchParams();
		if (params.team_ids) queryParams.append('team_ids', params.team_ids);
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.per_page) queryParams.append('per_page', params.per_page.toString());
		if (params.last_modified_time)
			queryParams.append('last_modified_time', params.last_modified_time);

		const endpoint = `/portal/${this.client.getPortalId()}/teams/users${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getTeamsProjects(params: any) {
		const queryParams = new URLSearchParams();
		if (params.team_ids) queryParams.append('team_ids', params.team_ids);
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.per_page) queryParams.append('per_page', params.per_page.toString());
		if (params.last_modified_time)
			queryParams.append('last_modified_time', params.last_modified_time);

		const endpoint = `/portal/${this.client.getPortalId()}/teams/projects${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
