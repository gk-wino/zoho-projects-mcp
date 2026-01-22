import { paginationProperties, projectIdProperty } from './common.js';

export const tasklistSchemas = {
	list_tasklists: {
		name: 'list_tasklists',
		description: 'List task lists from a project or portal',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (optional for portal-level)',
				},
				...paginationProperties,
			},
		},
	},
	get_tasklist: {
		name: 'get_tasklist',
		description: 'Get details of a specific task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_tasklist: {
		name: 'create_tasklist',
		description: 'Create a new task list in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Task list name' },
				milestone_id: {
					type: 'string',
					description: 'Milestone ID (optional)',
				},
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Task list status' },
			},
			required: ['project_id', 'name'],
		},
	},
	update_tasklist: {
		name: 'update_tasklist',
		description: 'Update a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				name: { type: 'string', description: 'Task list name' },
				milestone_id: { type: 'string', description: 'Milestone ID' },
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Task list status' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	delete_tasklist: {
		name: 'delete_tasklist',
		description: 'Delete a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_default_tasklist: {
		name: 'create_default_tasklist',
		description: 'Create a default task list for a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
			},
			required: ['project_id', 'flag'],
		},
	},
	// Comments operations
	get_tasklist_comments: {
		name: 'get_tasklist_comments',
		description: 'Retrieve multiple comments from a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Sort criteria. Format: ASC(field_name) or DESC(field_name)',
				},
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	get_tasklist_comment: {
		name: 'get_tasklist_comment',
		description: 'Retrieve a specific comment from a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				comment_id: { type: 'string', description: 'Comment ID' },
			},
			required: ['project_id', 'tasklist_id', 'comment_id'],
		},
	},
	add_tasklist_comment: {
		name: 'add_tasklist_comment',
		description: 'Add a comment to a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				comment: {
					type: 'string',
					description:
						'Comment text (max 500,000 characters). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs (max 10)',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'tasklist_id', 'comment'],
		},
	},
	update_tasklist_comment: {
		name: 'update_tasklist_comment',
		description: 'Modify a comment in a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				comment_id: { type: 'string', description: 'Comment ID' },
				comment: {
					type: 'string',
					description:
						'Updated comment text (max 500,000 characters). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs (max 10)',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'tasklist_id', 'comment_id', 'comment'],
		},
	},
	delete_tasklist_comment: {
		name: 'delete_tasklist_comment',
		description: 'Remove a comment from a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				comment_id: { type: 'string', description: 'Comment ID' },
			},
			required: ['project_id', 'tasklist_id', 'comment_id'],
		},
	},
	// Followers operations
	get_tasklist_followers: {
		name: 'get_tasklist_followers',
		description: 'Retrieve followers for a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				...paginationProperties,
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	follow_tasklist: {
		name: 'follow_tasklist',
		description: 'Follow a task list in a project to receive updates and notifications',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	unfollow_tasklist: {
		name: 'unfollow_tasklist',
		description: 'Unfollow a task list in a project to stop receiving updates and notifications',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	// Template operations
	get_tasklist_templates: {
		name: 'get_tasklist_templates',
		description:
			'Retrieve task lists that are associated with a template in the Zoho Projects portal',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
			},
		},
	},
	get_tasks_from_tasklist_template: {
		name: 'get_tasks_from_tasklist_template',
		description: 'Retrieve tasks from a task list template',
		inputSchema: {
			type: 'object',
			properties: {
				tasklist_id: {
					type: 'string',
					description: 'Task List Template ID',
				},
				...paginationProperties,
			},
			required: ['tasklist_id'],
		},
	},
	make_tasklist_template: {
		name: 'make_tasklist_template',
		description: 'Convert a task list into a template in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
} as const;
