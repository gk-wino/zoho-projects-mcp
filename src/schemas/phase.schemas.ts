import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

export const phaseSchemas = {
	list_phases: {
		name: 'list_phases',
		description: 'List phases/milestones from a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...paginationProperties,
			},
			required: ['project_id'],
		},
	},
	create_phase: {
		name: 'create_phase',
		description: 'Create a new phase/milestone',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Phase name' },
				...dateRangeProperties,
				owner_zpuid: { type: 'string', description: 'Owner user ZPUID' },
			},
			required: ['project_id', 'name'],
		},
	},
} as const;

export const searchSchemas = {
	search: {
		name: 'search',
		description: 'Search across portal or project',
		inputSchema: {
			type: 'object',
			properties: {
				search_term: {
					type: 'string',
					description: 'Search term/query',
				},
				project_id: {
					type: 'string',
					description: 'Project ID (optional for portal-level search)',
				},
				module: {
					type: 'string',
					description: 'Module to search in',
					enum: ['all', 'projects', 'tasks', 'issues', 'milestones', 'forums', 'events'],
				},
				...paginationProperties,
			},
			required: ['search_term'],
		},
	},
} as const;
