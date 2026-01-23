import { ZohoClient } from '../core/ZohoClient.js';

export class UserHandler {
	constructor(private client: ZohoClient) {}

	async listUsers(params: {
		portal_id: string;
		project_id?: string;
		type?: number;
		view_type?: string;
		sort?: string;
		page?: number;
		per_page?: number;
		ids?: string;
		company_ids?: string;
		view?: string;
		filter?: any;
	}) {
		const {
			portal_id,
			project_id,
			type,
			view_type,
			sort,
			page,
			per_page,
			ids,
			company_ids,
			view,
			filter,
		} = params;

		// Build endpoint URL
		let endpoint = project_id
			? `/portal/${portal_id}/projects/${project_id}/users`
			: `/portal/${portal_id}/users`;

		// Build query parameters
		const queryParams: string[] = [];
		if (type !== undefined) queryParams.push(`type=${type}`);
		if (view_type) queryParams.push(`view_type=${encodeURIComponent(view_type)}`);
		if (sort) queryParams.push(`sort=${encodeURIComponent(sort)}`);
		if (page !== undefined) queryParams.push(`page=${page}`);
		if (per_page !== undefined) queryParams.push(`per_page=${per_page}`);
		if (ids) queryParams.push(`ids=${encodeURIComponent(ids)}`);
		if (company_ids) queryParams.push(`company_ids=${encodeURIComponent(company_ids)}`);
		if (view) queryParams.push(`view=${encodeURIComponent(view)}`);
		if (filter) queryParams.push(`filter=${encodeURIComponent(JSON.stringify(filter))}`);

		if (queryParams.length > 0) {
			endpoint += `?${queryParams.join('&')}`;
		}

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getUserDetails(params: { portal_id: string; user_id: string }) {
		const { portal_id, user_id } = params;
		const endpoint = `/portal/${portal_id}/users/${user_id}`;

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getUserProjects(params: {
		portal_id: string;
		user_id: string;
		status?: string;
		search_term?: string;
		page?: number;
		per_page?: number;
	}) {
		const { portal_id, user_id, status, search_term, page, per_page } = params;
		let endpoint = `/portal/${portal_id}/users/${user_id}/projects`;

		// Build query parameters
		const queryParams: string[] = [];
		if (status) queryParams.push(`status=${encodeURIComponent(status)}`);
		if (search_term) queryParams.push(`search_term=${encodeURIComponent(search_term)}`);
		if (page !== undefined) queryParams.push(`page=${page}`);
		if (per_page !== undefined) queryParams.push(`per_page=${per_page}`);

		if (queryParams.length > 0) {
			endpoint += `?${queryParams.join('&')}`;
		}

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getProjectUsers(params: {
		portal_id: string;
		project_id: string;
		type?: number;
		view_type?: string;
		sort?: string;
		page?: number;
		per_page?: number;
		ids?: string;
		company_ids?: string;
		filter?: any;
	}) {
		const {
			portal_id,
			project_id,
			type,
			view_type,
			sort,
			page,
			per_page,
			ids,
			company_ids,
			filter,
		} = params;

		let endpoint = `/portal/${portal_id}/projects/${project_id}/users`;

		// Build query parameters
		const queryParams: string[] = [];
		if (type !== undefined) queryParams.push(`type=${type}`);
		if (view_type) queryParams.push(`view_type=${encodeURIComponent(view_type)}`);
		if (sort) queryParams.push(`sort=${encodeURIComponent(sort)}`);
		if (page !== undefined) queryParams.push(`page=${page}`);
		if (per_page !== undefined) queryParams.push(`per_page=${per_page}`);
		if (ids) queryParams.push(`ids=${encodeURIComponent(ids)}`);
		if (company_ids) queryParams.push(`company_ids=${encodeURIComponent(company_ids)}`);
		if (filter) queryParams.push(`filter=${encodeURIComponent(JSON.stringify(filter))}`);

		if (queryParams.length > 0) {
			endpoint += `?${queryParams.join('&')}`;
		}

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getProjectUserDetails(params: { portal_id: string; project_id: string; user_id: string }) {
		const { portal_id, project_id, user_id } = params;
		const endpoint = `/portal/${portal_id}/projects/${project_id}/users/${user_id}`;

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getUserLicenseDetails(params: { portal_id: string }) {
		const { portal_id } = params;
		const endpoint = `/portal/${portal_id}/users/license-details`;

		const data = await this.client.request(endpoint);

		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
