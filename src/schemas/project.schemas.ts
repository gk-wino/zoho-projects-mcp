import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

export const projectSchemas = {
	list_projects: {
		name: 'list_projects',
		description: 'List all projects in a portal. Use this to browse projects, collect `project_id` values, and scope follow-up project, task, issue, or phase operations. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				...paginationProperties,
			},
		},
	},
	get_project: {
		name: 'get_project',
		description: 'Get details of a specific project. Use this when you already know the project identifier and need the full project record. Required: `project_id`.',
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
		description: 'Create a new project in the Zoho Projects portal. Use this to create a new record or association once you already have the required parent identifiers and payload values. Formats: `start_date`, `end_date` use YYYY-MM-DD. Required: `name`.',
		inputSchema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					description: 'Project name to create (maximum 200 characters).',
				},
				description: {
					type: 'string',
					description: 'Project description to create (maximum 80000 characters).',
				},
				...dateRangeProperties,
				project_type: {
					type: 'string',
					description: 'Project type for the new project. Allowed values: `active`, `template`.',
					enum: ['active', 'template'],
				},
				owner: {
					type: 'object',
					description: 'Project owner object with zpuid.',
					properties: {
						zpuid: { type: 'string', description: 'Owner ZPUID.' },
					},
				},
				is_public_project: {
					type: 'boolean',
					description: 'Whether the project is public (true or false).',
				},
				status: {
					type: 'object',
					description: 'Project status object with id.',
					properties: {
						id: { type: 'string', description: 'Status ID.' },
					},
				},
				layout: {
					type: 'object',
					description: 'Project layout details with id.',
					properties: {
						id: { type: 'string', description: 'Layout ID.' },
					},
				},
				added_via: {
					type: 'string',
					description: 'Source used to create the project. Allowed values: `web`, `api`.',
					enum: ['web', 'api'],
				},
				is_rollup_project: {
					type: 'boolean',
					description: 'Whether this is a roll-up project (true or false).',
				},
				budget_info: {
					type: 'object',
					description: 'Project budget details (max 80000 characters).',
				},
				project_group: {
					type: 'object',
					description: 'Project group details with id.',
					properties: {
						id: { type: 'string', description: 'Project group ID.' },
					},
				},
				sub_module_settings: {
					type: 'object',
					description: 'Sub-module settings for the project.',
				},
				tags: {
					type: 'array',
					description: 'Array of tag objects or IDs to associate with the project.',
					items: { type: 'object' },
				},
				copy_from: {
					type: 'string',
					description: 'Template ID or existing project ID to copy from.',
				},
			},
			required: ['name'],
		},
	},
	update_project: {
		name: 'update_project',
		description: 'Update an existing project in the Zoho Projects portal. Use this to modify an existing record or state transition; include only the fields you want to change unless the schema marks them as required. Formats: `start_date`, `end_date` use YYYY-MM-DD. Required: `project_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: {
					type: 'string',
					description: 'Updated project name (maximum 200 characters).',
				},
				description: {
					type: 'string',
					description: 'Updated project description (maximum 80000 characters).',
				},
				...dateRangeProperties,
				project_type: {
					type: 'string',
					description: 'Updated project type. Allowed values: `active`, `template`, `archived`.',
					enum: ['active', 'template', 'archived'],
				},
				owner: {
					type: 'object',
					description: 'Project owner object with zpuid.',
					properties: {
						zpuid: { type: 'string', description: 'Owner ZPUID.' },
					},
				},
				is_public_project: {
					type: 'boolean',
					description: 'Whether the project is public (true or false).',
				},
				completed_time: {
					type: 'string',
					description: 'Project completion timestamp in the date-time format accepted by Zoho.',
				},
				status: {
					type: 'object',
					description: 'Project status object with id.',
					properties: {
						id: { type: 'string', description: 'Status ID.' },
					},
				},
				layout: {
					type: 'object',
					description: 'Project layout details with id.',
					properties: {
						id: { type: 'string', description: 'Layout ID.' },
					},
				},
				added_via: {
					type: 'string',
					description: 'Updated source used to create the project. Allowed values: `web`, `api`.',
					enum: ['web', 'api'],
				},
				is_rollup_project: {
					type: 'boolean',
					description: 'Whether this is a roll-up project (true or false).',
				},
				budget_info: {
					type: 'object',
					description: 'Project budget details (max 80000 characters).',
				},
				project_group: {
					type: 'object',
					description: 'Project group details with id.',
					properties: {
						id: { type: 'string', description: 'Project group ID.' },
					},
				},
				tags: {
					type: 'array',
					description: 'Array of tag objects or IDs to associate with the project.',
					items: { type: 'object' },
				},
			},
			required: ['project_id'],
		},
	},
	trash_project: {
		name: 'trash_project',
		description: 'Move a project to the trash (can be restored within 30 days). Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `project_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
} as const;
