export const userSchemas = {
	list_users: {
		name: 'list_users',
		description:
			'Retrieve all users, client users, contacts and resources from the Zoho Projects portal or a specific project. Supports filtering by user type, active/inactive status, sorting, and pagination.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
				},
				project_id: {
					type: 'string',
					description:
						'Project ID (optional, for project-level users). Obtain from list_projects tool.',
				},
				type: {
					type: 'number',
					description:
						'User type filter: 1 (Users), 2 (Client Users), 3 (Client Contacts), 6 (Resources)',
				},
				view_type: {
					type: 'string',
					description: 'View type: "0" (Inactive) or "1" (Active)',
				},
				sort: {
					type: 'string',
					description: 'Sort order, e.g., "alphabetical:asc" or "last_accessed_time:desc"',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (default: 1)',
				},
				per_page: {
					type: 'number',
					description: 'Number of entries per page (default: 100, max: 200)',
				},
				ids: {
					type: 'string',
					description: 'Comma-separated list of user IDs to retrieve',
				},
				company_ids: {
					type: 'string',
					description: 'Comma-separated list of company/customer IDs to filter by',
				},
				view: {
					type: 'string',
					description: 'Data view type: "list" or "grid"',
				},
			},
			required: ['portal_id'],
		},
	},
	get_user_details: {
		name: 'get_user_details',
		description:
			'Retrieve detailed information about a specific user from the Zoho Projects portal, including profile, role, budget rates, and status. Can be queried by ZPUID or email address.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
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
			'Retrieve all projects associated with a specific user from the Zoho Projects portal. Returns project details including status, name, and group information.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
				},
				user_id: {
					type: 'string',
					description: 'User ZPUID. Obtain from list_users or get_user_details tool.',
				},
				status: {
					type: 'string',
					description: 'Project status filter, e.g., "Open", "active"',
				},
				search_term: {
					type: 'string',
					description: 'Search term to filter projects by name',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (default: 1)',
				},
				per_page: {
					type: 'number',
					description: 'Number of entries per page (default: 100, max: 200)',
				},
			},
			required: ['portal_id', 'user_id'],
		},
	},
	get_project_users: {
		name: 'get_project_users',
		description:
			'Retrieve all users associated with a specific project. Supports filtering by user type (portal users, client users, contacts, resources), active/inactive status, and sorting options.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
				},
				project_id: {
					type: 'string',
					description: 'Project ID (required). Obtain from list_projects tool.',
				},
				type: {
					type: 'number',
					description:
						'User type filter: 1 (Users), 2 (Client Users), 3 (Client Contacts), 6 (Resources)',
				},
				view_type: {
					type: 'string',
					description: 'View type: "0" (Inactive) or "1" (Active)',
				},
				sort: {
					type: 'string',
					description: 'Sort order, e.g., "last_accessed_time:desc"',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (default: 1)',
				},
				per_page: {
					type: 'number',
					description: 'Number of entries per page (default: 100, max: 200)',
				},
				ids: {
					type: 'string',
					description: 'Comma-separated list of user IDs to retrieve',
				},
				company_ids: {
					type: 'string',
					description: 'Comma-separated list of company/customer IDs to filter by',
				},
			},
			required: ['portal_id', 'project_id'],
		},
	},
	get_project_user_details: {
		name: 'get_project_user_details',
		description:
			'Retrieve detailed information about a specific user within a project context. Returns user profile, role in the project, budget rates, and project-specific settings. Can be queried by ZPUID or email address.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
				},
				project_id: {
					type: 'string',
					description: 'Project ID (required). Obtain from list_projects tool.',
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
			'Retrieve license usage details for the Zoho Projects portal, including counts for portal users, client users, lite users, and readonly users. Shows used, remaining, and total counts for each license type.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: {
					type: 'string',
					description: 'Portal ID (required). Obtain from list_portals tool.',
				},
			},
			required: ['portal_id'],
		},
	},
} as const;
