import { paginationProperties, projectIdProperty } from './common.js';

export const tasklistSchemas = {
	list_tasklists: {
		name: 'list_tasklists',
		description: 'List task lists from a project or portal',
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
	get_tasklist: {
		name: 'get_tasklist',
		description: 'Get details of a specific task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_tasklist: {
		name: 'create_tasklist',
		description: 'Create a new task list in a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				name: { type: 'string', description: 'Task list name' },
				milestone_id: {
					type: 'string',
					description: 'Milestone ID (optional)',
				},
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Task list status' },
			},
			required: ['project_id', 'name'],
		},
	},
	update_tasklist: {
		name: 'update_tasklist',
		description: 'Update a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
				name: { type: 'string', description: 'Task list name' },
				milestone_id: { type: 'string', description: 'Milestone ID' },
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
				status: { type: 'string', description: 'Task list status' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	delete_tasklist: {
		name: 'delete_tasklist',
		description: 'Delete a task list',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				tasklist_id: { type: 'string', description: 'Task List ID' },
			},
			required: ['project_id', 'tasklist_id'],
		},
	},
	create_default_tasklist: {
		name: 'create_default_tasklist',
		description: 'Create a default task list for a project',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				flag: {
					type: 'string',
					description: 'Task list flag',
					enum: ['internal', 'external'],
				},
			},
			required: ['project_id', 'flag'],
		},
	},
} as const;
