import { ZohoClient } from '../core/ZohoClient.js';

export class PortalHandler {
	constructor(private client: ZohoClient) {}

	async listPortals() {
		const data = await this.client.request('/portals');
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async getPortal(portalId: string) {
		const data = await this.client.request(`/portal/${portalId}`);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}
}
