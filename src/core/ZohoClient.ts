import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ZohoConfig } from '../types/index.js';

export class ZohoClient {
	private config: ZohoConfig;
	private baseUrl: string;
	private tokenExpiresAt: number = 0;

	constructor(config: ZohoConfig) {
		this.config = config;
		this.baseUrl = config.apiDomain
			? `${config.apiDomain}/api/v3`
			: 'https://projectsapi.zoho.com/api/v3';
		this.tokenExpiresAt = Date.now() + 3600 * 1000;
	}

	async request(
		endpoint: string,
		method: string = 'GET',
		body?: any,
		isRetry: boolean = false,
		contentType: string = 'application/json',
	): Promise<any> {
		// Check if token needs refresh (5 minutes before expiry)
		if (Date.now() >= this.tokenExpiresAt) {
			await this.refreshAccessToken();
		}

		if (!this.config.accessToken) {
			throw new McpError(
				ErrorCode.InvalidRequest,
				'Zoho access token not configured. Set ZOHO_ACCESS_TOKEN environment variable.',
			);
		}

		const url = `${this.baseUrl}${endpoint}`;
		const headers: Record<string, string> = {
			'Authorization': `Zoho-oauthtoken ${this.config.accessToken}`,
			'Content-Type': contentType,
		};

		const options: {
			method: string;
			headers: Record<string, string>;
			body?: string;
		} = {
			method,
			headers,
		};

		if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
			if (contentType === 'application/x-www-form-urlencoded') {
				// Convert object to URL-encoded string
				const params = new URLSearchParams();
				for (const [key, value] of Object.entries(body)) {
					if (Array.isArray(value)) {
						params.append(key, JSON.stringify(value));
					} else {
						params.append(key, String(value));
					}
				}
				options.body = params.toString();
			} else {
				options.body = JSON.stringify(body);
			}
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			const errorText = await response.text();

			// If 401 and we have refresh credentials and haven't retried yet, try refresh
			if (
				response.status === 401 &&
				!isRetry &&
				this.config.refreshToken &&
				this.config.clientId &&
				this.config.clientSecret
			) {
				console.error('Received 401 error, attempting token refresh...');
				try {
					await this.refreshAccessToken();
					// Retry the request once with new token
					return await this.request(endpoint, method, body, true, contentType);
				} catch (refreshError) {
					console.error('Token refresh failed:', refreshError);
					// Fall through to throw original error
				}
			}

			throw new McpError(
				ErrorCode.InternalError,
				`Zoho API error: ${response.status} - ${errorText}`,
			);
		}

		// Handle 204 No Content responses
		if (response.status === 204) {
			return { success: true, message: 'Operation completed successfully' };
		}

		// For other successful responses, parse JSON
		const text = await response.text();
		return text ? JSON.parse(text) : { success: true };
	}

	private async refreshAccessToken(): Promise<void> {
		if (!this.config.refreshToken || !this.config.clientId || !this.config.clientSecret) {
			console.error('Cannot refresh token: missing refresh token, client ID, or client secret');
			return;
		}

		try {
			const params = new URLSearchParams({
				refresh_token: this.config.refreshToken,
				client_id: this.config.clientId,
				client_secret: this.config.clientSecret,
				grant_type: 'refresh_token',
			});

			const response = await fetch(`${this.config.accountsDomain}/oauth/v2/token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params.toString(),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
			}

			const data = (await response.json()) as {
				access_token: string;
				expires_in: number;
			};

			// Update access token and expiration time
			this.config.accessToken = data.access_token;
			// Set expiration to 5 minutes before actual expiry for safety margin
			this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

			console.error(`Access token refreshed successfully. Expires in ${data.expires_in} seconds.`);
		} catch (error) {
			console.error(`Error refreshing access token: ${error}`);
			throw new McpError(ErrorCode.InternalError, `Failed to refresh access token: ${error}`);
		}
	}

	getPortalId(): string {
		return this.config.portalId;
	}
}
