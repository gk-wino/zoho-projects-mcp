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
} as const;
