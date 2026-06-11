export const portalSchemas = {
	list_portals: {
		name: 'list_portals',
		description: 'Retrieve all Zoho Projects portals. Use this first to discover available portals and collect `portal_id` values for portal-scoped tools. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {},
		},
	},
	get_portal: {
		name: 'get_portal',
		description: 'Get details of a specific portal. Use this when you already know the portal identifier and need portal details or metadata. Required: `portal_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: { type: 'string', description: 'Portal ID. Obtain from `list_portals`.' },
			},
			required: ['portal_id'],
		},
	},
} as const;
