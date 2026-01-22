export const userSchemas = {
	list_users: {
		name: 'list_users',
		description: 'List users in a portal or project',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (optional for portal-level)',
				},
			},
		},
	},
} as const;
