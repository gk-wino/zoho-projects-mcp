import { ZohoClient } from '../core/ZohoClient.js';

export class UserHandler {
	constructor(private client: ZohoClient) {}

	async listUsers(projectId?: string) {
		const endpoint = projectId
			? `/portal/${this.client.getPortalId()}/projects/${projectId}/users`
			: `/portal/${this.client.getPortalId()}/users`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
