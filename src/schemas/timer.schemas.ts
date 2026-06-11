import { projectIdProperty } from './common.js';

const timerIdProperty = {
	timer_id: {
		type: 'string',
		description: 'Timer ID',
	},
} as const;

const timerListTypeProperty = {
	type: {
		type: 'string',
		description: 'Timer type filter',
		enum: ['all', 'generic', 'task', 'issue'],
	},
} as const;

const timerModuleTypeProperty = {
	type: {
		type: 'string',
		description: 'Module type for the timer',
		enum: ['task', 'issue', 'general'],
	},
} as const;

const timerEntityTypeProperty = {
	entity_type: {
		type: 'string',
		description: 'Entity path type for timer log lookup',
		enum: ['task', 'issue'],
	},
} as const;

const logIdProperty = {
	log_id: {
		type: 'string',
		description: 'Time log ID associated with the timer',
	},
} as const;

export const timerSchemas = {
	get_running_timers: {
		name: 'get_running_timers',
		description: 'Retrieve running timers from the Zoho Projects portal',
		inputSchema: {
			type: 'object',
			properties: {
				...timerListTypeProperty,
				for_all: {
					type: 'string',
					description: 'Whether to retrieve timers for all users',
					enum: ['true', 'false'],
				},
			},
		},
	},
	start_timer: {
		name: 'start_timer',
		description: 'Start a new timer',
		inputSchema: {
			type: 'object',
			properties: {
				entity_id: {
					type: 'string',
					description: 'Entity ID for the task or issue to time',
				},
				...projectIdProperty,
				module_id: {
					type: 'string',
					description: 'Module ID for the task or issue module',
				},
				check_existing_timers: {
					type: 'string',
					description: 'Whether to check for existing running timers first',
					enum: ['true', 'false'],
				},
			},
		},
	},
	get_timer_details_by_log_id: {
		name: 'get_timer_details_by_log_id',
		description: 'Retrieve timer details for a task or issue time log',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...timerEntityTypeProperty,
				...logIdProperty,
			},
			required: ['project_id', 'entity_type', 'log_id'],
		},
	},
	pause_timer: {
		name: 'pause_timer',
		description: 'Pause a running timer',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				notes: {
					type: 'string',
					description: 'Additional timer notes',
				},
				...timerModuleTypeProperty,
				...logIdProperty,
				entity_id: {
					type: 'string',
					description: 'Entity ID associated with the timer',
				},
			},
			required: ['timer_id', 'type'],
		},
	},
	resume_timer: {
		name: 'resume_timer',
		description: 'Resume a paused timer',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				notes: {
					type: 'string',
					description: 'Additional timer notes',
				},
				...timerModuleTypeProperty,
				...logIdProperty,
				entity_id: {
					type: 'string',
					description: 'Entity ID associated with the timer',
				},
			},
			required: ['timer_id', 'type'],
		},
	},
	stop_timer: {
		name: 'stop_timer',
		description: 'Stop a running timer and persist the time log entry',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				item_id: {
					type: 'string',
					description: 'Work item ID associated with the time log',
				},
				log_name: {
					type: 'string',
					description: 'Name of the resulting time log',
				},
				date: {
					type: 'string',
					description: 'Time log date in YYYY-MM-DD format',
				},
				...projectIdProperty,
				...timerModuleTypeProperty,
				hours: {
					type: 'string',
					description: 'Logged hours value',
				},
				start_time: {
					type: 'string',
					description: 'Start time for the log',
				},
				end_time: {
					type: 'string',
					description: 'End time for the log',
				},
				bill_status: {
					type: 'string',
					description: 'Billing status of the time log',
					enum: ['Billable', 'Non Billable'],
				},
				notes: {
					type: 'string',
					description: 'Additional notes for the time log',
				},
			},
			required: ['timer_id', 'date', 'type', 'bill_status'],
		},
	},
	delete_timer: {
		name: 'delete_timer',
		description: 'Delete a timer entry',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
			},
			required: ['timer_id'],
		},
	},
} as const;
