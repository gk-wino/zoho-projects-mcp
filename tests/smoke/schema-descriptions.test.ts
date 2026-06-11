#!/usr/bin/env node

import assert from 'node:assert/strict';
import { allToolSchemas } from '../../src/schemas/index.ts';

type ToolSchema = {
	name: string;
	description: string;
	inputSchema?: {
		properties?: Record<string, unknown>;
		required?: string[];
	};
};

type SchemaProperty = {
	description?: string;
	enum?: unknown[];
	properties?: Record<string, SchemaProperty>;
	items?: SchemaProperty;
};

const formatExpectations: Record<string, string[]> = {
	create_project: ['YYYY-MM-DD'],
	update_project: ['YYYY-MM-DD'],
	create_issue: ['YYYY-MM-DD'],
	update_issue: ['YYYY-MM-DD'],
	create_task: ['ISO 8601'],
	update_task: ['ISO 8601'],
	create_phase: ['MM/DD/YYYY'],
	update_phase: ['MM/DD/YYYY'],
	list_time_logs: ['YYYY-MM-DD'],
	create_time_log: ['YYYY-MM-DD'],
	update_time_log: ['YYYY-MM-DD'],
	stop_timer: ['YYYY-MM-DD'],
};

for (const schema of allToolSchemas as ToolSchema[]) {
	assert.ok(schema.description.trim().length > 0, `${schema.name} should have a non-empty description`);

	const requiredParams = schema.inputSchema?.required ?? [];
	for (const param of requiredParams) {
		assert.match(
			schema.description,
			new RegExp(`\`${param}\``),
			`${schema.name} description should mention required parameter ${param}`,
		);
	}
}

for (const [toolName, requiredPhrases] of Object.entries(formatExpectations)) {
	const schema = (allToolSchemas as ToolSchema[]).find((entry) => entry.name === toolName);
	assert.ok(schema, `Expected schema ${toolName} to exist`);

	for (const phrase of requiredPhrases) {
		assert.match(
			schema.description,
			new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
			`${toolName} description should mention ${phrase}`,
		);
	}
}

function assertEnumDescriptions(toolName: string, properties?: Record<string, SchemaProperty>) {
	if (!properties) {
		return;
	}

	for (const [propertyName, property] of Object.entries(properties)) {
		if (Array.isArray(property.enum) && typeof property.description === 'string') {
			for (const enumValue of property.enum) {
				assert.match(
					property.description,
					new RegExp(String(enumValue).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
					`${toolName}.${propertyName} description should mention enum value ${String(enumValue)}`,
				);
			}
		}

		assertEnumDescriptions(toolName, property.properties);
		assertEnumDescriptions(toolName, property.items?.properties);
	}
}

for (const schema of allToolSchemas as ToolSchema[]) {
	assertEnumDescriptions(schema.name, schema.inputSchema?.properties as Record<string, SchemaProperty> | undefined);
}
