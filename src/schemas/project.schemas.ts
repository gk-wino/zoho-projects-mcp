import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

export const projectSchemas = {
	list_projects: {
		name: 'list_projects',
		description: 'List all projects in a portal',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
			},
		},
	},
	get_project: {
		name: 'get_project',
		description: 'Get details of a specific project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
	create_project: {
		name: 'create_project',
		description: 'Create a new project in the Zoho Projects portal',
		inputSchema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'Project name (max 200 characters)',
				},
				description: {
					type: 'string',
					description: 'Project description (max 80000 characters)',
				},
				...dateRangeProperties,
				project_type: {
					type: 'string',
					description: 'Project type',
					enum: ['active', 'template'],
				},
				owner: {
					type: 'object',
					description: 'Project owner object with zpuid',
					properties: {
						zpuid: { type: 'string', description: 'Owner ZPUID' },
					},
				},
				is_public_project: {
					type: 'boolean',
					description: 'Whether the project is public (true or false)',
				},
				status: {
					type: 'object',
					description: 'Project status object with id',
					properties: {
						id: { type: 'string', description: 'Status ID' },
					},
				},
				layout: {
					type: 'object',
					description: 'Project layout details with id',
					properties: {
						id: { type: 'string', description: 'Layout ID' },
					},
				},
				added_via: {
					type: 'string',
					description: 'Source from which project is added',
					enum: ['web', 'api'],
				},
				is_rollup_project: {
					type: 'boolean',
					description: 'Whether this is a roll-up project (true or false)',
				},
				budget_info: {
					type: 'object',
					description: 'Project budget details (max 80000 characters)',
				},
				project_group: {
					type: 'object',
					description: 'Project group details with id',
					properties: {
						id: { type: 'string', description: 'Project group ID' },
					},
				},
				sub_module_settings: {
					type: 'object',
					description: 'Sub-module settings for the project',
				},
				tags: {
					type: 'array',
					description: 'Array of tag IDs for the project (max 10000 chars)',
					items: { type: 'object' },
				},
				copy_from: {
					type: 'string',
					description: 'Template ID or existing project ID to copy from',
				},
			},
			required: ['name'],
		},
	},
	update_project: {
		name: 'update_project',
		description: 'Update an existing project in the Zoho Projects portal',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: {
					type: 'string',
					description: 'Project name (max 200 characters)',
				},
				description: {
					type: 'string',
					description: 'Project description (max 80000 characters)',
				},
				...dateRangeProperties,
				project_type: {
					type: 'string',
					description: 'Project type',
					enum: ['active', 'template', 'archived'],
				},
				owner: {
					type: 'object',
					description: 'Project owner object with zpuid',
					properties: {
						zpuid: { type: 'string', description: 'Owner ZPUID' },
					},
				},
				is_public_project: {
					type: 'boolean',
					description: 'Whether the project is public (true or false)',
				},
				completed_time: {
					type: 'string',
					description: 'Completion timestamp for the project',
				},
				status: {
					type: 'object',
					description: 'Project status object with id',
					properties: {
						id: { type: 'string', description: 'Status ID' },
					},
				},
				layout: {
					type: 'object',
					description: 'Project layout details with id',
					properties: {
						id: { type: 'string', description: 'Layout ID' },
					},
				},
				added_via: {
					type: 'string',
					description: 'Source from which project is added',
					enum: ['web', 'api'],
				},
				is_rollup_project: {
					type: 'boolean',
					description: 'Whether this is a roll-up project (true or false)',
				},
				budget_info: {
					type: 'object',
					description: 'Project budget details (max 80000 characters)',
				},
				project_group: {
					type: 'object',
					description: 'Project group details with id',
					properties: {
						id: { type: 'string', description: 'Project group ID' },
					},
				},
				tags: {
					type: 'array',
					description: 'Array of tag IDs for the project (max 10000 chars)',
					items: { type: 'object' },
				},
			},
			required: ['project_id'],
		},
	},
	trash_project: {
		name: 'trash_project',
		description: 'Move a project to the trash (can be restored within 30 days)',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
	restore_project: {
		name: 'restore_project',
		description: 'Restore a project from the trash',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
	delete_project: {
		name: 'delete_project',
		description: 'Permanently delete a project from the trash (cannot be undone)',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
} as const;
