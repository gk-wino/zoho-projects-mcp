export const portalSchemas = {
	list_portals: {
		name: 'list_portals',
		description: 'Retrieve all Zoho Projects portals',
		inputSchema: {
			type: 'object',
			properties: {},
		},
	},
	get_portal: {
		name: 'get_portal',
		description: 'Get details of a specific portal',
		inputSchema: {
			type: 'object',
			properties: {
				portal_id: { type: 'string', description: 'Portal ID' },
			},
			required: ['portal_id'],
		},
	},
} as const;
