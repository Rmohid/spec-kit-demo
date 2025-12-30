# Spec Kit Operations Workbook

> Practical exercises for learning Specification-Driven Development

This workbook contains hands-on exercises demonstrating common development operations using SDD methodology. Each exercise includes complete, copy-paste ready commands.

---

## Table of Contents

1. [Exercise 1: Add a Simple Feature](#exercise-1-add-a-simple-feature)
2. [Exercise 2: Fix a Bug](#exercise-2-fix-a-bug)
3. [Exercise 3: Refactor Existing Code](#exercise-3-refactor-existing-code)
4. [Exercise 4: Add a New Agent](#exercise-4-add-a-new-agent)
5. [Exercise 5: Extend an Existing Agent](#exercise-5-extend-an-existing-agent)
6. [Exercise 6: Add Input Validation](#exercise-6-add-input-validation)
7. [Exercise 7: Improve Error Handling](#exercise-7-improve-error-handling)
8. [Exercise 8: Add a CLI Flag](#exercise-8-add-a-cli-flag)
9. [Exercise 9: Add Database Migration](#exercise-9-add-database-migration)
10. [Exercise 10: Performance Optimization](#exercise-10-performance-optimization)

---

## Prerequisites

Before starting, ensure you're in the project directory:

```bash
cd /path/to/spec-kit-demo
npm install
npm run build
```

---

## Exercise 1: Add a Simple Feature

### Scenario
**Request**: "Add a `task count` command that shows how many tasks exist by status."

### Step 1: Write the Specification

```bash
# Create feature directory
mkdir -p specs/003-task-count

# Create specification
cat > specs/003-task-count/spec.md << 'SPEC'
# Feature Specification: Task Count

**Feature Branch**: `003-task-count`
**Created**: 2025-12-30
**Status**: Draft

## Overview

Add a command to display task counts grouped by status.

## User Story 1 - View Task Counts (Priority: P1)

As a user, I want to see how many tasks I have in each status
so that I can understand my workload at a glance.

**Acceptance Scenarios**:

1. **Given** tasks exist in various statuses,
   **When** I run `taskflow task count`,
   **Then** I see counts for each status (pending, in_progress, done, cancelled)

2. **Given** I use the `--json` flag,
   **When** I run `taskflow task count --json`,
   **Then** output is valid JSON object with status counts

## Requirements

- **FR-001**: System MUST display count for each task status
- **FR-002**: System MUST support JSON output format
- **FR-003**: Zero counts MUST be displayed (not omitted)

## Success Criteria

- **SC-001**: Command completes in <100ms
- **SC-002**: All existing tests still pass
SPEC

echo "✅ Specification created"
cat specs/003-task-count/spec.md
```

### Step 2: Write the Plan

```bash
cat > specs/003-task-count/plan.md << 'PLAN'
# Implementation Plan: Task Count

**Spec**: [spec.md](./spec.md)
**Status**: Draft

## Summary

Add `count` action to Task Agent and corresponding CLI command.

## Technical Approach

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Storage | Use existing listTasks + reduce | Simple, no new queries needed |
| New Files | 0 | Extend existing files only |

## Files to Modify

1. `src/agents/task-agent/index.ts` - Add 'count' action
2. `src/cli/commands/task.ts` - Add 'task count' subcommand

## Constitution Compliance

- [x] Article II: CLI with JSON support
- [x] Article III: Tests first
- [x] Article V: Simple solution
PLAN

echo "✅ Plan created"
```

### Step 3: Write the Tasks

```bash
cat > specs/003-task-count/tasks.md << 'TASKS'
# Tasks: Task Count

## Phase 1: Tests First

- [ ] T001 Add test: count returns all status counts
- [ ] T002 Add test: count includes zero counts
- [ ] T003 Add test: count works with no tasks

## Phase 2: Implementation

- [ ] T004 Add 'count' to Task Agent capabilities
- [ ] T005 Implement countTasks method in Task Agent
- [ ] T006 Add 'task count' CLI command
TASKS

echo "✅ Tasks created"
```

### Step 4: Write Failing Tests

```bash
# Add to existing test file
cat >> tests/contract/task-agent.test.ts << 'TESTS'

  describe('count action', () => {
    it('should return counts for all statuses', async () => {
      // Create tasks in different statuses
      await agent.execute({ action: 'create', params: { title: 'Task 1' } });
      await agent.execute({ action: 'create', params: { title: 'Task 2' } });
      const created = await agent.execute<Task>({ action: 'create', params: { title: 'Task 3' } });
      await agent.execute({ action: 'update', params: { id: created.data?.id, status: 'done' } });

      const response = await agent.execute<Record<string, number>>({
        action: 'count',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('pending');
      expect(response.data).toHaveProperty('in_progress');
      expect(response.data).toHaveProperty('done');
      expect(response.data).toHaveProperty('cancelled');
      expect(response.data?.pending).toBe(2);
      expect(response.data?.done).toBe(1);
    });

    it('should include zero counts', async () => {
      await agent.execute({ action: 'create', params: { title: 'Task 1' } });

      const response = await agent.execute<Record<string, number>>({
        action: 'count',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data?.cancelled).toBe(0);
    });

    it('should work with no tasks', async () => {
      const response = await agent.execute<Record<string, number>>({
        action: 'count',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data?.pending).toBe(0);
      expect(response.data?.done).toBe(0);
    });
  });
TESTS

echo "✅ Tests added"
echo ""
echo "🔴 Running tests (should FAIL)..."
npm test -- tests/contract/task-agent.test.ts --testNamePattern="count action" 2>&1 | tail -15
```

### Step 5: Implement the Feature

```bash
# Show the implementation needed
cat << 'IMPL'
=== Add to src/agents/task-agent/index.ts ===

1. Update capabilities array:
   capabilities: ['create', 'get', 'update', 'delete', 'list', 'getOverdue', 'count'],

2. Add case in handleAction:
   case 'count':
     return this.countTasks();

3. Add method:
   private countTasks(): Record<string, number> {
     const storage = getStorage();
     const tasks = storage.listTasks({ limit: 10000 });
     
     const counts: Record<string, number> = {
       pending: 0,
       in_progress: 0,
       done: 0,
       cancelled: 0,
     };
     
     for (const task of tasks) {
       counts[task.status] = (counts[task.status] ?? 0) + 1;
     }
     
     this.logger.debug('Task counts', { counts });
     return counts;
   }

=== Add to src/cli/commands/task.ts ===

Add after other task commands:

  task
    .command('count')
    .description('Show task counts by status')
    .action(async () => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const response = await agent.execute<Record<string, number>>({
        action: 'count',
        params: {},
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.bold('Task Counts by Status'));
        console.log(chalk.gray('─'.repeat(30)));
        for (const [status, count] of Object.entries(response.data ?? {})) {
          console.log(`${status.padEnd(15)} ${count}`);
        }
      }
    });
IMPL
```

### Step 6: Verify

```bash
# After implementing, rebuild and test
npm run build
npm test -- tests/contract/task-agent.test.ts --testNamePattern="count action"

# Manual test
npm start -- task count
npm start -- task count --json
```

---

## Exercise 2: Fix a Bug

### Scenario
**Bug Report**: "When I delete a task, the notifications for that task aren't cleaned up."

### Step 1: Document the Bug in a Spec

```bash
mkdir -p specs/004-fix-notification-cleanup

cat > specs/004-fix-notification-cleanup/spec.md << 'SPEC'
# Bug Fix Specification: Notification Cleanup on Task Delete

**Issue**: Notifications remain in database after task is deleted
**Severity**: Low (data cleanup issue)
**Status**: Draft

## Current Behavior

When a task is deleted, associated notifications remain orphaned in the database.

## Expected Behavior

When a task is deleted, all notifications referencing that task should also be deleted.

## Acceptance Scenarios

1. **Given** a task with notifications exists,
   **When** I delete the task,
   **Then** all notifications for that task are also deleted

2. **Given** multiple tasks with notifications exist,
   **When** I delete one task,
   **Then** only notifications for the deleted task are removed

## Root Cause

SQLite foreign key ON DELETE CASCADE is defined but may not be enforced,
or notifications are created without proper foreign key reference.

## Fix Approach

Ensure foreign keys are enforced and manually delete notifications if needed.
SPEC

echo "✅ Bug spec created"
```

### Step 2: Write a Failing Test

```bash
cat >> tests/integration/notification-cleanup.test.ts << 'TEST'
import { TaskAgent } from '../../src/agents/task-agent/index.js';
import { NotificationAgent } from '../../src/agents/notification-agent/index.js';
import { Storage, resetStorage } from '../../src/lib/storage.js';
import type { Task, Notification } from '../../src/lib/types.js';

describe('Notification Cleanup on Task Delete', () => {
  let taskAgent: TaskAgent;
  let notificationAgent: NotificationAgent;
  let storage: Storage;

  beforeEach(() => {
    process.env['DATABASE_PATH'] = ':memory:';
    resetStorage();
    storage = new Storage(':memory:');
    taskAgent = new TaskAgent();
    notificationAgent = new NotificationAgent();
  });

  afterEach(() => {
    storage.close();
    resetStorage();
  });

  it('should delete notifications when task is deleted', async () => {
    // Create a task
    const createResponse = await taskAgent.execute<Task>({
      action: 'create',
      params: { title: 'Test task' },
    });
    const taskId = createResponse.data?.id ?? '';

    // Create notification for the task
    await notificationAgent.notifyTaskCreated(taskId, 'Test task');

    // Verify notification exists
    const beforeDelete = await notificationAgent.execute<Notification[]>({
      action: 'list',
      params: {},
    });
    expect(beforeDelete.data?.some(n => n.taskId === taskId)).toBe(true);

    // Delete the task
    await taskAgent.execute({ action: 'delete', params: { id: taskId } });

    // Verify notification is gone
    const afterDelete = await notificationAgent.execute<Notification[]>({
      action: 'list',
      params: {},
    });
    expect(afterDelete.data?.some(n => n.taskId === taskId)).toBe(false);
  });
});
TEST

echo "✅ Test created"
echo ""
echo "🔴 Running test (should FAIL if bug exists)..."
npm test -- tests/integration/notification-cleanup.test.ts 2>&1 | tail -20
```

### Step 3: Implement the Fix

```bash
cat << 'FIX'
=== Option A: Ensure CASCADE works (in src/lib/storage.ts) ===

In the constructor, ensure foreign keys are enabled:
  this.db.pragma('foreign_keys = ON');

=== Option B: Manual cleanup (in src/agents/task-agent/index.ts) ===

In deleteTask method, before deleting task:

  private deleteTask(params: Record<string, unknown>): { deleted: boolean; id: string } {
    this.validateParams(params, ['id']);
    const id = params['id'] as string;

    const storage = getStorage();
    
    // Clean up notifications first
    const notifications = storage.listNotifications({});
    for (const notification of notifications) {
      if (notification.taskId === id) {
        // Add deleteNotification method to storage
        storage.deleteNotification(notification.id);
      }
    }
    
    const deleted = storage.deleteTask(id);
    // ... rest of method
  }
FIX
```

### Step 4: Verify Fix

```bash
npm run build
npm test -- tests/integration/notification-cleanup.test.ts
echo "🟢 Bug fixed if test passes!"
```

---

## Exercise 3: Refactor Existing Code

### Scenario
**Tech Debt**: "The Task Agent's handleAction switch statement is getting long. Refactor to use a command pattern."

### Step 1: Create Refactor Spec

```bash
mkdir -p specs/005-refactor-task-agent

cat > specs/005-refactor-task-agent/spec.md << 'SPEC'
# Refactor Specification: Task Agent Command Pattern

**Type**: Refactoring (no behavior change)
**Status**: Draft

## Current State

Task Agent uses a switch statement in handleAction with 6+ cases.

## Desired State

Use a command map pattern for cleaner, more extensible code.

## Constraints

- **NO behavior changes** - all existing tests must pass unchanged
- Maintain same public interface
- Improve code readability

## Approach

Replace:
```typescript
switch (action) {
  case 'create': return this.createTask(params);
  case 'get': return this.getTask(params);
  // ...
}
```

With:
```typescript
private actions = new Map<string, (params) => Promise<unknown>>([
  ['create', this.createTask.bind(this)],
  ['get', this.getTask.bind(this)],
  // ...
]);

protected async handleAction(action, params) {
  const handler = this.actions.get(action);
  if (!handler) throw new Error(`Unknown action: ${action}`);
  return handler(params);
}
```

## Success Criteria

- All existing tests pass without modification
- Code is more readable
- Adding new actions is simpler
SPEC

echo "✅ Refactor spec created"
```

### Step 2: Run Existing Tests (Baseline)

```bash
echo "📊 Running baseline tests before refactor..."
npm test -- tests/contract/task-agent.test.ts 2>&1 | tail -10

echo ""
echo "Save this output - all tests must still pass after refactor!"
```

### Step 3: Implement Refactor

```bash
cat << 'REFACTOR'
=== Replace in src/agents/task-agent/index.ts ===

// Add at class level (after constructor)
private readonly actionHandlers = new Map<
  string,
  (params: Record<string, unknown>) => unknown | Promise<unknown>
>([
  ['create', (params) => this.createTask(params)],
  ['get', (params) => this.getTask(params)],
  ['update', (params) => this.updateTask(params)],
  ['delete', (params) => this.deleteTask(params)],
  ['list', (params) => this.listTasks(params)],
  ['getOverdue', () => this.getOverdueTasks()],
]);

// Replace handleAction method
protected async handleAction(
  action: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const handler = this.actionHandlers.get(action);
  
  if (!handler) {
    throw new Error(`Unknown action: ${action}`);
  }
  
  return handler(params);
}

// Update capabilities to derive from map
constructor() {
  super({
    name: 'task-agent',
    displayName: 'Task Agent',
    description: 'Manages task creation, retrieval, updates, and deletion',
    capabilities: ['create', 'get', 'update', 'delete', 'list', 'getOverdue'],
  });
}
REFACTOR
```

### Step 4: Verify No Regression

```bash
npm run build
npm test -- tests/contract/task-agent.test.ts

echo ""
echo "🟢 If same tests pass, refactor is safe!"
```

---

## Exercise 4: Add a New Agent

### Scenario
**Request**: "Add a Statistics Agent that provides analytics about tasks."

### Step 1: Full Specification

```bash
mkdir -p specs/006-statistics-agent

cat > specs/006-statistics-agent/spec.md << 'SPEC'
# Feature Specification: Statistics Agent

**Feature Branch**: `006-statistics-agent`
**Status**: Draft

## Overview

Add a new agent that provides statistical analysis of tasks.

## User Story 1 - View Task Statistics (Priority: P1)

As a user, I want to see statistics about my tasks
so that I can understand productivity patterns.

**Acceptance Scenarios**:

1. **Given** tasks exist,
   **When** I run `taskflow stats overview`,
   **Then** I see total tasks, completion rate, average age

2. **Given** I use `--json` flag,
   **When** I run `taskflow stats overview --json`,
   **Then** output is valid JSON

## Requirements

- **FR-001**: Agent MUST calculate total task count
- **FR-002**: Agent MUST calculate completion rate (done / total)
- **FR-003**: Agent MUST calculate average task age in days
- **FR-004**: Agent MUST integrate with agent registry
SPEC

cat > specs/006-statistics-agent/plan.md << 'PLAN'
# Implementation Plan: Statistics Agent

## Files to Create

1. `src/agents/statistics-agent/index.ts` - New agent

## Files to Modify

1. `src/agents/registry.ts` - Register new agent
2. `src/cli/commands/stats.ts` - New CLI commands
3. `src/cli/index.ts` - Register stats commands
PLAN

echo "✅ Spec and plan created"
```

### Step 2: Create the Agent

```bash
# Create directory
mkdir -p src/agents/statistics-agent

# Create agent file
cat > src/agents/statistics-agent/index.ts << 'AGENT'
/**
 * TaskFlow CLI - Statistics Agent
 * 
 * Provides statistical analysis of tasks.
 */

import { BaseAgent } from '../base-agent.js';
import { getStorage } from '../../lib/storage.js';
import { getAgentRegistry } from '../registry.js';
import type { Task } from '../../lib/types.js';

interface TaskStatistics {
  totalTasks: number;
  byStatus: Record<string, number>;
  completionRate: number;
  averageAgeInDays: number;
  oldestTaskDays: number;
  newestTaskDays: number;
}

export class StatisticsAgent extends BaseAgent {
  constructor() {
    super({
      name: 'statistics-agent',
      displayName: 'Statistics Agent',
      description: 'Provides statistical analysis of tasks',
      capabilities: ['overview', 'completion-rate'],
    });
  }

  protected async handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case 'overview':
        return this.getOverview();
      case 'completion-rate':
        return this.getCompletionRate();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private getOverview(): TaskStatistics {
    const storage = getStorage();
    const tasks = storage.listTasks({ limit: 10000 });
    
    const byStatus: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    };
    
    let totalAgeDays = 0;
    let oldestDays = 0;
    let newestDays = Infinity;
    const now = Date.now();
    
    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
      
      const ageMs = now - new Date(task.createdAt).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      totalAgeDays += ageDays;
      
      if (ageDays > oldestDays) oldestDays = ageDays;
      if (ageDays < newestDays) newestDays = ageDays;
    }
    
    const totalTasks = tasks.length;
    const completedTasks = byStatus['done'] ?? 0;
    
    return {
      totalTasks,
      byStatus,
      completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
      averageAgeInDays: totalTasks > 0 ? totalAgeDays / totalTasks : 0,
      oldestTaskDays: totalTasks > 0 ? oldestDays : 0,
      newestTaskDays: totalTasks > 0 ? newestDays : 0,
    };
  }

  private getCompletionRate(): { rate: number; completed: number; total: number } {
    const overview = this.getOverview();
    return {
      rate: overview.completionRate,
      completed: overview.byStatus['done'] ?? 0,
      total: overview.totalTasks,
    };
  }
}

// Singleton
let instance: StatisticsAgent | null = null;

export function getStatisticsAgent(): StatisticsAgent {
  if (!instance) {
    instance = new StatisticsAgent();
    getAgentRegistry().register(instance);
  }
  return instance;
}

export default StatisticsAgent;
AGENT

echo "✅ Statistics Agent created"
```

### Step 3: Create CLI Commands

```bash
cat > src/cli/commands/stats.ts << 'CLI'
/**
 * TaskFlow CLI - Stats Commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getStatisticsAgent } from '../../agents/statistics-agent/index.js';

interface TaskStatistics {
  totalTasks: number;
  byStatus: Record<string, number>;
  completionRate: number;
  averageAgeInDays: number;
  oldestTaskDays: number;
  newestTaskDays: number;
}

export function registerStatsCommands(program: Command): void {
  const stats = program.command('stats').description('Task statistics');

  stats
    .command('overview')
    .description('Show task statistics overview')
    .action(async () => {
      const agent = getStatisticsAgent();
      const parentOpts = program.opts();

      const response = await agent.execute<TaskStatistics>({
        action: 'overview',
        params: {},
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      const data = response.data;
      if (!data) return;

      if (parentOpts.json) {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(chalk.bold('\n📊 Task Statistics Overview\n'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`Total Tasks:       ${data.totalTasks}`);
        console.log(`Completion Rate:   ${(data.completionRate * 100).toFixed(1)}%`);
        console.log(`Average Age:       ${data.averageAgeInDays.toFixed(1)} days`);
        console.log(chalk.gray('─'.repeat(40)));
        console.log(chalk.bold('\nBy Status:'));
        for (const [status, count] of Object.entries(data.byStatus)) {
          const bar = '█'.repeat(Math.min(count, 20));
          console.log(`  ${status.padEnd(12)} ${bar} ${count}`);
        }
      }
    });
}
CLI

echo "✅ Stats CLI created"
```

### Step 4: Register in CLI

```bash
cat << 'REGISTER'
=== Add to src/cli/index.ts ===

1. Add import at top:
   import { registerStatsCommands } from './commands/stats.js';

2. Add registration in createProgram():
   registerStatsCommands(program);
REGISTER
```

### Step 5: Test the New Agent

```bash
# Build and test
npm run build

# Create some tasks for statistics
npm start -- task create "Task 1"
npm start -- task create "Task 2" 
npm start -- task create "Task 3"
npm start -- task update <ID> --status done  # Use actual ID

# View statistics
npm start -- stats overview
npm start -- stats overview --json

# Verify agent is registered
npm start -- agent list
```

---

## Exercise 5: Extend an Existing Agent

### Scenario
**Request**: "Add a 'duplicate' action to Task Agent that copies a task."

### Step 1: Specification

```bash
mkdir -p specs/007-task-duplicate

cat > specs/007-task-duplicate/spec.md << 'SPEC'
# Feature: Task Duplicate

## User Story

As a user, I want to duplicate an existing task
so that I can quickly create similar tasks.

## Acceptance Scenarios

1. **Given** a task exists,
   **When** I run `taskflow task duplicate <id>`,
   **Then** a new task is created with same title (prefixed with "Copy of"),
   description, priority, and tags, but new ID and pending status

2. **Given** I duplicate a task,
   **When** the new task is created,
   **Then** it has a new unique ID and fresh timestamps
SPEC

echo "✅ Spec created"
```

### Step 2: Write Test

```bash
cat >> tests/contract/task-agent.test.ts << 'TEST'

  describe('duplicate action', () => {
    it('should create a copy of the task', async () => {
      // Create original task
      const original = await agent.execute<Task>({
        action: 'create',
        params: {
          title: 'Original task',
          description: 'Original description',
          priority: 'high',
          tags: ['work'],
        },
      });

      // Duplicate it
      const response = await agent.execute<Task>({
        action: 'duplicate',
        params: { id: original.data?.id },
      });

      expect(response.success).toBe(true);
      expect(response.data?.id).not.toBe(original.data?.id);
      expect(response.data?.title).toBe('Copy of Original task');
      expect(response.data?.description).toBe('Original description');
      expect(response.data?.priority).toBe('high');
      expect(response.data?.status).toBe('pending');
      expect(response.data?.tags).toEqual(['work']);
    });
  });
TEST

echo "✅ Test added"
npm test -- tests/contract/task-agent.test.ts --testNamePattern="duplicate" 2>&1 | tail -10
```

### Step 3: Implementation

```bash
cat << 'IMPL'
=== Add to src/agents/task-agent/index.ts ===

1. Add 'duplicate' to capabilities array

2. Add case in handleAction:
   case 'duplicate':
     return this.duplicateTask(params);

3. Add method:
   private duplicateTask(params: Record<string, unknown>): Task {
     this.validateParams(params, ['id']);
     const id = params['id'] as string;

     const storage = getStorage();
     const original = storage.getTask(id);

     if (!original) {
       throw new Error(`Task not found: ${id}`);
     }

     const duplicate = storage.createTask({
       title: `Copy of ${original.title}`,
       description: original.description ?? undefined,
       priority: original.priority,
       tags: [...original.tags],
     });

     this.logger.info('Task duplicated', { 
       originalId: id, 
       newId: duplicate.id 
     });
     
     return duplicate;
   }

=== Add CLI command in src/cli/commands/task.ts ===

  task
    .command('duplicate')
    .description('Duplicate an existing task')
    .argument('<id>', 'Task ID to duplicate')
    .action(async (id: string) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const response = await agent.execute<Task>({
        action: 'duplicate',
        params: { id },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.green('Task duplicated!'));
        console.log(formatTask(response.data as Task, true));
      }
    });
IMPL
```

---

## Exercise 6: Add Input Validation

### Scenario
**Request**: "Add validation to ensure due dates are not in the past when creating tasks."

### Step 1: Specification

```bash
cat > specs/008-validate-due-date/spec.md << 'SPEC'
# Feature: Due Date Validation

## Requirement

When creating or updating a task, if a due date is provided,
it must be in the future (or today).

## Acceptance Scenarios

1. **Given** I create a task with a past due date,
   **When** the command executes,
   **Then** an error is returned: "Due date cannot be in the past"

2. **Given** I create a task with today's date,
   **When** the command executes,
   **Then** the task is created successfully

3. **Given** I update a task with a past due date,
   **When** the command executes,
   **Then** an error is returned
SPEC

echo "✅ Spec created"
```

### Step 2: Write Test

```bash
cat >> tests/unit/validators.test.ts << 'TEST'

describe('Due Date Validation', () => {
  it('should reject past due dates', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    
    const result = safeValidate(CreateTaskSchema, {
      title: 'Test',
      dueDate: yesterday,
    });

    // This will pass until we add the validation
    // Update test expectation after implementing
    expect(result.success).toBe(true); // Change to false after impl
  });

  it('should accept future due dates', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    
    const result = safeValidate(CreateTaskSchema, {
      title: 'Test',
      dueDate: tomorrow,
    });

    expect(result.success).toBe(true);
  });
});
TEST

echo "✅ Test added"
```

### Step 3: Implementation

```bash
cat << 'IMPL'
=== Update src/lib/validators.ts ===

// Add custom validation for due date
const FutureDateSchema = z.string().datetime().refine(
  (date) => new Date(date) >= new Date(new Date().toDateString()),
  { message: 'Due date cannot be in the past' }
);

// Update CreateTaskSchema
export const CreateTaskSchema = z.object({
  title: TaskTitleSchema,
  description: TaskDescriptionSchema,
  priority: TaskPrioritySchema.default('medium'),
  dueDate: FutureDateSchema.nullable().optional(),  // Changed
  tags: TaskTagsSchema,
});
IMPL
```

---

## Exercise 7: Improve Error Handling

### Scenario
**Request**: "When database operations fail, show user-friendly messages instead of stack traces."

### Step 1: Create Error Handler Utility

```bash
cat > src/lib/errors.ts << 'ERRORS'
/**
 * TaskFlow CLI - Error Handling
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'AGENT_ERROR'
  | 'TIMEOUT_ERROR';

export class TaskFlowError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly userMessage: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TaskFlowError';
  }
}

export class ValidationError extends TaskFlowError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      `Invalid input: ${message}`,
      field ? { field } : undefined
    );
  }
}

export class NotFoundError extends TaskFlowError {
  constructor(entity: string, id: string) {
    super(
      `${entity} not found: ${id}`,
      'NOT_FOUND',
      `The ${entity.toLowerCase()} you requested does not exist`,
      { entity, id }
    );
  }
}

export class DatabaseError extends TaskFlowError {
  constructor(operation: string, originalError: Error) {
    super(
      `Database ${operation} failed: ${originalError.message}`,
      'DATABASE_ERROR',
      `Unable to ${operation}. Please try again.`,
      { operation }
    );
  }
}

export function formatErrorForUser(error: unknown): string {
  if (error instanceof TaskFlowError) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    // Hide technical details from users
    if (error.message.includes('SQLITE')) {
      return 'A database error occurred. Please try again.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
ERRORS

echo "✅ Error utilities created"
```

### Step 2: Use in Agents

```bash
cat << 'USAGE'
=== Update agents to use new error classes ===

// In task-agent/index.ts
import { NotFoundError } from '../../lib/errors.js';

// Replace:
throw new Error(`Task not found: ${id}`);

// With:
throw new NotFoundError('Task', id);

// In CLI commands, use formatErrorForUser:
import { formatErrorForUser } from '../../lib/errors.js';

catch (error) {
  console.error(chalk.red(formatErrorForUser(error)));
  process.exit(1);
}
USAGE
```

---

## Exercise 8: Add a CLI Flag

### Scenario
**Request**: "Add a `--quiet` flag that suppresses info messages."

### Step 1: Specification

```bash
cat > specs/009-quiet-flag/spec.md << 'SPEC'
# Feature: Quiet Mode Flag

## Requirement

Add `--quiet` or `-q` flag to suppress informational output.
Only show errors and requested data.

## Acceptance Scenarios

1. **Given** I run `taskflow task list --quiet`,
   **Then** only the task data is shown (no "Total: X tasks" etc.)

2. **Given** I run `taskflow task create "Test" --quiet`,
   **Then** only the task JSON/ID is shown (no "Task created!" message)
SPEC

echo "✅ Spec created"
```

### Step 2: Implementation

```bash
cat << 'IMPL'
=== In src/cli/index.ts ===

// Add global option
program
  .option('-q, --quiet', 'Suppress informational output', false);

=== In CLI commands ===

// Check for quiet mode before printing info messages
const opts = program.opts();
if (!opts.quiet) {
  console.log(chalk.green('Task created successfully!'));
}
IMPL
```

---

## Exercise 9: Add Database Migration

### Scenario
**Request**: "Add a `completed_at` column to track when tasks were finished."

### Step 1: Specification

```bash
cat > specs/010-completed-at/spec.md << 'SPEC'
# Feature: Task Completion Timestamp

## Requirement

Track when tasks are marked as 'done' with a completed_at timestamp.

## Database Change

Add column: `completed_at TEXT` (ISO 8601 datetime, nullable)

## Behavior

- Set completed_at when status changes to 'done'
- Clear completed_at when status changes from 'done' to anything else
SPEC

echo "✅ Spec created"
```

### Step 2: Migration Script

```bash
cat > scripts/migrate-001-completed-at.ts << 'MIGRATE'
/**
 * Migration: Add completed_at column
 * Run with: npx tsx scripts/migrate-001-completed-at.ts
 */

import Database from 'better-sqlite3';
import { config } from '../src/lib/config.js';

const db = new Database(config.database.path);

console.log('Running migration: Add completed_at column...');

// Check if column exists
const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
const hasColumn = tableInfo.some((col: any) => col.name === 'completed_at');

if (hasColumn) {
  console.log('Column already exists, skipping.');
} else {
  db.exec('ALTER TABLE tasks ADD COLUMN completed_at TEXT');
  console.log('Column added successfully!');
}

db.close();
MIGRATE

echo "✅ Migration script created"
echo "Run with: npx tsx scripts/migrate-001-completed-at.ts"
```

---

## Exercise 10: Performance Optimization

### Scenario
**Request**: "Task list is slow with many tasks. Add pagination."

### Step 1: Specification

```bash
cat > specs/011-pagination/spec.md << 'SPEC'
# Feature: Task List Pagination

## Requirement

Support pagination for task list to handle large datasets.

## CLI Interface

```
taskflow task list --page 1 --per-page 20
```

## API Changes

- Add `page` parameter (default: 1)
- Add `perPage` parameter (default: 20, max: 100)
- Return pagination metadata with results
SPEC

echo "✅ Spec created"
```

### Step 2: Implementation

```bash
cat << 'IMPL'
=== In src/lib/storage.ts ===

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

listTasksPaginated(
  filters: TaskFilters = {},
  page: number = 1,
  perPage: number = 20
): PaginatedResult<Task> {
  // Get total count
  const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks');
  const { count: total } = countStmt.get() as { count: number };
  
  // Get page of data
  const offset = (page - 1) * perPage;
  const stmt = this.db.prepare(`
    SELECT * FROM tasks
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);
  
  const rows = stmt.all(perPage, offset) as TaskRow[];
  
  return {
    data: rows.map(row => this.rowToTask(row)),
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

=== In CLI ===

task
  .command('list')
  .option('--page <number>', 'Page number', '1')
  .option('--per-page <number>', 'Items per page', '20')
  .action(async (options) => {
    // Use paginated method
    const result = storage.listTasksPaginated(
      filters,
      parseInt(options.page),
      parseInt(options.perPage)
    );
    
    // Show pagination info
    console.log(`Page ${result.pagination.page} of ${result.pagination.totalPages}`);
  });
IMPL
```

---

## Quick Reference: Common Operations

### Adding a Feature
```bash
mkdir -p specs/XXX-feature-name
# Create: spec.md, plan.md, tasks.md
# Write failing tests
# Implement
# Verify
```

### Fixing a Bug
```bash
mkdir -p specs/XXX-fix-description
# Document bug in spec.md
# Write failing test that reproduces bug
# Fix code
# Verify test passes
```

### Refactoring
```bash
mkdir -p specs/XXX-refactor-description
# Document current state and desired state
# Run existing tests (baseline)
# Refactor
# Verify same tests pass
```

### Adding Validation
```bash
# Update validators.ts with new Zod schema
# Add tests for valid and invalid cases
# Update agents/CLI to use validation
```

### Database Changes
```bash
# Create migration script in scripts/
# Update storage.ts schema
# Update types.ts
# Run migration
# Update affected agents
```

---

## Checklist for Every Change

- [ ] Specification written
- [ ] Plan created (for features)
- [ ] Tests written FIRST
- [ ] Tests fail before implementation
- [ ] Implementation complete
- [ ] Tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] Manual verification done
- [ ] Documentation updated
- [ ] Constitution compliance verified
