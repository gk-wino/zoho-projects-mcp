import { paginationProperties, projectIdProperty, dateRangeProperties } from './common.js';

const moduleTypeProperty = {
	module_type: {
		type: 'string',
		description: 'Time log module type',
		enum: ['task', 'issue', 'general'],
	},
} as const;

const moduleIdProperty = {
	module_id: {
		type: 'string',
		description: 'Task or issue ID associated with the time log; required unless module_type is general',
	},
} as const;

const logIdProperty = {
	log_id: {
		type: 'string',
		description: 'Time log ID',
	},
} as const;

const timeLogCoreProperties = {
	log_name: {
		type: 'string',
		description: 'Name of the time log',
	},
	date: {
		type: 'string',
		description: 'Time log date in YYYY-MM-DD format',
	},
	bill_status: {
		type: 'string',
		description: 'Billing status of the time log',
		enum: ['Billable', 'Non Billable'],
	},
	hours: {
		type: 'string',
		description: 'Logged hours value',
	},
	notes: {
		type: 'string',
		description: 'Additional notes for the time log',
	},
	owner_zpuid: {
		type: 'string',
		description: 'Owner ZPUID for the time log',
	},
	approver: {
		type: 'string',
		description: 'Approver ZPUID for the time log',
	},
	start_time: {
		type: 'string',
		description: 'Start time for the time log',
	},
	end_time: {
		type: 'string',
		description: 'End time for the time log',
	},
	status: {
		type: 'string',
		description: 'Approval status of the time log',
		enum: ['Approved', 'Unapproved', 'Rejected'],
	},
	cost_rate_per_hour: {
		type: 'number',
		description: 'Cost rate per hour',
	},
	for_timer: {
		type: 'boolean',
		description: 'Whether this time log originated from a timer',
	},
	cf_number: {
		type: 'number',
		description: 'Numeric custom field value',
	},
	cf_user_picklist: {
		type: 'string',
		description: 'User picklist custom field value',
	},
	cf_single_line: {
		type: 'string',
		description: 'Single-line custom field value',
	},
	cf_multi_line: {
		type: 'string',
		description: 'Multi-line custom field value',
	},
	cf_email: {
		type: 'string',
		description: 'Email custom field value',
	},
	cf_date: {
		type: 'string',
		description: 'Date custom field value',
	},
	cf_decimal: {
		type: 'string',
		description: 'Decimal custom field value',
	},
	cf_check_box: {
		type: 'string',
		description: 'Checkbox custom field value',
	},
	sprints_logid: {
		type: 'string',
		description: 'Zoho Sprints log ID',
	},
} as const;

export const timeLogSchemas = {
	list_time_logs: {
		name: 'list_time_logs',
		description: 'List time logs for a project timesheet view',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...paginationProperties,
				view_type: {
					type: 'string',
					description: 'Timesheet view type',
					enum: ['day', 'week', 'month', 'customdate'],
				},
				...dateRangeProperties,
				...moduleTypeProperty,
				...moduleIdProperty,
				fetch_by_modified_time: {
					type: 'boolean',
					description: 'Filter by modified date instead of start date',
				},
			},
			required: ['project_id', 'view_type'],
		},
	},
	get_time_log: {
		name: 'get_time_log',
		description: 'Get details of a specific time log',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...logIdProperty,
				...moduleTypeProperty,
			},
			required: ['project_id', 'log_id', 'module_type'],
		},
	},
	create_time_log: {
		name: 'create_time_log',
		description: 'Create a new time log entry in a project timesheet',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...moduleTypeProperty,
				...moduleIdProperty,
				...timeLogCoreProperties,
			},
			required: ['project_id', 'module_type', 'date', 'bill_status'],
		},
	},
	update_time_log: {
		name: 'update_time_log',
		description: 'Update an existing time log entry',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...logIdProperty,
				...moduleTypeProperty,
				...moduleIdProperty,
				...timeLogCoreProperties,
				approval_status: {
					type: 'string',
					description: 'Approval status for the time log',
					enum: ['Approved', 'Unapproved', 'Rejected'],
				},
				extra_data: {
					type: 'object',
					description: 'Additional time entry details',
					properties: {
						start_time: { type: 'string', description: 'Extra entry start time' },
						end_time: { type: 'string', description: 'Extra entry end time' },
						notes: { type: 'string', description: 'Extra entry notes' },
					},
				},
				is_draft: {
					type: 'string',
					description: 'Whether to save the time log as a draft',
					enum: ['true', 'false'],
				},
			},
			required: ['project_id', 'log_id', 'module_type'],
		},
	},
	delete_time_log: {
		name: 'delete_time_log',
		description: 'Delete a time log entry',
		inputSchema: {
			type: 'object',
			properties: {
				...projectIdProperty,
				...logIdProperty,
				...moduleTypeProperty,
			},
			required: ['project_id', 'log_id', 'module_type'],
		},
	},
} as const;
