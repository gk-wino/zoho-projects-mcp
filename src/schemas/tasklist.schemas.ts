import { paginationProperties, projectIdProperty } from './common.js';

export const tasklistSchemas = {
	list_tasklists: {
		name: 'list_tasklists',
		description: 'List task lists from a project or portal. Use `project_id` to scope the task list lookup to one project, or omit it for portal-level task list listing when that behavior is supported. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID when you want to limit task lists to one project. Omit it for portal-level task list listing when supported.',
				},
				...paginationProperties,
			},
		},
	},
	get_tasklist: {
		name: 'get_tasklist',
		description: 'Get details of a specific task list. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_tasklist: {
		name: 'create_tasklist',
		description: 'Create a new task list in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `name`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Task list name to create.' },
				milestone_id: {
					type: 'string',
					description: 'Milestone or phase ID to associate with the task list.',
				},
				flag: {
					type: 'string',
					description: 'Task list visibility flag. Allowed values: `internal`, `external`.',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Task list status text accepted by Zoho.' },
			},
			required: ['project_id', 'name'],
		},
	},
	update_tasklist: {
		name: 'update_tasklist',
		description: 'Update a task list. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				name: { type: 'string', description: 'Updated task list name.' },
				milestone_id: { type: 'string', description: 'Updated milestone or phase ID for the task list.' },
				flag: {
					type: 'string',
					description: 'Updated task list visibility flag. Allowed values: `internal`, `external`.',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Updated task list status text accepted by Zoho.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	delete_tasklist: {
		name: 'delete_tasklist',
		description: 'Delete a task list. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_default_tasklist: {
		name: 'create_default_tasklist',
		description: 'Create a default task list for a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `flag`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				flag: {
					type: 'string',
					description: 'Visibility flag for the default task list to create. Allowed values: `internal`, `external`.',
					enum: ['internal', 'external'],
				},
			},
			required: ['project_id', 'flag'],
		},
	},
	// Comments operations
	get_tasklist_comments: {
		name: 'get_tasklist_comments',
		description: 'Retrieve multiple comments from a task list. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Comment sort expression. Use `ASC(field_name)` or `DESC(field_name)`.',
				},
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	get_tasklist_comment: {
		name: 'get_tasklist_comment',
		description: 'Retrieve a specific comment from a task list. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `tasklist_id`, `comment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				comment_id: { type: 'string', description: 'Comment ID. Obtain from the relevant list-comments tool.' },
			},
			required: ['project_id', 'tasklist_id', 'comment_id'],
		},
	},
	add_tasklist_comment: {
		name: 'add_tasklist_comment',
		description: 'Add a comment to a task list. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `tasklist_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				comment: {
					type: 'string',
					description:
						'Comment text to create or update.',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the new task list comment (maximum 10 items).',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'tasklist_id', 'comment'],
		},
	},
	update_tasklist_comment: {
		name: 'update_tasklist_comment',
		description: 'Modify a comment in a task list. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `tasklist_id`, `comment_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				comment_id: { type: 'string', description: 'Comment ID. Obtain from the relevant list-comments tool.' },
				comment: {
					type: 'string',
					description:
						'Comment text to create or update.',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the updated task list comment (maximum 10 items).',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'tasklist_id', 'comment_id', 'comment'],
		},
	},
	delete_tasklist_comment: {
		name: 'delete_tasklist_comment',
		description: 'Remove a comment from a task list. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `tasklist_id`, `comment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				comment_id: { type: 'string', description: 'Comment ID. Obtain from the relevant list-comments tool.' },
			},
			required: ['project_id', 'tasklist_id', 'comment_id'],
		},
	},
	// Followers operations
	get_tasklist_followers: {
		name: 'get_tasklist_followers',
		description: 'Retrieve followers for a task list. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
				...paginationProperties,
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	follow_tasklist: {
		name: 'follow_tasklist',
		description: 'Follow a task list in a project to receive updates and notifications. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	unfollow_tasklist: {
		name: 'unfollow_tasklist',
		description: 'Unfollow a task list in a project to stop receiving updates and notifications. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	// Template operations
	get_tasklist_templates: {
		name: 'get_tasklist_templates',
		description:
			'Retrieve task lists that are associated with a template in the Zoho Projects portal. Use this when you already know the parent record or identifier and need the returned details or related records. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
			},
		},
	},
	get_tasks_from_tasklist_template: {
		name: 'get_tasks_from_tasklist_template',
		description: 'Retrieve tasks from a task list template. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				tasklist_id: {
					type: 'string',
					description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.',
				},
				...paginationProperties,
			},
			required: ['tasklist_id'],
		},
	},
	make_tasklist_template: {
		name: 'make_tasklist_template',
		description: 'Convert a task list into a template in a project. Use this when the returned action or record matches the identifiers and filters you already have available. Required: `project_id`, `tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task list ID. Obtain from `list_tasklists` or the relevant template tool.' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
} as const;
