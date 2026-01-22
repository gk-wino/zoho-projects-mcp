import {
	paginationProperties,
	projectIdProperty,
	isoDateProperties,
	priorityProperty,
	commentProperties,
} from './common.js';

export const taskSchemas = {
	list_tasks: {
		name: 'list_tasks',
		description: 'List tasks from a project or portal',
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
	get_task: {
		name: 'get_task',
		description: 'Get details of a specific task',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: { type: 'string', description: 'Task ID' },
			},
			required: ['project_id', 'task_id'],
		},
	},
	create_task: {
		name: 'create_task',
		description:
			'Create a new task in a project task list. Tasks must be created within a task list. If tasklist_id is not provided, the general/default task list will be used (if it exists). Use create_default_tasklist first if no default task list exists.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				tasklist_id: {
					type: 'string',
					description:
						'Task list ID (optional - uses general/default task list if not provided. Get from list_tasklists)',
				},
				name: { type: 'string', description: 'Task name (required)' },
				description: {
					type: 'string',
					description: 'Task description (optional)',
				},
				...priorityProperty,
				...isoDateProperties,
				assignee_zpuid: {
					type: 'string',
					description: 'Assignee user ZPUID (optional - get from list_users)',
				},
			},
			required: ['project_id', 'name'],
		},
	},
	update_task: {
		name: 'update_task',
		description:
			'Update a task properties. You can also move a task to a different task list by providing tasklist_id.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				tasklist_id: {
					type: 'string',
					description:
						'Task list ID (optional - only provide if moving task to different task list. Get from list_tasklists)',
				},
				name: {
					type: 'string',
					description: 'Task name (optional - only if updating)',
				},
				description: {
					type: 'string',
					description: 'Task description (optional - only if updating)',
				},
				...priorityProperty,
				...isoDateProperties,
			},
			required: ['project_id', 'task_id'],
		},
	},
	delete_task: {
		name: 'delete_task',
		description: 'Delete a task',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: { type: 'string', description: 'Task ID' },
			},
			required: ['project_id', 'task_id'],
		},
	},
	move_task: {
		name: 'move_task',
		description:
			'Move a task to a different task list within the same project. This requires the target task list ID and optional status mapping.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID to move (obtain from list_tasks or get_task)',
				},
				target_tasklist_id: {
					type: 'string',
					description: 'Target task list ID where task will be moved (obtain from list_tasklists)',
				},
			},
			required: ['project_id', 'task_id', 'target_tasklist_id'],
		},
	},
	get_associated_bugs: {
		name: 'get_associated_bugs',
		description: 'Get all bugs/issues associated with a specific task',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
			},
			required: ['project_id', 'task_id'],
		},
	},
	associate_bugs: {
		name: 'associate_bugs',
		description:
			'Associate one or more bugs/issues with a task. This creates a link between the task and the specified bugs.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				bug_ids: {
					type: 'array',
					items: { type: 'string' },
					description:
						'Array of bug/issue IDs to associate with the task (obtain from list_issues)',
				},
			},
			required: ['project_id', 'task_id', 'bug_ids'],
		},
	},
	disassociate_bug: {
		name: 'disassociate_bug',
		description:
			'Remove the association between a task and a bug/issue. This breaks the link but does not delete the bug.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				bug_id: {
					type: 'string',
					description:
						'Bug/Issue ID to disassociate from the task (obtain from get_associated_bugs)',
				},
			},
			required: ['project_id', 'task_id', 'bug_id'],
		},
	},
	list_task_comments: {
		name: 'list_task_comments',
		description: 'Get all comments for a specific task',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination',
					default: 1,
				},
				per_page: {
					type: 'number',
					description: 'Number of comments per page',
					default: 10,
				},
				sort_by: {
					type: 'string',
					description: 'Sort order for comments (e.g., "created_time" or "modified_time")',
				},
			},
			required: ['project_id', 'task_id'],
		},
	},
	add_task_comment: {
		name: 'add_task_comment',
		description: 'Add a new comment to a task',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				comment: {
					type: 'string',
					description: 'The comment text/content to add',
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Optional array of attachment IDs',
				},
			},
			required: ['project_id', 'task_id', 'comment'],
		},
	},
	update_task_comment: {
		name: 'update_task_comment',
		description: 'Update an existing task comment',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID to update (obtain from list_task_comments)',
				},
				comment: {
					type: 'string',
					description: 'The updated comment text/content',
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Optional array of attachment IDs',
				},
			},
			required: ['project_id', 'task_id', 'comment_id', 'comment'],
		},
	},
	delete_task_comment: {
		name: 'delete_task_comment',
		description: 'Delete a task comment',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (obtain from list_projects)',
				},
				task_id: {
					type: 'string',
					description: 'Task ID (obtain from list_tasks or get_task)',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID to delete (obtain from list_task_comments)',
				},
			},
			required: ['project_id', 'task_id', 'comment_id'],
		},
	},
} as const;
