import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

export const phaseSchemas = {
	get_phases: {
		name: 'get_phases',
		description: 'Retrieve all phases from the portal with optional filtering and sorting',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Sort order for results',
				},
				view_id: {
					type: 'number',
					description: 'ID of the custom view',
				},
				milestone_ids: {
					type: 'string',
					description: 'Comma-separated IDs of phases to retrieve',
				},
				filter: {
					type: 'object',
					description: 'Filter criteria for phases (JSON object)',
				},
			},
			required: [],
		},
	},
	list_phases: {
		name: 'list_phases',
		description:
			'List phases/milestones from a specific project with optional filtering and sorting',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...paginationProperties,
				sort_by: {
					type: 'string',
					description: 'Sort order for results',
				},
				view_id: {
					type: 'number',
					description: 'ID of the custom view',
				},
				milestone_ids: {
					type: 'string',
					description: 'Comma-separated IDs of phases to retrieve',
				},
				filter: {
					type: 'object',
					description: 'Filter criteria for phases (JSON object)',
				},
			},
			required: ['project_id'],
		},
	},
	get_phase_detail: {
		name: 'get_phase_detail',
		description: 'Retrieve detailed information about a specific phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID (obtain from list_phases)',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	create_phase: {
		name: 'create_phase',
		description: 'Create a new phase/milestone in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: {
					type: 'string',
					description: 'Phase name (max 100 characters)',
				},
				start_date: {
					type: 'string',
					description: 'Start date (YYYY-MM-DD format)',
				},
				end_date: {
					type: 'string',
					description: 'End date (YYYY-MM-DD format)',
				},
				owner_zpuid: {
					type: 'string',
					description: 'ZPUID of the phase owner',
				},
				flag: {
					type: 'string',
					description: 'Flag type: internal or external',
					enum: ['internal', 'external'],
				},
				status_id: {
					type: 'number',
					description: 'ID of the status',
				},
				tagIds: {
					type: 'string',
					description: 'Comma-separated tag IDs',
				},
				next: {
					type: 'number',
					description: 'ID of the phase that will follow this new phase',
				},
				previous: {
					type: 'number',
					description: 'ID of the phase that will precede this new phase',
				},
				budget: {
					type: 'string',
					description: 'Budget for the phase',
				},
				threshold: {
					type: 'string',
					description: 'Threshold value for the budget',
				},
				hourly_budget: {
					type: 'string',
					description: 'Hourly budget for the phase',
				},
				hourly_budget_threshold: {
					type: 'string',
					description: 'Hourly budget threshold',
				},
				revenue_budget: {
					type: 'string',
					description: 'Revenue budget for the phase',
				},
			},
			required: ['project_id', 'name'],
		},
	},
	update_phase: {
		name: 'update_phase',
		description: 'Update an existing phase in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID (obtain from list_phases)',
				},
				name: {
					type: 'string',
					description: 'Phase name (max 100 characters)',
				},
				start_date: {
					type: 'string',
					description: 'Start date (YYYY-MM-DD format)',
				},
				end_date: {
					type: 'string',
					description: 'End date (YYYY-MM-DD format)',
				},
				owner_zpuid: {
					type: 'string',
					description: 'ZPUID of the phase owner',
				},
				flag: {
					type: 'string',
					description: 'Flag type: internal or external',
					enum: ['internal', 'external'],
				},
				status_id: {
					type: 'number',
					description: 'ID of the milestone status',
				},
				tagIds: {
					type: 'string',
					description: 'Comma-separated tag IDs',
				},
				budget: {
					type: 'string',
					description: 'Budget for the phase',
				},
				threshold: {
					type: 'string',
					description: 'Threshold value for the budget',
				},
				hourly_budget: {
					type: 'string',
					description: 'Hourly budget for the phase',
				},
				hourly_budget_threshold: {
					type: 'string',
					description: 'Hourly budget threshold',
				},
				revenue_budget: {
					type: 'number',
					description: 'Revenue budget for the phase',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	delete_phase: {
		name: 'delete_phase',
		description: 'Remove a phase from a project permanently',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID to delete',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	move_phase: {
		name: 'move_phase',
		description: 'Move a phase to another project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID to move',
				},
				to_project: {
					type: 'number',
					description: 'ID of the project to which the phase should be moved',
				},
			},
			required: ['project_id', 'phase_id', 'to_project'],
		},
	},
	clone_phase: {
		name: 'clone_phase',
		description: 'Clone a phase within the same project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID to clone',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_activities: {
		name: 'get_phase_activities',
		description: 'Get all activities performed on a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_status_transition: {
		name: 'get_phase_status_transition',
		description: 'Retrieve the status transition history of a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
			},
			required: ['project_id', 'phase_id'],
		},
	},
	get_phase_followers: {
		name: 'get_phase_followers',
		description: 'Retrieve all followers of a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id', 'page', 'per_page'],
		},
	},
	add_phase_followers: {
		name: 'add_phase_followers',
		description: 'Add followers to a phase to receive updates',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				followers: {
					type: 'array',
					description: 'Array of user ZPUIDs to add as followers (max 100)',
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
		description: 'Remove followers from a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				followers: {
					type: 'array',
					description: 'Array of user ZPUIDs to remove as followers (max 100)',
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
		description: 'Retrieve all comments on a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				sort_order: {
					type: 'string',
					description: 'Sort order: ascending or descending',
					enum: ['ascending', 'descending'],
				},
				...paginationProperties,
			},
			required: ['project_id', 'phase_id'],
		},
	},
	add_phase_comment: {
		name: 'add_phase_comment',
		description: 'Add a comment to a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				content: {
					type: 'string',
					description: 'Comment content',
				},
				notify: {
					type: 'array',
					description: 'Array of user IDs to notify (max 100)',
					items: {
						type: 'string',
					},
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate (max 100)',
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
		description: 'Update an existing comment on a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID to update',
				},
				content: {
					type: 'string',
					description: 'Updated comment content',
				},
				notify: {
					type: 'array',
					description: 'Array of user IDs to notify (max 100)',
					items: {
						type: 'string',
					},
				},
				attachment_ids: {
					type: 'array',
					description: 'Array of attachment IDs to associate (max 100)',
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
		description: 'Remove a comment from a phase',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				phase_id: {
					type: 'string',
					description: 'Phase ID',
				},
				comment_id: {
					type: 'string',
					description: 'Comment ID to delete',
				},
			},
			required: ['project_id', 'phase_id', 'comment_id'],
		},
	},
} as const;
