export const paginationProperties = {
	page: { type: 'number', description: 'Page number for pagination (1-based; default: 1).', default: 1 },
	per_page: {
		type: 'number',
		description: 'Maximum number of records to return per page for pagination.',
		default: 10,
	},
} as const;

export const projectIdProperty = {
	project_id: { type: 'string', description: 'Project ID. Obtain from `list_projects`.' },
} as const;

export const dateRangeProperties = {
	start_date: { type: 'string', description: 'Start date in YYYY-MM-DD format.' },
	end_date: { type: 'string', description: 'End date in YYYY-MM-DD format.' },
} as const;

export const isoDateProperties = {
	start_date: {
		type: 'string',
		description:
			'Start date in ISO 8601 format (e.g., 2026-01-27T08:00:00Z or 2026-01-27T08:00:00.000Z).',
	},
	end_date: {
		type: 'string',
		description:
			'End date in ISO 8601 format (e.g., 2026-02-05T17:00:00Z or 2026-02-05T17:00:00.000Z).',
	},
} as const;

export const priorityProperty = {
	priority: {
		type: 'string',
		description: 'Task priority when the tool supports it. Allowed values: `none`, `low`, `medium`, `high`.',
		enum: ['none', 'low', 'medium', 'high'],
	},
} as const;

export const commentProperties = {
	comment: { type: 'string', description: 'Comment text to create or update.' },
	attachments: {
		type: 'array',
		items: { type: 'string' },
		description: 'Array of attachment IDs to associate with this request.',
	},
} as const;
