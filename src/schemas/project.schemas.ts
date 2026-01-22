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
		description: 'Create a new project',
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Project name' },
				description: { type: 'string', description: 'Project description' },
				...dateRangeProperties,
				is_public: {
					type: 'boolean',
					description: 'Is project public',
					default: false,
				},
			},
			required: ['name'],
		},
	},
	update_project: {
		name: 'update_project',
		description: 'Update an existing project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Project name' },
				description: { type: 'string', description: 'Project description' },
				...dateRangeProperties,
				status: {
					type: 'string',
					description: 'Project status',
					enum: ['active', 'template', 'archived'],
				},
			},
			required: ['project_id'],
		},
	},
	delete_project: {
		name: 'delete_project',
		description: 'Delete a project (moves to trash)',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
			},
			required: ['project_id'],
		},
	},
} as const;
