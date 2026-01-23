import { paginationProperties, projectIdProperty } from './common.js';

export const issueSchemas = {
	list_issues: {
		name: 'list_issues',
		description: 'List issues from a project or portal. Requires page and per_page parameters.',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: {
					type: 'string',
					description: 'Project ID (optional for portal-level)',
				},
				page: {
					type: 'number',
					description: 'Page number (required)',
					default: 1,
				},
				per_page: {
					type: 'number',
					description: 'Items per page (required)',
					default: 10,
				},
			},
			required: ['page', 'per_page'],
		},
	},
	get_issue: {
		name: 'get_issue',
		description: 'Get details of a specific issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	create_issue: {
		name: 'create_issue',
		description: 'Create a new issue in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Issue name/title' },
				description: { type: 'string', description: 'Issue description' },
				flag: {
					type: 'string',
					description: 'Issue flag type',
					enum: ['Internal', 'External'],
				},
				due_date: {
					type: 'string',
					description: 'Due date (YYYY-MM-DD)',
				},
				assignee_zpuid: {
					type: 'string',
					description: 'Assignee user ZPUID',
				},
				severity_id: { type: 'string', description: 'Severity ID' },
				classification_id: {
					type: 'string',
					description: 'Classification ID',
				},
				module_id: { type: 'string', description: 'Module ID' },
			},
			required: ['project_id', 'name'],
		},
	},
	update_issue: {
		name: 'update_issue',
		description: 'Update an existing issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				name: { type: 'string', description: 'Issue name/title' },
				description: { type: 'string', description: 'Issue description' },
				flag: {
					type: 'string',
					description: 'Issue flag type',
					enum: ['Internal', 'External'],
				},
				due_date: {
					type: 'string',
					description: 'Due date (YYYY-MM-DD)',
				},
				assignee_zpuid: {
					type: 'string',
					description: 'Assignee user ZPUID',
				},
				severity_id: { type: 'string', description: 'Severity ID' },
				classification_id: {
					type: 'string',
					description: 'Classification ID',
				},
				module_id: { type: 'string', description: 'Module ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	delete_issue: {
		name: 'delete_issue',
		description: 'Delete an issue from a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	move_issue: {
		name: 'move_issue',
		description: 'Move an issue to another project',
		inputSchema: {
			type: 'object',
			properties: {
				project_id: { type: 'string', description: 'Source project ID' },
				issue_id: { type: 'string', description: 'Issue ID' },
				to_project: { type: 'string', description: 'Target project ID' },
			},
			required: ['project_id', 'issue_id', 'to_project'],
		},
	},
	clone_issue: {
		name: 'clone_issue',
		description: 'Clone an issue within the same project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_activities: {
		name: 'get_issue_activities',
		description: 'Get activities performed on an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				...paginationProperties,
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_comments: {
		name: 'get_issue_comments',
		description: 'Get all comments of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				...paginationProperties,
			},
			required: ['project_id', 'issue_id'],
		},
	},
	add_issue_comment: {
		name: 'add_issue_comment',
		description: 'Add a comment to an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				comment: { type: 'string', description: 'Comment content' },
			},
			required: ['project_id', 'issue_id', 'comment'],
		},
	},
	update_issue_comment: {
		name: 'update_issue_comment',
		description: 'Update a comment on an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				comment_id: { type: 'string', description: 'Comment ID' },
				comment: {
					type: 'string',
					description: 'Updated comment content',
				},
			},
			required: ['project_id', 'issue_id', 'comment_id', 'comment'],
		},
	},
	delete_issue_comment: {
		name: 'delete_issue_comment',
		description: 'Delete a comment from an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				comment_id: { type: 'string', description: 'Comment ID' },
			},
			required: ['project_id', 'issue_id', 'comment_id'],
		},
	},
	get_issue_description: {
		name: 'get_issue_description',
		description: 'Retrieve the description of an issue in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_status_transition: {
		name: 'get_issue_status_transition',
		description: 'Retrieve the status transition history of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_linked_issues: {
		name: 'get_issue_linked_issues',
		description: 'Retrieve all linked issues of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	link_issues: {
		name: 'link_issues',
		description: 'Establish a link between multiple issues',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Source issue ID' },
				link_type: {
					type: 'string',
					description: 'Link type name (e.g., "Related to", "Blocks", "Duplicate of")',
				},
				issue_ids: {
					type: 'array',
					description: 'Array of issue IDs to link',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'link_type', 'issue_ids'],
		},
	},
	bulk_link_issues: {
		name: 'bulk_link_issues',
		description: 'Link multiple issues at once in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				link_type: {
					type: 'string',
					description: 'Link type name',
				},
				issue_ids: {
					type: 'array',
					description: 'Array of source issue IDs',
					items: { type: 'string' },
				},
				linking_issue_ids: {
					type: 'array',
					description: 'Array of issue IDs to be linked',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'link_type', 'issue_ids', 'linking_issue_ids'],
		},
	},
	change_link_type: {
		name: 'change_link_type',
		description: 'Update the link type between two linked issues',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				link_id: { type: 'string', description: 'Link ID' },
				link_type: { type: 'string', description: 'New link type name' },
			},
			required: ['project_id', 'issue_id', 'link_id', 'link_type'],
		},
	},
	unlink_issues: {
		name: 'unlink_issues',
		description: 'Remove the link between issues in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				link_id: { type: 'string', description: 'Link ID to remove' },
			},
			required: ['project_id', 'issue_id', 'link_id'],
		},
	},
	get_issue_associated_tasks: {
		name: 'get_issue_associated_tasks',
		description: 'Retrieve the tasks associated with an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				sindex: {
					type: 'string',
					description: 'Index of the record (optional)',
				},
			},
			required: ['project_id', 'issue_id'],
		},
	},
	associate_tasks_to_issue: {
		name: 'associate_tasks_to_issue',
		description: 'Associate tasks with a specific issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				task_ids: {
					type: 'array',
					description: 'Array of task IDs to associate',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'task_ids'],
		},
	},
	bulk_associate_tasks: {
		name: 'bulk_associate_tasks',
		description: 'Associate multiple tasks with multiple issues in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_ids: {
					type: 'array',
					description: 'Array of issue IDs',
					items: { type: 'string' },
				},
				task_ids: {
					type: 'array',
					description: 'Array of task IDs to associate',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_ids', 'task_ids'],
		},
	},
	dissociate_task_from_issue: {
		name: 'dissociate_task_from_issue',
		description: 'Dissociate a task from an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				task_id: { type: 'string', description: 'Task ID to dissociate' },
			},
			required: ['project_id', 'issue_id', 'task_id'],
		},
	},
	get_issue_resolution: {
		name: 'get_issue_resolution',
		description: 'Retrieve the resolution of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	add_issue_resolution: {
		name: 'add_issue_resolution',
		description: 'Add a resolution to an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				resolution: {
					type: 'string',
					description: 'Resolution content',
				},
				status_id: {
					type: 'string',
					description: 'Status ID (optional)',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs (optional)',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'resolution'],
		},
	},
	update_issue_resolution: {
		name: 'update_issue_resolution',
		description: 'Modify the resolution of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				resolution: {
					type: 'string',
					description: 'Updated resolution content',
				},
				status_id: {
					type: 'string',
					description: 'Status ID (optional)',
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs (optional)',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'resolution'],
		},
	},
	delete_issue_resolution: {
		name: 'delete_issue_resolution',
		description: 'Remove the resolution of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_followers: {
		name: 'get_issue_followers',
		description: 'Retrieve the followers of an issue in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	follow_issue: {
		name: 'follow_issue',
		description: 'Follow an issue to receive updates or notifications',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				follower_ids: {
					type: 'array',
					description: 'Array of user ZPUIDs to add as followers',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'follower_ids'],
		},
	},
	remove_issue_followers: {
		name: 'remove_issue_followers',
		description: 'Remove followers from an issue in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
			},
			required: ['project_id', 'issue_id'],
		},
	},
	get_issue_attachments: {
		name: 'get_issue_attachments',
		description: 'Retrieve all attachments of an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				extension_ids: {
					type: 'array',
					description: 'Extension IDs to filter (optional)',
					items: { type: 'string' },
				},
				app_types: {
					type: 'array',
					description: 'Application types to filter (optional)',
					items: { type: 'string' },
				},
				sub_type: {
					type: 'string',
					description: 'Sub type filter: comments, resolution, or bug (optional)',
				},
			},
			required: ['project_id', 'issue_id'],
		},
	},
	associate_issue_attachments: {
		name: 'associate_issue_attachments',
		description: 'Associate attachments with an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate',
					items: { type: 'string' },
				},
			},
			required: ['project_id', 'issue_id', 'attachment_ids'],
		},
	},
	dissociate_issue_attachment: {
		name: 'dissociate_issue_attachment',
		description: 'Dissociate an attachment from an issue',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				issue_id: { type: 'string', description: 'Issue ID' },
				attachment_id: {
					type: 'string',
					description: 'Attachment ID to dissociate',
				},
			},
			required: ['project_id', 'issue_id', 'attachment_id'],
		},
	},
} as const;
