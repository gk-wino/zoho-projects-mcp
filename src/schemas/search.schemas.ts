import { paginationProperties } from './common.js';

export const searchSchemas = {
	search: {
		name: 'search',
		description: 'Search across portal or project. Use `project_id` to scope the search to one project, or omit it to search at portal level before choosing a more specific tool. Required: `search_term`.',
		inputSchema: {
			type: 'object',
			properties: {
				search_term: {
					type: 'string',
					description: 'Search text to match against the selected records.',
				},
				project_id: {
					type: 'string',
					description: 'Project ID when you want to limit the search to a single project. Omit it for portal-level search.',
				},
				module: {
					type: 'string',
					description: 'Module to search within. Allowed values: `all`, `projects`, `tasks`, `issues`, `milestones`, `forums`, `events`.',
					enum: ['all', 'projects', 'tasks', 'issues', 'milestones', 'forums', 'events'],
				},
				...paginationProperties,
			},
			required: ['search_term'],
		},
	},
} as const;
