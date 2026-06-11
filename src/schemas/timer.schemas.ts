import { projectIdProperty } from './common.js';

const timerIdProperty = {
	timer_id: {
		type: 'string',
		description: 'Timer ID. Obtain from `get_running_timers` or a timer detail response.',
	},
} as const;

const timerListTypeProperty = {
	type: {
		type: 'string',
		description: 'Timer type filter. Allowed values: `all`, `generic`, `task`, `issue`.',
		enum: ['all', 'generic', 'task', 'issue'],
	},
} as const;

const timerModuleTypeProperty = {
	type: {
		type: 'string',
		description: 'Module type for the timer. Allowed values: `task`, `issue`, `general`.',
		enum: ['task', 'issue', 'general'],
	},
} as const;

const timerEntityTypeProperty = {
	entity_type: {
		type: 'string',
		description: 'Entity path type for timer log lookup. Allowed values: `task`, `issue`.',
		enum: ['task', 'issue'],
	},
} as const;

const logIdProperty = {
	log_id: {
		type: 'string',
		description: 'Time log ID. Obtain from `list_time_logs`, `get_time_log`, or timer detail lookup.',
	},
} as const;

export const timerSchemas = {
	get_running_timers: {
		name: 'get_running_timers',
		description: 'Retrieve running timers from the Zoho Projects portal. Use this to inspect active timers before pausing, resuming, stopping, or deleting one. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				...timerListTypeProperty,
				for_all: {
					type: 'string',
					description: 'Whether to return timers for all users instead of only the current user. Allowed values: `true`, `false`.',
					enum: ['true', 'false'],
				},
			},
		},
	},
	start_timer: {
		name: 'start_timer',
		description: 'Start a new timer. Use this to begin timing a task or issue when you already have the parent project and entity identifiers. All parameters are optional.',
		inputSchema: {
			type: 'object',
			properties: {
				entity_id: {
					type: 'string',
					description: 'Task or issue ID to start timing against.',
				},
				...projectIdProperty,
				module_id: {
					type: 'string',
					description: 'Module ID for the task or issue being timed.',
				},
				check_existing_timers: {
					type: 'string',
					description: 'Whether Zoho should check for existing running timers before starting a new one. Allowed values: `true`, `false`.',
					enum: ['true', 'false'],
				},
			},
		},
	},
	get_timer_details_by_log_id: {
		name: 'get_timer_details_by_log_id',
		description: 'Retrieve timer details for a task or issue time log. Use this when you already know the parent record or identifier and need the returned details or related records. Required: `project_id`, `entity_type`, `log_id`.',
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
		description: 'Pause a running timer. Use this to pause a running timer while preserving its current work item context. Required: `timer_id`, `type`.',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				notes: {
					type: 'string',
					description: 'Additional timer notes.',
				},
				...timerModuleTypeProperty,
				...logIdProperty,
				entity_id: {
					type: 'string',
					description: 'Task or issue ID currently associated with the timer.',
				},
			},
			required: ['timer_id', 'type'],
		},
	},
	resume_timer: {
		name: 'resume_timer',
		description: 'Resume a paused timer. Use this to resume a paused timer for the same work item or time log context. Required: `timer_id`, `type`.',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				notes: {
					type: 'string',
					description: 'Additional timer notes.',
				},
				...timerModuleTypeProperty,
				...logIdProperty,
				entity_id: {
					type: 'string',
					description: 'Task or issue ID currently associated with the timer.',
				},
			},
			required: ['timer_id', 'type'],
		},
	},
	stop_timer: {
		name: 'stop_timer',
		description: 'Stop a running timer and persist the time log entry. Use this to stop a running timer and optionally provide the fields needed to save the resulting time log entry. Formats: `date` uses YYYY-MM-DD; `hours` may use HH:MM when required by Zoho. Required: `timer_id`, `date`, `type`, `bill_status`.',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
				item_id: {
					type: 'string',
					description: 'Work item ID to associate with the resulting time log.',
				},
				log_name: {
					type: 'string',
					description: 'Name of the resulting time log.',
				},
				date: {
					type: 'string',
					description: 'Time log date in YYYY-MM-DD format.',
				},
				...projectIdProperty,
				...timerModuleTypeProperty,
				hours: {
					type: 'string',
					description: 'Logged duration value. Use the Zoho-supported hour format, such as `2:30` when applicable.',
				},
				start_time: {
					type: 'string',
					description: 'Start time for the resulting time log in the format accepted by Zoho.',
				},
				end_time: {
					type: 'string',
					description: 'End time for the resulting time log in the format accepted by Zoho.',
				},
				bill_status: {
					type: 'string',
					description: 'Billing status of the time log. Allowed values: `Billable`, `Non Billable`.',
					enum: ['Billable', 'Non Billable'],
				},
				notes: {
					type: 'string',
					description: 'Additional notes for the time log.',
				},
			},
			required: ['timer_id', 'date', 'type', 'bill_status'],
		},
	},
	delete_timer: {
		name: 'delete_timer',
		description: 'Delete a timer entry. Use this only when you intend to remove the record, comment, follower, attachment, or association identified by the required parameters. Required: `timer_id`.',
		inputSchema: {
			type: 'object',
			properties: {
				...timerIdProperty,
			},
			required: ['timer_id'],
		},
	},
} as const;
