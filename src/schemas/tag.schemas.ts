export const tagSchemas = {
	list_tags: {
		name: 'list_tags',
		description: 'List all tags in a portal. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'Filter tags by name (optional).',
				},
			},
		},
	},
	delete_tag: {
		name: 'delete_tag',
		description: 'Delete a tag from the portal. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `tag_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				tag_id: { type: 'string', description: 'Tag ID. Obtain from `list_tags`.' },
			},
			required: ['tag_id'],
		},
	},
} as const;
