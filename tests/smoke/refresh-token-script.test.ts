#!/usr/bin/env node

import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
	getEnvFilePath,
	refreshAccessTokenFromEnv,
	updateEnvAccessToken,
} from '../../scripts/refresh-token.ts';

async function main() {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zoho-refresh-token-'));
	const envPath = path.join(tempDir, '.env');
	const originalFetch = globalThis.fetch;
	const originalAccessToken = process.env.ZOHO_ACCESS_TOKEN;
	const originalRefreshToken = process.env.ZOHO_REFRESH_TOKEN;
	const originalClientId = process.env.ZOHO_CLIENT_ID;
	const originalClientSecret = process.env.ZOHO_CLIENT_SECRET;
	const originalAccountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN;

	try {
		assert.equal(getEnvFilePath(envPath), envPath);

		await fs.writeFile(
			envPath,
			[
				'ZOHO_ACCESS_TOKEN=old-access-token',
				'ZOHO_REFRESH_TOKEN=test-refresh-token',
				'ZOHO_CLIENT_ID=test-client-id',
				'ZOHO_CLIENT_SECRET=test-client-secret',
				'ZOHO_ACCOUNTS_DOMAIN=https://accounts.zoho.eu',
				'ZOHO_PORTAL_ID=portal-id',
				'',
			].join('\n'),
			'utf8',
		);

		let fetchCallCount = 0;
		globalThis.fetch = (async (input, init) => {
			fetchCallCount += 1;
			assert.equal(String(input), 'https://accounts.zoho.eu/oauth/v2/token');
			assert.equal(init?.method, 'POST');
			assert.equal((init?.headers as Record<string, string>)['Content-Type'], 'application/x-www-form-urlencoded');

			const params = new URLSearchParams(String(init?.body || ''));
			assert.equal(params.get('refresh_token'), 'test-refresh-token');
			assert.equal(params.get('client_id'), 'test-client-id');
			assert.equal(params.get('client_secret'), 'test-client-secret');
			assert.equal(params.get('grant_type'), 'refresh_token');

			return new Response(
				JSON.stringify({
					access_token: 'new-access-token',
					expires_in: 3600,
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}) as typeof fetch;

		const refreshResult = await refreshAccessTokenFromEnv(envPath);
		const updatedEnvContents = await fs.readFile(envPath, 'utf8');

		assert.equal(fetchCallCount, 1);
		assert.equal(refreshResult.accessToken, 'new-access-token');
		assert.equal(refreshResult.expiresIn, 3600);
		assert.equal(refreshResult.envFilePath, envPath);
		assert.match(updatedEnvContents, /^ZOHO_ACCESS_TOKEN=new-access-token$/m);
		assert.doesNotMatch(updatedEnvContents, /^ZOHO_ACCESS_TOKEN=old-access-token$/m);

		await updateEnvAccessToken(envPath, 'another-access-token');
		const rewrittenEnvContents = await fs.readFile(envPath, 'utf8');
		assert.match(rewrittenEnvContents, /^ZOHO_ACCESS_TOKEN=another-access-token$/m);

		await fs.writeFile(
			envPath,
			[
				'ZOHO_ACCESS_TOKEN=',
				'ZOHO_REFRESH_TOKEN=',
				'ZOHO_CLIENT_ID=test-client-id',
				'ZOHO_CLIENT_SECRET=test-client-secret',
				'',
			].join('\n'),
			'utf8',
		);

		await assert.rejects(
			() => refreshAccessTokenFromEnv(envPath),
			/missing required environment variables/i,
		);
	} finally {
		globalThis.fetch = originalFetch;

		if (originalAccessToken === undefined) {
			delete process.env.ZOHO_ACCESS_TOKEN;
		} else {
			process.env.ZOHO_ACCESS_TOKEN = originalAccessToken;
		}

		if (originalRefreshToken === undefined) {
			delete process.env.ZOHO_REFRESH_TOKEN;
		} else {
			process.env.ZOHO_REFRESH_TOKEN = originalRefreshToken;
		}

		if (originalClientId === undefined) {
			delete process.env.ZOHO_CLIENT_ID;
		} else {
			process.env.ZOHO_CLIENT_ID = originalClientId;
		}

		if (originalClientSecret === undefined) {
			delete process.env.ZOHO_CLIENT_SECRET;
		} else {
			process.env.ZOHO_CLIENT_SECRET = originalClientSecret;
		}

		if (originalAccountsDomain === undefined) {
			delete process.env.ZOHO_ACCOUNTS_DOMAIN;
		} else {
			process.env.ZOHO_ACCOUNTS_DOMAIN = originalAccountsDomain;
		}
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
