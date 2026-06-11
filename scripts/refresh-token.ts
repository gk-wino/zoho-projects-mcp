#!/usr/bin/env node

import * as dotenv from 'dotenv';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type RefreshTokenConfig = {
	accessToken: string;
	refreshToken: string;
	clientId: string;
	clientSecret: string;
	accountsDomain: string;
	envFilePath: string;
};

type RefreshTokenResponse = {
	accessToken: string;
	expiresIn: number;
	envFilePath: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const defaultEnvFilePath = path.resolve(repoRoot, '.env');

export function getEnvFilePath(envFilePath?: string): string {
	if (!envFilePath) {
		return defaultEnvFilePath;
	}

	const trimmedPath = envFilePath.trim();
	if (!trimmedPath) {
		throw new Error('An env file path is required when provided.');
	}

	return path.resolve(trimmedPath);
}

function requireConfigValue(value: string | undefined, key: string): string {
	const normalizedValue = value?.trim();
	if (!normalizedValue) {
		throw new Error(`Missing required environment variables: ${key}`);
	}

	return normalizedValue;
}

export async function loadRefreshTokenConfig(envFilePath?: string): Promise<RefreshTokenConfig> {
	const resolvedEnvFilePath = getEnvFilePath(envFilePath);
	const envContents = await fsp.readFile(resolvedEnvFilePath, 'utf8');
	const parsedEnv = dotenv.parse(envContents);
	const missingKeys = [
		'ZOHO_REFRESH_TOKEN',
		'ZOHO_CLIENT_ID',
		'ZOHO_CLIENT_SECRET',
	].filter((key) => !parsedEnv[key]?.trim());

	if (missingKeys.length > 0) {
		throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
	}

	return {
		accessToken: parsedEnv.ZOHO_ACCESS_TOKEN?.trim() || '',
		refreshToken: requireConfigValue(parsedEnv.ZOHO_REFRESH_TOKEN, 'ZOHO_REFRESH_TOKEN'),
		clientId: requireConfigValue(parsedEnv.ZOHO_CLIENT_ID, 'ZOHO_CLIENT_ID'),
		clientSecret: requireConfigValue(parsedEnv.ZOHO_CLIENT_SECRET, 'ZOHO_CLIENT_SECRET'),
		accountsDomain: (parsedEnv.ZOHO_ACCOUNTS_DOMAIN || 'https://accounts.zoho.com').trim(),
		envFilePath: resolvedEnvFilePath,
	};
}

export async function requestZohoAccessTokenRefresh(
	config: Pick<RefreshTokenConfig, 'refreshToken' | 'clientId' | 'clientSecret' | 'accountsDomain'>,
): Promise<{ accessToken: string; expiresIn: number }> {
	const params = new URLSearchParams({
		refresh_token: config.refreshToken,
		client_id: config.clientId,
		client_secret: config.clientSecret,
		grant_type: 'refresh_token',
	});

	const response = await fetch(`${config.accountsDomain}/oauth/v2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});

	if (!response.ok) {
		throw new Error(`Failed to refresh token: ${response.status} ${await response.text()}`);
	}

	const data = (await response.json()) as {
		access_token?: string;
		expires_in?: number;
	};

	if (!data.access_token || typeof data.expires_in !== 'number') {
		throw new Error('Zoho refresh response did not include access_token and expires_in.');
	}

	return {
		accessToken: data.access_token,
		expiresIn: data.expires_in,
	};
}

function replaceEnvLine(contents: string, key: string, value: string): string {
	const line = `${key}=${value}`;
	const pattern = new RegExp(`^${key}=.*$`, 'm');

	if (pattern.test(contents)) {
		return contents.replace(pattern, line);
	}

	const suffix = contents.endsWith('\n') || contents.length === 0 ? '' : '\n';
	return `${contents}${suffix}${line}\n`;
}

export async function updateEnvAccessToken(envFilePath: string, accessToken: string): Promise<void> {
	const resolvedEnvFilePath = getEnvFilePath(envFilePath);
	const envContents = await fsp.readFile(resolvedEnvFilePath, 'utf8');
	const updatedContents = replaceEnvLine(envContents, 'ZOHO_ACCESS_TOKEN', accessToken);
	await fsp.writeFile(resolvedEnvFilePath, updatedContents, 'utf8');
	process.env.ZOHO_ACCESS_TOKEN = accessToken;
}

export async function refreshAccessTokenFromEnv(envFilePath?: string): Promise<RefreshTokenResponse> {
	const config = await loadRefreshTokenConfig(envFilePath);
	const refreshResult = await requestZohoAccessTokenRefresh(config);
	await updateEnvAccessToken(config.envFilePath, refreshResult.accessToken);

	return {
		accessToken: refreshResult.accessToken,
		expiresIn: refreshResult.expiresIn,
		envFilePath: config.envFilePath,
	};
}

async function main(): Promise<void> {
	try {
		const envFilePath = process.argv[2];
		const result = await refreshAccessTokenFromEnv(envFilePath);
		console.log(`Access token refreshed successfully.`);
		console.log(`Env file updated: ${result.envFilePath}`);
		console.log(`Expires in: ${result.expiresIn} seconds`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to refresh access token: ${message}`);
		process.exitCode = 1;
	}
}

const isEntrypoint = process.argv[1]
	? path.resolve(process.argv[1]) === __filename
	: false;

if (isEntrypoint) {
	await main();
}
