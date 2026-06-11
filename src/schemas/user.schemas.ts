export const userSchemas = {
	list_users: {
		name: 'list_users',
		description:
			'Retrieve all users, client users, contacts and resources from the Zoho Projects portal or a specific project. Supports filtering by user type, active/inactive status, sorting, and pagination. Use `project_id` to limit the result to one project, or omit it to list users across the portal. Required: `portal_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
				project_id: {
					type: 'string',
					description:
						'Project ID when you want to limit the result to one project. Omit it for portal-level users.',
				},
				type: {
					type: 'number',
					description:
						'User type filter.',
				},
				view_type: {
					type: 'string',
					description: 'User activity-status filter.',
				},
				sort: {
					type: 'string',
					description: 'Sort expression such as `alphabetical:asc` or `last_accessed_time:desc`.',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (1-based; default: 1).',
				},
				per_page: {
					type: 'number',
					description: 'Maximum number of records to return per page for pagination.',
				},
				ids: {
					type: 'string',
					description: 'Comma-separated IDs used to limit the result set to specific records.',
				},
				company_ids: {
					type: 'string',
					description: 'Comma-separated company or customer IDs used to filter results.',
				},
				view: {
					type: 'string',
					description: 'Response view style.',
				},
			},
			required: ['portal_id'],
		},
	},
	get_user_details: {
		name: 'get_user_details',
		description:
			'Retrieve detailed information about a specific user from the Zoho Projects portal, including profile, role, budget rates, and status. Can be queried by ZPUID or email address. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `portal_id`, `user_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
				user_id: {
					type: 'string',
					description: 'User ZPUID or email address. Obtain ZPUID from list_users tool.',
				},
			},
			required: ['portal_id', 'user_id'],
		},
	},
	get_user_projects: {
		name: 'get_user_projects',
		description:
			'Retrieve all projects associated with a specific user from the Zoho Projects portal. Returns project details including status, name, and group information. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `portal_id`, `user_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
				user_id: {
					type: 'string',
					description: 'User ZPUID. Obtain from list_users or get_user_details tool.',
				},
				status: {
					type: 'string',
					description: 'Project status filter to apply to the user project list.',
				},
				search_term: {
					type: 'string',
					description: 'Search text to match against the selected records.',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (1-based; default: 1).',
				},
				per_page: {
					type: 'number',
					description: 'Maximum number of records to return per page for pagination.',
				},
			},
			required: ['portal_id', 'user_id'],
		},
	},
	get_project_users: {
		name: 'get_project_users',
		description:
			'Retrieve all users associated with a specific project. Supports filtering by user type (portal users, client users, contacts, resources), active/inactive status, and sorting options. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `portal_id`, `project_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				type: {
					type: 'number',
					description:
						'User type filter for the project membership list.',
				},
				view_type: {
					type: 'string',
					description: 'User activity-status filter for the project membership list.',
				},
				sort: {
					type: 'string',
					description: 'Sort expression such as `last_accessed_time:desc`.',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (1-based; default: 1).',
				},
				per_page: {
					type: 'number',
					description: 'Maximum number of records to return per page for pagination.',
				},
				ids: {
					type: 'string',
					description: 'Comma-separated IDs used to limit the result set to specific records.',
				},
				company_ids: {
					type: 'string',
					description: 'Comma-separated company or customer IDs used to filter results.',
				},
			},
			required: ['portal_id', 'project_id'],
		},
	},
	get_project_user_details: {
		name: 'get_project_user_details',
		description:
			'Retrieve detailed information about a specific user within a project context. Returns user profile, role in the project, budget rates, and project-specific settings. Can be queried by ZPUID or email address. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `portal_id`, `project_id`, `user_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				user_id: {
					type: 'string',
					description: 'User ZPUID or email address. Obtain ZPUID from get_project_users tool.',
				},
			},
			required: ['portal_id', 'project_id', 'user_id'],
		},
	},
	get_user_license_details: {
		name: 'get_user_license_details',
		description:
			'Retrieve license usage details for the Zoho Projects portal, including counts for portal users, client users, lite users, and readonly users. Shows used, remaining, and total counts for each license type. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `portal_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID. Obtain from `list_portals`.',
				},
			},
			required: ['portal_id'],
		},
	},
} as const;
