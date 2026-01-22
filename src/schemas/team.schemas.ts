import { paginationProperties } from './common.js';

export const teamSchemas = {
	get_team_details: {
		name: 'get_team_details',
		description: 'Retrieve team details from the Zoho Projects portal',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'Team ID (optional)' },
				search_term: {
					type: 'string',
					description: 'Search by team name (optional)',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Last modification time filter (optional)',
				},
				sort_by: {
					type: 'string',
					description: 'Sort order, e.g., "desc(name)" or "asc(name)"',
				},
			},
		},
	},
	get_projects_team: {
		name: 'get_projects_team',
		description: 'Retrieve teams from a specific project',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				id: { type: 'string', description: 'Team ID (optional)' },
				search_term: {
					type: 'string',
					description: 'Search by team name (optional)',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Last modification time filter (optional)',
				},
				sort_by: {
					type: 'string',
					description: 'Sort order, e.g., "desc(name)" or "asc(name)"',
				},
			},
			required: ['project_id'],
		},
	},
	get_team_users: {
		name: 'get_team_users',
		description: 'Retrieve users from one or more teams',
		inputSchema: {
			type: 'object',
			properties: {
				team_ids: {
					type: 'string',
					description:
						'Comma-separated team IDs as JSON array string, e.g., "[4000000062001,4000000015029]"',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Last modification time filter (optional)',
				},
			},
		},
	},
	get_teams_projects: {
		name: 'get_teams_projects',
		description: 'Retrieve projects associated with one or more teams',
		inputSchema: {
			type: 'object',
			properties: {
				team_ids: {
					type: 'string',
					description:
						'Comma-separated team IDs as JSON array string, e.g., "[4000000062001,4000000015029]"',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Last modification time filter (optional)',
				},
			},
		},
	},
} as const;
