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
		description: 'List tasks from a project or portal. Use `project_id` to scope the task list to one project, or omit it for portal-level task listing when that behavior is supported. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID when you want to limit the task list to one project. Omit it for portal-level task listing when supported.',
				},
				...paginationProperties,
			},
		},
	},
	get_task: {
		name: 'get_task',
		description: 'Get details of a specific task. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: { type: 'string', description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.' },
			},
			required: ['project_id', 'task_id'],
		},
	},
	create_task: {
		name: 'create_task',
		description:
			'Create a new task in a project task list. Tasks must be created within a task list. If tasklist_id is not provided, the general/default task list will be used (if it exists). Use create_default_tasklist first if no default task list exists. To create a subtask, provide parent_task_id. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use ISO 8601; `duration` may require HH:MM when using hour-based duration. Required: `project_id`, `name`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID where the task will be created. Obtain from `list_projects`.',
				},
				tasklist_id: {
					type: 'string',
					description:
						'Task list ID where the task will be created. If omitted, Zoho uses the general or default task list when available.',
				},
				parent_task_id: {
					type: 'string',
					description:
						'Parent task ID when creating a subtask.',
				},
				name: { type: 'string', description: 'Task name to create.' },
				description: {
					type: 'string',
					description:
						'Task description (optional). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				...priorityProperty,
				...isoDateProperties,
				assignee_zpuid: {
					type: 'string',
					description: 'Assignee user ZPUID for the task.',
				},
				status: {
					type: 'object',
					description:
						'Task status object, typically with an `id` field.',
				},
				duration: {
					type: 'object',
					description:
						'Task duration as JSON object with value and type fields. Example: {"value": "5", "type": "days"} or {"value": "3:00", "type": "hours"}. When using type "hours", value must be in HH:MM format (e.g., "2:30" for 2.5 hours).',
				},
				completion_percentage: {
					type: 'number',
					description: 'Task completion percentage (0-100).',
				},
				billing_type: {
					type: 'string',
					description: 'Billing type for the task. Allowed values: `none`, `billable`, `non_billable`.',
					enum: ['none', 'billable', 'non_billable'],
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of file attachment IDs to associate with the task (maximum 10 items).',
				},
				owners_and_work: {
					type: 'object',
					description:
						'Owner and work allocation object for the task, including owner ZPUIDs and work values.',
				},
				tags: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of tags for the task.',
				},
				teams: {
					type: 'array',
					items: { type: 'object' },
					description: 'Array of team objects to associate with the task.',
				},
				recurrence: {
					type: 'object',
					description: 'Recurrence details of the task as JSON object.',
				},
				budget_info: {
					type: 'object',
					description:
						'Budget details of the task as JSON object. Can include fields like budget, revenue_budget, threshold, exchange_rate.',
				},
			},
			required: ['project_id', 'name'],
		},
	},
	update_task: {
		name: 'update_task',
		description:
			'Update a task properties. You can also move a task to a different task list by providing tasklist_id. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use ISO 8601; `duration` may require HH:MM when using hour-based duration. Required: `project_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				tasklist_id: {
					type: 'string',
					description:
						'Task list ID when moving the task to a different task list.',
				},
				name: {
					type: 'string',
					description: 'Updated task name.',
				},
				description: {
					type: 'string',
					description:
						'Task description (optional - only if updating). Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				...priorityProperty,
				...isoDateProperties,
				assignee_zpuid: {
					type: 'string',
					description: 'Updated assignee user ZPUID for the task.',
				},
				status: {
					type: 'object',
					description: 'Updated task status object, typically with an `id` field.',
				},
				duration: {
					type: 'object',
					description:
						'Task duration as JSON object with value and type fields. Example: {"value": "5", "type": "days"} or {"value": "3:00", "type": "hours"}. When using type "hours", value must be in HH:MM format (e.g., "2:30" for 2.5 hours).',
				},
				completion_percentage: {
					type: 'number',
					description: 'Task completion percentage (0-100).',
				},
				billing_type: {
					type: 'string',
					description: 'Billing type for the task. Allowed values: `none`, `billable`, `non_billable`.',
					enum: ['none', 'billable', 'non_billable'],
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of file attachment IDs to associate with the task (maximum 10 items).',
				},
				owners_and_work: {
					type: 'object',
					description:
						'Updated owner and work allocation object for the task.',
				},
				tags: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of tags for the task.',
				},
				teams: {
					type: 'array',
					items: { type: 'object' },
					description: 'Array of team objects to add or remove from the task.',
				},
				recurrence: {
					type: 'object',
					description: 'Recurrence details of the task as JSON object.',
				},
				reminder: {
					type: 'object',
					description: 'Reminder configuration object for the task.',
				},
				budget_info: {
					type: 'object',
					description:
						'Budget details of the task as JSON object. Can include fields like budget, revenue_budget, threshold, exchange_rate.',
				},
				remove_dependency_lag: {
					type: 'boolean',
					description: 'Set to true to forcefully remove dependency lag.',
				},
			},
			required: ['project_id', 'task_id'],
		},
	},
	delete_task: {
		name: 'delete_task',
		description: 'Delete a task. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				task_id: { type: 'string', description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.' },
			},
			required: ['project_id', 'task_id'],
		},
	},
	clone_task: {
		name: 'clone_task',
		description:
			'Clone a task to create multiple instances within the same project. Each cloned instance will have the same properties as the original task. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `task_id`, `no_of_instances`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				no_of_instances: {
					type: 'number',
					description: 'Number of task instances to create (must be at least 1).',
					default: 1,
				},
			},
			required: ['project_id', 'task_id', 'no_of_instances'],
		},
	},
	move_task: {
		name: 'move_task',
		description:
			'Move a task to a different task list within the same project. This requires the target task list ID and optional status mapping. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `task_id`, `target_tasklist_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				target_tasklist_id: {
					type: 'string',
					description: 'Target task list ID where the task should be moved.',
				},
			},
			required: ['project_id', 'task_id', 'target_tasklist_id'],
		},
	},
	get_associated_bugs: {
		name: 'get_associated_bugs',
		description: 'Get all bugs/issues associated with a specific task. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
			},
			required: ['project_id', 'task_id'],
		},
	},
	associate_bugs: {
		name: 'associate_bugs',
		description:
			'Associate one or more bugs/issues with a task. This creates a link between the task and the specified bugs. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `task_id`, `bug_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				bug_ids: {
					type: 'array',
					items: { type: 'string' },
					description:
						'Array of issue IDs to associate with the task.',
				},
			},
			required: ['project_id', 'task_id', 'bug_ids'],
		},
	},
	disassociate_bug: {
		name: 'disassociate_bug',
		description:
			'Remove the association between a task and a bug/issue. This breaks the link but does not delete the bug. Use this when the returned action or record matches the identifiers and filters you already have available. Required: `project_id`, `task_id`, `bug_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				bug_id: {
					type: 'string',
					description:
						'Issue ID to remove from the task association list.',
				},
			},
			required: ['project_id', 'task_id', 'bug_id'],
		},
	},
	list_task_comments: {
		name: 'list_task_comments',
		description: 'Get all comments for a specific task. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools. Required: `project_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				page: {
					type: 'number',
					description: 'Page number for pagination (1-based; default: 1).',
					default: 1,
				},
				per_page: {
					type: 'number',
					description: 'Maximum number of records to return per page for pagination.',
					default: 10,
				},
				sort_by: {
					type: 'string',
					description: 'Comment sort field, for example `created_time` or `modified_time`.',
				},
			},
			required: ['project_id', 'task_id'],
		},
	},
	add_task_comment: {
		name: 'add_task_comment',
		description: 'Add a new comment to a task. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `task_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				comment: {
					type: 'string',
					description:
						'Comment text to create or update.',
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of attachment IDs to associate with the new task comment.',
				},
			},
			required: ['project_id', 'task_id', 'comment'],
		},
	},
	update_task_comment: {
		name: 'update_task_comment',
		description: 'Update an existing task comment. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `task_id`, `comment_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID. Obtain from the relevant list-comments tool.',
				},
				comment: {
					type: 'string',
					description:
						'Comment text to create or update.',
				},
				attachments: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of attachment IDs to associate with the updated task comment.',
				},
			},
			required: ['project_id', 'task_id', 'comment_id', 'comment'],
		},
	},
	delete_task_comment: {
		name: 'delete_task_comment',
		description: 'Delete a task comment. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `task_id`, `comment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID. Obtain from `list_projects`.',
				},
				task_id: {
					type: 'string',
					description: 'Task ID. Obtain from `list_tasks` or the relevant detail tool.',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID. Obtain from the relevant list-comments tool.',
				},
			},
			required: ['project_id', 'task_id', 'comment_id'],
		},
	},
} as const;
