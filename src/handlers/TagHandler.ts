import { ZohoClient } from '../core/ZohoClient.js';

export class TagHandler {
	constructor(private client: ZohoClient) {}

	async listTags(name?: string) {
		const queryParams = new URLSearchParams();
		if (name) queryParams.append('name', name);

		const endpoint = `/portal/${this.client.getPortalId()}/tags${
			queryParams.toString() ? `?${queryParams.toString()}` : ''
		}`;
		const data = await this.client.request(endpoint);
		return {
			content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
		};
	}

	async deleteTag(tagId: string) {
		const endpoint = `/portal/${this.client.getPortalId()}/tags/${tagId}`;
		await this.client.request(endpoint, 'DELETE');
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify({
						success: true,
						message: `Tag ${tagId} deleted successfully`,
					}),
				},
			],
		};
	}
}
