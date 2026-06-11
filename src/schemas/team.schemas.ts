import { paginationProperties } from './common.js';

export const teamSchemas = {
	get_team_details: {
		name: 'get_team_details',
		description: 'Retrieve team details from the Zoho Projects portal. Use this when you already know the parent record or identifier and need the returned details or related records. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'string', description: 'Team ID to retrieve. Omit it to browse teams using the other filters.' },
				search_term: {
					type: 'string',
					description: 'Team name text to search for.',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Filter records changed after the given date or timestamp in the format accepted by Zoho.',
				},
				sort_by: {
					type: 'string',
					description: 'Sort expression for the result set, for example `desc(name)` or `asc(name)`.',
				},
			},
		},
	},
	get_projects_team: {
		name: 'get_projects_team',
		description: 'Retrieve teams from a specific project. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				id: { type: 'string', description: 'Team ID to retrieve within the project. Omit it to browse teams using the other filters.' },
				search_term: {
					type: 'string',
					description: 'Team name text to search for within the project.',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Filter records changed after the given date or timestamp in the format accepted by Zoho.',
				},
				sort_by: {
					type: 'string',
					description: 'Sort expression for the result set, for example `desc(name)` or `asc(name)`.',
				},
			},
			required: ['project_id'],
		},
	},
	get_team_users: {
		name: 'get_team_users',
		description: 'Retrieve users from one or more teams. Use this when you already know the parent record or identifier and need the returned details or related records. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				team_ids: {
					type: 'string',
					description:
						'Team IDs expressed in the Zoho-accepted array-string format, for example `[4000000062001,4000000015029]`.',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Filter records changed after the given date or timestamp in the format accepted by Zoho.',
				},
			},
		},
	},
	get_teams_projects: {
		name: 'get_teams_projects',
		description: 'Retrieve projects associated with one or more teams. Use this when you already know the parent record or identifier and need the returned details or related records. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				team_ids: {
					type: 'string',
					description:
						'Team IDs expressed in the Zoho-accepted array-string format, for example `[4000000062001,4000000015029]`.',
				},
				...paginationProperties,
				last_modified_time: {
					type: 'string',
					description: 'Filter records changed after the given date or timestamp in the format accepted by Zoho.',
				},
			},
		},
	},
} as const;
