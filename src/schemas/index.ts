import { portalSchemas } from './portal.schemas.js';
import { projectSchemas } from './project.schemas.js';
import { taskSchemas } from './task.schemas.js';
import { issueSchemas } from './issue.schemas.js';
import { phaseSchemas } from './phase.schemas.js';
import { searchSchemas } from './search.schemas.js';
import { tasklistSchemas } from './tasklist.schemas.js';
import { teamSchemas } from './team.schemas.js';
import { tagSchemas } from './tag.schemas.js';
import { userSchemas } from './user.schemas.js';
import { timeLogSchemas } from './timelog.schemas.js';
import { timerSchemas } from './timer.schemas.js';

export const allToolSchemas = [
	...Object.values(portalSchemas),
	...Object.values(projectSchemas),
	...Object.values(taskSchemas),
	...Object.values(issueSchemas),
	...Object.values(phaseSchemas),
	...Object.values(searchSchemas),
	...Object.values(tasklistSchemas),
	...Object.values(teamSchemas),
	...Object.values(tagSchemas),
	...Object.values(userSchemas),
	...Object.values(timeLogSchemas),
	...Object.values(timerSchemas),
];

export * from './portal.schemas.js';
export * from './project.schemas.js';
export * from './task.schemas.js';
export * from './issue.schemas.js';
export * from './phase.schemas.js';
export * from './search.schemas.js';
export * from './tasklist.schemas.js';
export * from './team.schemas.js';
export * from './tag.schemas.js';
export * from './user.schemas.js';
export * from './timelog.schemas.js';
export * from './timer.schemas.js';
