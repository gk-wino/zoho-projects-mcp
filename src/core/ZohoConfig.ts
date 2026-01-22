import { ZohoConfig } from '../types/index.js';

export function loadZohoConfig(): ZohoConfig {
	return {
		accessToken: process.env.ZOHO_ACCESS_TOKEN || '',
		portalId: process.env.ZOHO_PORTAL_ID || '',
		apiDomain: process.env.ZOHO_API_DOMAIN || 'https://projectsapi.zoho.com',
		refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
		clientId: process.env.ZOHO_CLIENT_ID || '',
		clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
		accountsDomain: process.env.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com',
	};
}
