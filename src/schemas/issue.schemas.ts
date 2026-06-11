import { paginationProperties, projectIdProperty } from './common.js';

export const issueSchemas = {
	list_issues: {
		name: 'list_issues',
		description: 'List issues from a project or portal. Requires page and per_page parameters. Use `project_id` to scope the issue list to one project, or omit it for portal-level issue listing when that behavior is supported. Required: `page`, `per_page`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID when you want to limit issues to one project. Omit it for portal-level issue listing when supported.',
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
			},
			required: ['page', 'per_page'],
		},
	},
	get_issue: {
		name: 'get_issue',
		description: 'Get details of a specific issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	create_issue: {
		name: 'create_issue',
		description: 'Create a new issue in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `due_date` uses YYYY-MM-DD. Required: `project_id`, `name`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Issue title to create.' },
				description: { type: 'string', description: 'Issue description to create.' },
				flag: {
					type: 'string',
					description: 'Issue flag type. Allowed values: `Internal`, `External`.',
					enum: ['Internal', 'External'],
				},
				due_date: {
					type: 'string',
					description: 'Due date (YYYY-MM-DD).',
				},
				assignee_zpuid: {
					type: 'string',
					description: 'Assignee user ZPUID for the issue.',
				},
				severity_id: { type: 'string', description: 'Severity ID.' },
				classification_id: {
					type: 'string',
					description: 'Classification ID.',
				},
				module_id: { type: 'string', description: 'Module ID.' },
			},
			required: ['project_id', 'name'],
		},
	},
	update_issue: {
		name: 'update_issue',
		description: 'Update an existing issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `due_date` uses YYYY-MM-DD. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				name: { type: 'string', description: 'Updated issue title.' },
				description: { type: 'string', description: 'Updated issue description.' },
				flag: {
					type: 'string',
					description: 'Issue flag type. Allowed values: `Internal`, `External`.',
					enum: ['Internal', 'External'],
				},
				due_date: {
					type: 'string',
					description: 'Due date (YYYY-MM-DD).',
				},
				assignee_zpuid: {
					type: 'string',
					description: 'Updated assignee user ZPUID for the issue.',
				},
				severity_id: { type: 'string', description: 'Severity ID.' },
				classification_id: {
					type: 'string',
					description: 'Classification ID.',
				},
				module_id: { type: 'string', description: 'Module ID.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	delete_issue: {
		name: 'delete_issue',
		description: 'Delete an issue from a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	move_issue: {
		name: 'move_issue',
		description: 'Move an issue to another project. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`, `to_project`.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: { type: 'string', description: 'Source project ID that currently contains the issue.' },
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				to_project: { type: 'string', description: 'Target project ID where the issue should be moved.' },
			},
			required: ['project_id', 'issue_id', 'to_project'],
		},
	},
	clone_issue: {
		name: 'clone_issue',
		description: 'Clone an issue within the same project. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_activities: {
		name: 'get_issue_activities',
		description: 'Get activities performed on an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				...paginationProperties,
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_comments: {
		name: 'get_issue_comments',
		description: 'Get all comments of an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				...paginationProperties,
			},
			required: ['project_id', 'issue_id'],
		},
	},
	add_issue_comment: {
		name: 'add_issue_comment',
		description: 'Add a comment to an issue. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `issue_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				comment: { type: 'string', description: 'Comment text to create or update.' },
			},
			required: ['project_id', 'issue_id', 'comment'],
		},
	},
	update_issue_comment: {
		name: 'update_issue_comment',
		description: 'Update a comment on an issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `issue_id`, `comment_id`, `comment`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				comment_id: { type: 'string', description: 'Comment ID. Obtain from the relevant list-comments tool.' },
				comment: {
					type: 'string',
					description: 'Comment text to create or update.',
				},
			},
			required: ['project_id', 'issue_id', 'comment_id', 'comment'],
		},
	},
	delete_issue_comment: {
		name: 'delete_issue_comment',
		description: 'Delete a comment from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`, `comment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				comment_id: { type: 'string', description: 'Comment ID. Obtain from the relevant list-comments tool.' },
			},
			required: ['project_id', 'issue_id', 'comment_id'],
		},
	},
	get_issue_description: {
		name: 'get_issue_description',
		description: 'Retrieve the description of an issue in a project. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_status_transition: {
		name: 'get_issue_status_transition',
		description: 'Retrieve the status transition history of an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_linked_issues: {
		name: 'get_issue_linked_issues',
		description: 'Retrieve all linked issues of an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	link_issues: {
		name: 'link_issues',
		description: 'Establish a link between multiple issues. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`, `link_type`, `issue_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Source issue ID that will link to the target issues.' },
				link_type: {
					type: 'string',
					description: 'Link type to create between the source issue and the target issues.',
				},
				issue_ids: {
					type: 'array',
					description: 'Array of target issue IDs to link to the source issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'link_type', 'issue_ids'],
		},
	},
	bulk_link_issues: {
		name: 'bulk_link_issues',
		description: 'Link multiple issues at once in a project. Use this when the returned action or record matches the identifiers and filters you already have available. Required: `project_id`, `link_type`, `issue_ids`, `linking_issue_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				link_type: {
					type: 'string',
					description: 'Link type to create between the source and target issues.',
				},
				issue_ids: {
					type: 'array',
					description: 'Array of source issue IDs to link from.',
					items: { type: 'string' },
				},
				linking_issue_ids: {
					type: 'array',
					description: 'Array of target issue IDs to link to each source issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'link_type', 'issue_ids', 'linking_issue_ids'],
		},
	},
	change_link_type: {
		name: 'change_link_type',
		description: 'Update the link type between two linked issues. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `issue_id`, `link_id`, `link_type`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				link_id: { type: 'string', description: 'Link ID.' },
				link_type: { type: 'string', description: 'Updated link type for the existing issue link.' },
			},
			required: ['project_id', 'issue_id', 'link_id', 'link_type'],
		},
	},
	unlink_issues: {
		name: 'unlink_issues',
		description: 'Remove the link between issues in a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`, `link_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				link_id: { type: 'string', description: 'Link ID to remove.' },
			},
			required: ['project_id', 'issue_id', 'link_id'],
		},
	},
	get_issue_associated_tasks: {
		name: 'get_issue_associated_tasks',
		description: 'Retrieve the tasks associated with an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				sindex: {
					type: 'string',
					description: 'Record index or cursor value used by Zoho for paging this association list.',
				},
			},
			required: ['project_id', 'issue_id'],
		},
	},
	associate_tasks_to_issue: {
		name: 'associate_tasks_to_issue',
		description: 'Associate tasks with a specific issue. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`, `task_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				task_ids: {
					type: 'array',
					description: 'Array of task IDs to associate with the issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'task_ids'],
		},
	},
	bulk_associate_tasks: {
		name: 'bulk_associate_tasks',
		description: 'Associate multiple tasks with multiple issues in a project. Use this when the returned action or record matches the identifiers and filters you already have available. Required: `project_id`, `issue_ids`, `task_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_ids: {
					type: 'array',
					description: 'Array of issue IDs that should receive the task associations.',
					items: { type: 'string' },
				},
				task_ids: {
					type: 'array',
					description: 'Array of task IDs to associate with each issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_ids', 'task_ids'],
		},
	},
	dissociate_task_from_issue: {
		name: 'dissociate_task_from_issue',
		description: 'Dissociate a task from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`, `task_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				task_id: { type: 'string', description: 'Task ID to remove from the issue association list.' },
			},
			required: ['project_id', 'issue_id', 'task_id'],
		},
	},
	get_issue_resolution: {
		name: 'get_issue_resolution',
		description: 'Retrieve the resolution of an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	add_issue_resolution: {
		name: 'add_issue_resolution',
		description: 'Add a resolution to an issue. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `issue_id`, `resolution`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				resolution: {
					type: 'string',
					description: 'Resolution content.',
				},
				status_id: {
					type: 'string',
					description: 'Status ID (optional).',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the new resolution.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'resolution'],
		},
	},
	update_issue_resolution: {
		name: 'update_issue_resolution',
		description: 'Modify the resolution of an issue. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `issue_id`, `resolution`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				resolution: {
					type: 'string',
					description: 'Updated resolution content.',
				},
				status_id: {
					type: 'string',
					description: 'Status ID (optional).',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the updated resolution.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'resolution'],
		},
	},
	delete_issue_resolution: {
		name: 'delete_issue_resolution',
		description: 'Remove the resolution of an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_followers: {
		name: 'get_issue_followers',
		description: 'Retrieve the followers of an issue in a project. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	follow_issue: {
		name: 'follow_issue',
		description: 'Follow an issue to receive updates or notifications. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`, `follower_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				follower_ids: {
					type: 'array',
					description: 'Array of user ZPUIDs to add as followers for the issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'follower_ids'],
		},
	},
	remove_issue_followers: {
		name: 'remove_issue_followers',
		description: 'Remove followers from an issue in a project. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_attachments: {
		name: 'get_issue_attachments',
		description: 'Retrieve all attachments of an issue. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `issue_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				extension_ids: {
					type: 'array',
					description: 'Array of extension IDs used to filter the returned attachments.',
					items: { type: 'string' },
				},
				app_types: {
					type: 'array',
					description: 'Array of application types used to filter the returned attachments.',
					items: { type: 'string' },
				},
				sub_type: {
					type: 'string',
					description: 'Sub type filter: comments, resolution, or bug (optional).',
				},
			},
			required: ['project_id', 'issue_id'],
		},
	},
	associate_issue_attachments: {
		name: 'associate_issue_attachments',
		description: 'Associate attachments with an issue. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `issue_id`, `attachment_ids`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the issue.',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'attachment_ids'],
		},
	},
	dissociate_issue_attachment: {
		name: 'dissociate_issue_attachment',
		description: 'Dissociate an attachment from an issue. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `issue_id`, `attachment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID. Obtain from `list_issues` or the relevant detail tool.' },
				attachment_id: {
					type: 'string',
					description: 'Attachment ID to dissociate.',
				},
			},
			required: ['project_id', 'issue_id', 'attachment_id'],
		},
	},
} as const;
