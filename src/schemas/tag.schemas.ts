export const tagSchemas = {
	list_tags: {
		name: 'list_tags',
		description: 'List all tags in a portal',
		inputSchema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'Filter tags by name (optional)',
				},
			},
		},
	},
	delete_tag: {
		name: 'delete_tag',
		description: 'Delete a tag from the portal',
		inputSchema: {
			type: 'object',
			properties: {
				tag_id: { type: 'string', description: 'Tag ID' },
			},
			required: ['tag_id'],
		},
	},
} as const;
