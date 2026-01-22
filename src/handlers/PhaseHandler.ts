import { ZohoClient } from '../core/ZohoClient.js';

export class PhaseHandler {
	constructor(private client: ZohoClient) {}

	async getPhases(params: any) {
		const { page = 1, per_page = 100, sort_by, view_id, milestone_ids, filter } = params;
		let url = `/portal/${this.client.getPortalId()}/phases?page=${page}&per_page=${per_page}`;

		if (sort_by) url += `&sort_by=${sort_by}`;
		if (view_id) url += `&view_id=${view_id}`;
		if (milestone_ids) url += `&milestone_ids=${milestone_ids}`;
		if (filter) url += `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async listPhases(params: any) {
		const {
			project_id,
			page = 1,
			per_page = 100,
			sort_by,
			view_id,
			milestone_ids,
			filter,
		} = params;
		let url = `/portal/${this.client.getPortalId()}/projects/${project_id}/phases?page=${page}&per_page=${per_page}`;

		if (sort_by) url += `&sort_by=${sort_by}`;
		if (view_id) url += `&view_id=${view_id}`;
		if (milestone_ids) url += `&milestone_ids=${milestone_ids}`;
		if (filter) url += `&filter=${encodeURIComponent(JSON.stringify(filter))}`;

		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getPhaseDetail(params: any) {
		const { project_id, phase_id } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}`,
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

	async updatePhase(params: any) {
		const { project_id, phase_id, ...phaseData } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}`,
			'POST',
			phaseData,
		);
		return {
			content: [
				{
					type: 'text',
					text: `Phase updated successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async deletePhase(params: any) {
		const { project_id, phase_id } = params;
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}`,
			'DELETE',
		);
		return {
			content: [{ type: 'text', text: 'Phase deleted successfully' }],
		};
	}

	async movePhase(params: any) {
		const { project_id, phase_id, to_project } = params;
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/move`,
			'PATCH',
			{ to_project },
		);
		return {
			content: [{ type: 'text', text: 'Phase moved successfully' }],
		};
	}

	async clonePhase(params: any) {
		const { project_id, phase_id } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/clone`,
			'POST',
		);
		return {
			content: [
				{
					type: 'text',
					text: `Phase cloned successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async getPhaseActivities(params: any) {
		const { project_id, phase_id, page = 1, per_page = 100 } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/activities?page=${page}&per_page=${per_page}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getPhaseStatusTransition(params: any) {
		const { project_id, phase_id } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/status-timeline`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getPhaseFollowers(params: any) {
		const { project_id, phase_id, page = 1, per_page = 100 } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/followers?page=${page}&per_page=${per_page}`,
		);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addPhaseFollowers(params: any) {
		const { project_id, phase_id, followers } = params;
		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/follow`,
			'POST',
			{ followers },
		);
		return {
			content: [
				{
					type: 'text',
					text: `Followers added successfully:\n${JSON.stringify(data, null, 2)}`,
				},
			],
		};
	}

	async removePhaseFollowers(params: any) {
		const { project_id, phase_id, followers } = params;
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/unfollow`,
			'DELETE',
			{ followers },
		);
		return {
			content: [{ type: 'text', text: 'Followers removed successfully' }],
		};
	}

	async getPhaseComments(params: any) {
		const { project_id, phase_id, sort_order, page = 1, per_page = 100 } = params;
		let url = `/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/comments?page=${page}&per_page=${per_page}`;

		if (sort_order) url += `&sort_order=${sort_order}`;

		const data = await this.client.request(url);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async addPhaseComment(params: any) {
		const { project_id, phase_id, content, notify, attachment_ids } = params;
		const body: any = { content };
		if (notify) body.notify = notify;
		if (attachment_ids) body.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/comments`,
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

	async updatePhaseComment(params: any) {
		const { project_id, phase_id, comment_id, content, notify, attachment_ids } = params;
		const body: any = { content };
		if (notify) body.notify = notify;
		if (attachment_ids) body.attachment_ids = attachment_ids;

		const data = await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/comments/${comment_id}`,
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

	async deletePhaseComment(params: any) {
		const { project_id, phase_id, comment_id } = params;
		await this.client.request(
			`/portal/${this.client.getPortalId()}/projects/${project_id}/phases/${phase_id}/comments/${comment_id}`,
			'DELETE',
		);
		return {
			content: [{ type: 'text', text: 'Comment deleted successfully' }],
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
