export const paginationProperties = {
	page: { type: 'number', description: 'Page number', default: 1 },
	per_page: { type: 'number', description: 'Items per page', default: 10 },
} as const;

export const projectIdProperty = {
	project_id: { type: 'string', description: 'Project ID' },
} as const;

export const dateRangeProperties = {
	start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
	end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
} as const;

export const isoDateProperties = {
	start_date: {
		type: 'string',
		description:
			'Start date in ISO 8601 format (e.g., 2026-01-27T08:00:00Z or 2026-01-27T08:00:00.000Z)',
	},
	end_date: {
		type: 'string',
		description:
			'End date in ISO 8601 format (e.g., 2026-02-05T17:00:00Z or 2026-02-05T17:00:00.000Z)',
	},
} as const;

export const priorityProperty = {
	priority: {
		type: 'string',
		description: 'Task priority (optional)',
		enum: ['none', 'low', 'medium', 'high'],
	},
} as const;

export const commentProperties = {
	comment: { type: 'string', description: 'Comment content' },
	attachments: {
		type: 'array',
		items: { type: 'string' },
		description: 'Optional array of attachment IDs',
	},
} as const;
