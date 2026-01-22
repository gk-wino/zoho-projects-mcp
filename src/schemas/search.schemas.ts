import { paginationProperties } from './common.js';

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
