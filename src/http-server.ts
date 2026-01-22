#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { ZohoClient } from './core/ZohoClient.js';
import { loadZohoConfig } from './core/ZohoConfig.js';
import { allToolSchemas } from './schemas/index.js';
import {
	PortalHandler,
	ProjectHandler,
	TaskHandler,
	IssueHandler,
	PhaseHandler,
	SearchHandler,
	TaskListHandler,
	TeamHandler,
	TagHandler,
	UserHandler,
} from './handlers/index.js';

class ZohoProjectsServer {
	private server: Server;
	private client: ZohoClient;
	private handlers: {
		portals: PortalHandler;
		projects: ProjectHandler;
		tasks: TaskHandler;
		issues: IssueHandler;
		phases: PhaseHandler;
		search: SearchHandler;
		tasklists: TaskListHandler;
		teams: TeamHandler;
		tags: TagHandler;
		users: UserHandler;
	};

	constructor() {
		this.server = new Server(
			{
				name: 'zoho-projects-mcp-server',
				version: '1.0.0',
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		const config = loadZohoConfig();
		this.client = new ZohoClient(config);

		// Initialize all handlers
		this.handlers = {
			portals: new PortalHandler(this.client),
			projects: new ProjectHandler(this.client),
			tasks: new TaskHandler(this.client),
			issues: new IssueHandler(this.client),
			phases: new PhaseHandler(this.client),
			search: new SearchHandler(this.client),
			tasklists: new TaskListHandler(this.client),
			teams: new TeamHandler(this.client),
			tags: new TagHandler(this.client),
			users: new UserHandler(this.client),
		};

		this.setupHandlers();
	}

	private setupHandlers() {
		// List available tools - now centralized!
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: allToolSchemas,
		}));

		// Handle tool execution
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const { name, arguments: args } = request.params;
			const params = (args || {}) as any;

			try {
				switch (name) {
					// Portal operations
					case 'list_portals':
						return await this.handlers.portals.listPortals();
					case 'get_portal':
						return await this.handlers.portals.getPortal(params.portal_id);

					// Project operations
					case 'list_projects':
						return await this.handlers.projects.listProjects(params.page, params.per_page);
					case 'get_project':
						return await this.handlers.projects.getProject(params.project_id);
					case 'create_project':
						return await this.handlers.projects.createProject(params);
					case 'update_project':
						return await this.handlers.projects.updateProject(params);
					case 'trash_project':
						return await this.handlers.projects.trashProject(params.project_id);

					// Task operations
					case 'list_tasks':
						return await this.handlers.tasks.listTasks(
							params.project_id,
							params.page,
							params.per_page,
						);
					case 'get_task':
						return await this.handlers.tasks.getTask(params.project_id, params.task_id);
					case 'create_task':
						return await this.handlers.tasks.createTask(params);
					case 'update_task':
						return await this.handlers.tasks.updateTask(params);
					case 'delete_task':
						return await this.handlers.tasks.deleteTask(params.project_id, params.task_id);
					case 'move_task':
						return await this.handlers.tasks.moveTask(params);
					case 'get_associated_bugs':
						return await this.handlers.tasks.getAssociatedBugs(params.project_id, params.task_id);
					case 'associate_bugs':
						return await this.handlers.tasks.associateBugs(params);
					case 'disassociate_bug':
						return await this.handlers.tasks.disassociateBug(
							params.project_id,
							params.task_id,
							params.bug_id,
						);

					// Task Comments operations
					case 'list_task_comments':
						return await this.handlers.tasks.listTaskComments(
							params.project_id,
							params.task_id,
							params.page,
							params.per_page,
							params.sort_by,
						);
					case 'add_task_comment':
						return await this.handlers.tasks.addTaskComment(params);
					case 'update_task_comment':
						return await this.handlers.tasks.updateTaskComment(params);
					case 'delete_task_comment':
						return await this.handlers.tasks.deleteTaskComment(
							params.project_id,
							params.task_id,
							params.comment_id,
						);

					// Issue operations
					case 'list_issues':
						return await this.handlers.issues.listIssues(
							params.project_id,
							params.page,
							params.per_page,
						);
					case 'get_issue':
						return await this.handlers.issues.getIssue(params.project_id, params.issue_id);
					case 'create_issue':
						return await this.handlers.issues.createIssue(params);
					case 'update_issue':
						return await this.handlers.issues.updateIssue(params);
					case 'delete_issue':
						return await this.handlers.issues.deleteIssue(params.project_id, params.issue_id);
					case 'move_issue':
						return await this.handlers.issues.moveIssue(params);
					case 'clone_issue':
						return await this.handlers.issues.cloneIssue(params.project_id, params.issue_id);
					case 'get_issue_activities':
						return await this.handlers.issues.getIssueActivities(params);
					case 'get_issue_comments':
						return await this.handlers.issues.getIssueComments(params);
					case 'add_issue_comment':
						return await this.handlers.issues.addIssueComment(params);
					case 'update_issue_comment':
						return await this.handlers.issues.updateIssueComment(params);
					case 'delete_issue_comment':
						return await this.handlers.issues.deleteIssueComment(
							params.project_id,
							params.issue_id,
							params.comment_id,
						);

					// Phase operations
					case 'get_phases':
						return await this.handlers.phases.getPhases(params);
					case 'list_phases':
						return await this.handlers.phases.listPhases(params);
					case 'get_phase_detail':
						return await this.handlers.phases.getPhaseDetail(params);
					case 'create_phase':
						return await this.handlers.phases.createPhase(params);
					case 'update_phase':
						return await this.handlers.phases.updatePhase(params);
					case 'delete_phase':
						return await this.handlers.phases.deletePhase(params);
					case 'move_phase':
						return await this.handlers.phases.movePhase(params);
					case 'clone_phase':
						return await this.handlers.phases.clonePhase(params);
					case 'get_phase_activities':
						return await this.handlers.phases.getPhaseActivities(params);
					case 'get_phase_status_transition':
						return await this.handlers.phases.getPhaseStatusTransition(params);
					case 'get_phase_followers':
						return await this.handlers.phases.getPhaseFollowers(params);
					case 'add_phase_followers':
						return await this.handlers.phases.addPhaseFollowers(params);
					case 'remove_phase_followers':
						return await this.handlers.phases.removePhaseFollowers(params);
					case 'get_phase_comments':
						return await this.handlers.phases.getPhaseComments(params);
					case 'add_phase_comment':
						return await this.handlers.phases.addPhaseComment(params);
					case 'update_phase_comment':
						return await this.handlers.phases.updatePhaseComment(params);
					case 'delete_phase_comment':
						return await this.handlers.phases.deletePhaseComment(params);

					// Search
					case 'search':
						return await this.handlers.search.search(params);

					// Task List operations
					case 'list_tasklists':
						return await this.handlers.tasklists.listTaskLists(
							params.project_id,
							params.page,
							params.per_page,
						);
					case 'get_tasklist':
						return await this.handlers.tasklists.getTaskList(params.project_id, params.tasklist_id);
					case 'create_tasklist':
						return await this.handlers.tasklists.createTaskList(params);
					case 'update_tasklist':
						return await this.handlers.tasklists.updateTaskList(params);
					case 'delete_tasklist':
						return await this.handlers.tasklists.deleteTaskList(
							params.project_id,
							params.tasklist_id,
						);
					case 'create_default_tasklist':
						return await this.handlers.tasklists.createDefaultTaskList(
							params.project_id,
							params.flag,
						);

					// Users
					case 'list_users':
						return await this.handlers.users.listUsers(params.project_id);

					// Teams
					case 'get_team_details':
						return await this.handlers.teams.getTeamDetails(params);
					case 'get_projects_team':
						return await this.handlers.teams.getProjectsTeam(params);
					case 'get_team_users':
						return await this.handlers.teams.getTeamUsers(params);
					case 'get_teams_projects':
						return await this.handlers.teams.getTeamsProjects(params);

					// Tags
					case 'list_tags':
						return await this.handlers.tags.listTags(params.name);
					case 'delete_tag':
						return await this.handlers.tags.deleteTag(params.tag_id);

					default:
						throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
				}
			} catch (error) {
				if (error instanceof McpError) throw error;
				throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error}`);
			}
		});
	}

	getServer(): Server {
		return this.server;
	}
}

// HTTP Server setup with session management
const app = express();

// Use json middleware only for non-MCP routes
app.use((req, res, next) => {
	if (req.path === '/mcp') {
		next();
	} else {
		express.json()(req, res, next);
	}
});

// Server configuration
const PORT = Number(process.env.HTTP_PORT) || 3001;

// Default allowed hosts with port
const defaultAllowedHosts = ['127.0.0.1', 'localhost', `localhost:${PORT}`, `127.0.0.1:${PORT}`];

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(',')
	: ['http://localhost:3000'];

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	}),
);

// Store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
const servers: { [sessionId: string]: ZohoProjectsServer } = {};

// MCP endpoint
app.post('/mcp', async (req, res) => {
	try {
		// Get or create session
		const sessionId = (req.headers['x-session-id'] as string) || 'default';

		// Create transport and server if they don't exist
		if (!transports[sessionId]) {
			transports[sessionId] = new StreamableHTTPServerTransport();
			servers[sessionId] = new ZohoProjectsServer();
			await servers[sessionId].getServer().connect(transports[sessionId]);
		}

		const transport = transports[sessionId];

		// Handle the request
		await transport.handleRequest(req, res);
	} catch (error) {
		console.error('Error handling MCP request:', error);
		if (!res.headersSent) {
			res.status(500).json({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		activeSessions: Object.keys(transports).length,
		timestamp: new Date().toISOString(),
	});
});

// Server info endpoint
app.get('/', (req, res) => {
	res.json({
		name: 'Zoho Projects MCP Server',
		version: '1.0.0',
		transport: 'StreamableHTTP',
		endpoints: {
			mcp: '/mcp',
			health: '/health',
		},
		activeSessions: Object.keys(transports).length,
	});
});

app.listen(PORT, '0.0.0.0', () => {
	console.error(`Zoho Projects MCP HTTP server running on 0.0.0.0:${PORT}`);
	console.error(`MCP endpoint: http://localhost:${PORT}/mcp`);
	console.error(`Health check: http://localhost:${PORT}/health`);
});
