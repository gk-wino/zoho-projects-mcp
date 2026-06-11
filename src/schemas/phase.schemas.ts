import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

export const phaseSchemas = {
	get_phases: {
		name: 'get_phases',
		description: 'Retrieve all phases from the portal with optional filtering and sorting. Use this when you already know the parent record or identifier and need the returned details or related records. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Sort order for results.',
				},
				view_id: {
					type: 'number',
					description: 'ID of the custom view.',
				},
				milestone_ids: {
					type: 'string',
					description: 'Comma-separated IDs of phases to retrieve.',
				},
				filter: {
					type: 'object',
					description: 'Filter criteria for phases (JSON object).',
				},
			},
			required: [],
		},
	},
	list_phases: {
		name: 'list_phases',
		description:
			'List phases/milestones from a specific project with optional filtering and sorting. Use this to browse matching records and collect identifiers for follow-up detail or mutation tools. Required: `project_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Sort order for results.',
				},
				view_id: {
					type: 'number',
					description: 'ID of the custom view.',
				},
				milestone_ids: {
					type: 'string',
					description: 'Comma-separated IDs of phases to retrieve.',
				},
				filter: {
					type: 'object',
					description: 'Filter criteria for phases (JSON object).',
				},
			},
			required: ['project_id'],
		},
	},
	get_phase_detail: {
		name: 'get_phase_detail',
		description: 'Retrieve detailed information about a specific phase. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	create_phase: {
		name: 'create_phase',
		description: 'Create a new phase/milestone in a project. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use MM/DD/YYYY. Required: `project_id`, `name`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: {
					type: 'string',
					description: 'Phase or milestone name to create (maximum 100 characters).',
				},
				start_date: {
					type: 'string',
					description: 'Start date (MM/DD/YYYY format e.g., 12/30/2023).',
				},
				end_date: {
					type: 'string',
					description: 'End date (MM/DD/YYYY format e.g., 12/31/2023).',
				},
				owner_zpuid: {
					type: 'string',
					description: 'User ZPUID for the phase owner.',
				},
				flag: {
					type: 'string',
					description: 'Flag type: internal or external.',
					enum: ['internal', 'external'],
				},
				status_id: {
					type: 'number',
					description: 'ID of the status.',
				},
				tagIds: {
					type: 'string',
					description: 'Comma-separated tag IDs to associate with the phase.',
				},
				next: {
					type: 'number',
					description: 'Phase ID that should follow this phase.',
				},
				previous: {
					type: 'number',
					description: 'Phase ID that should precede this phase.',
				},
				budget: {
					type: 'string',
					description: 'Budget for the phase.',
				},
				threshold: {
					type: 'string',
					description: 'Threshold value for the budget.',
				},
				hourly_budget: {
					type: 'string',
					description: 'Hourly budget for the phase.',
				},
				hourly_budget_threshold: {
					type: 'string',
					description: 'Hourly budget threshold.',
				},
				revenue_budget: {
					type: 'string',
					description: 'Revenue budget for the phase.',
				},
			},
			required: ['project_id', 'name'],
		},
	},
	update_phase: {
		name: 'update_phase',
		description: 'Update an existing phase in a project. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use MM/DD/YYYY. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				name: {
					type: 'string',
					description: 'Updated phase or milestone name (maximum 100 characters).',
				},
				start_date: {
					type: 'string',
					description: 'Start date (MM/DD/YYYY format e.g., 12/30/2023).',
				},
				end_date: {
					type: 'string',
					description: 'End date (MM/DD/YYYY format e.g., 12/31/2023).',
				},
				owner_zpuid: {
					type: 'string',
					description: 'Updated user ZPUID for the phase owner.',
				},
				flag: {
					type: 'string',
					description: 'Flag type: internal or external.',
					enum: ['internal', 'external'],
				},
				status_id: {
					type: 'number',
					description: 'ID of the milestone status.',
				},
				tagIds: {
					type: 'string',
					description: 'Comma-separated tag IDs to associate with the phase.',
				},
				budget: {
					type: 'string',
					description: 'Budget for the phase.',
				},
				threshold: {
					type: 'string',
					description: 'Threshold value for the budget.',
				},
				hourly_budget: {
					type: 'string',
					description: 'Hourly budget for the phase.',
				},
				hourly_budget_threshold: {
					type: 'string',
					description: 'Hourly budget threshold.',
				},
				revenue_budget: {
					type: 'number',
					description: 'Revenue budget for the phase.',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	delete_phase: {
		name: 'delete_phase',
		description: 'Remove a phase from a project permanently. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	move_phase: {
		name: 'move_phase',
		description: 'Move a phase to another project. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `phase_id`, `to_project`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				to_project: {
					type: 'number',
					description: 'Target project ID where the phase should be moved.',
				},
			},
			required: ['project_id', 'phase_id', 'to_project'],
		},
	},
	clone_phase: {
		name: 'clone_phase',
		description: 'Clone a phase within the same project. Use this to manage relationships, duplication, movement, or follow state between existing records. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_activities: {
		name: 'get_phase_activities',
		description: 'Get all activities performed on a phase. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_status_transition: {
		name: 'get_phase_status_transition',
		description: 'Retrieve the status transition history of a phase. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_followers: {
		name: 'get_phase_followers',
		description: 'Retrieve all followers of a phase. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `phase_id`, `page`, `per_page`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id', 'page', 'per_page'],
		},
	},
	add_phase_followers: {
		name: 'add_phase_followers',
		description: 'Add followers to a phase to receive updates. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `phase_id`, `followers`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				followers: {
					type: 'array',
					description: 'Array of user ZPUIDs to add as followers for the phase (maximum 100).',
					items: {
						type: 'string',
					},
				},
			},
			required: ['project_id', 'phase_id', 'followers'],
		},
	},
	remove_phase_followers: {
		name: 'remove_phase_followers',
		description: 'Remove followers from a phase. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `phase_id`, `followers`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				followers: {
					type: 'array',
					description: 'Array of user ZPUIDs to remove as followers for the phase (maximum 100).',
					items: {
						type: 'string',
					},
				},
			},
			required: ['project_id', 'phase_id', 'followers'],
		},
	},
	get_phase_comments: {
		name: 'get_phase_comments',
		description: 'Retrieve all comments on a phase. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `phase_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				sort_order: {
					type: 'string',
					description: 'Sort order: ascending or descending.',
					enum: ['ascending', 'descending'],
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id'],
		},
	},
	add_phase_comment: {
		name: 'add_phase_comment',
		description: 'Add a comment to a phase. Use this to create a new record or association once you already have the required parent identifiers and payload values. Required: `project_id`, `phase_id`, `content`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				content: {
					type: 'string',
					description:
						'Comment content. Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				notify: {
					type: 'array',
					description: 'Array of user IDs to notify about the new phase comment (maximum 100).',
					items: {
						type: 'string',
					},
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the new phase comment (maximum 100).',
					items: {
						type: 'string',
					},
				},
			},
			required: ['project_id', 'phase_id', 'content'],
		},
	},
	update_phase_comment: {
		name: 'update_phase_comment',
		description: 'Update an existing comment on a phase. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Required: `project_id`, `phase_id`, `comment_id`, `content`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID. Obtain from the relevant list-comments tool.',
				},
				content: {
					type: 'string',
					description:
						'Updated comment content. Supports HTML/WYSIWYG formatting: headers, text styles (bold/italic/underline), colors, lists, code blocks, links, tables, images. Use <p><br/></p> for spacing between sections. See docs/wysiwyg.md for complete formatting guide.',
				},
				notify: {
					type: 'array',
					description: 'Array of user IDs to notify about the updated phase comment (maximum 100).',
					items: {
						type: 'string',
					},
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate with the updated phase comment (maximum 100).',
					items: {
						type: 'string',
					},
				},
			},
			required: ['project_id', 'phase_id', 'comment_id', 'content'],
		},
	},
	delete_phase_comment: {
		name: 'delete_phase_comment',
		description: 'Remove a comment from a phase. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`, `phase_id`, `comment_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase or milestone ID. Obtain from `list_phases` or the relevant detail tool.',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID. Obtain from the relevant list-comments tool.',
				},
			},
			required: ['project_id', 'phase_id', 'comment_id'],
		},
	},
} as const;
