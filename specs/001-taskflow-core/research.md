# Technical Research: TaskFlow Core

**Feature**: 001-taskflow-core  
**Date**: 2025-12-30

---

## Overview

This document captures technical research performed during the planning phase. It serves as a reference for implementation decisions and documents alternatives considered.

---

## 1. CLI Framework Selection

### Options Evaluated

| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Commander.js** | Industry standard, excellent TS support, subcommands, auto-help | Larger API surface | ✅ Selected |
| Yargs | Feature-rich, middleware support | Complex configuration | ❌ |
| Oclif | Full framework, plugins | Overkill for demo | ❌ |
| Citty | Lightweight, modern | Less documentation | ❌ |

### Commander.js Justification

1. **Most widely used** - Easy to find examples and solutions
2. **Excellent TypeScript support** - Native types included
3. **Subcommand support** - Perfect for `taskflow task create`, `taskflow agent list`
4. **Auto-generated help** - Reduces documentation burden
5. **Active maintenance** - Regular updates

### Usage Pattern

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('taskflow')
  .description('Multi-agent task management CLI')
  .version('1.0.0');

program
  .command('task')
  .description('Task management commands')
  .command('create')
  .argument('<title>', 'Task title')
  .option('--priority <level>', 'Priority level', 'medium')
  .option('--json', 'Output as JSON')
  .action(async (title, options) => {
    // Handle task creation
  });
```

---

## 2. SQLite Library Selection

### Options Evaluated

| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| **better-sqlite3** | Synchronous API, fastest, native | Requires compilation | ✅ Selected |
| sql.js | Pure JS, no compilation | Slower, memory-only default | ❌ |
| sqlite3 | Async, popular | Callback-based, slower | ❌ |

### better-sqlite3 Justification

1. **Synchronous API** - Perfect for CLI (no async complexity for simple ops)
2. **Performance** - Fastest SQLite library for Node.js
3. **Transactions** - Simple transaction support
4. **Prepared statements** - Secure and efficient

### Usage Pattern

```typescript
import Database from 'better-sqlite3';

const db = new Database('taskflow.db');

// Prepared statement
const insert = db.prepare(`
  INSERT INTO tasks (id, title, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

// Transaction
const createTask = db.transaction((task) => {
  insert.run(task.id, task.title, task.status, task.createdAt, task.updatedAt);
});
```

---

## 3. Reasoning Agent Architecture

### Pattern: ReAct (Reason + Act)

Based on the paper "ReAct: Synergizing Reasoning and Acting in Language Models" - adapted for non-LLM use.

### Implementation Approach

Instead of using an LLM, our reasoning agent uses:
1. **Rule-based reasoning** - Predefined analysis rules
2. **Heuristic planning** - Task prioritization algorithms
3. **Structured output** - JSON-formatted reasoning steps

### Reasoning Loop Pseudocode

```
function reason(goal: string, maxIterations: number = 10):
  context = memory.getContext()
  
  for i in 1..maxIterations:
    // OBSERVE: Gather current state
    observation = observe(context, goal)
    
    // THINK: Analyze observation
    thought = think(observation, goal)
    
    // PLAN: Decide next action
    plan = plan(thought, availableTools)
    
    // ACT: Execute planned action
    result = act(plan)
    
    // REFLECT: Evaluate result
    reflection = reflect(result, goal)
    
    if reflection.goalAchieved:
      return formatResult(reflection)
    
    context = updateContext(context, reflection)
  
  return partialResult("Max iterations reached")
```

### Available Tools

| Tool | Description | Input | Output |
|------|-------------|-------|--------|
| `query_tasks` | Get tasks matching criteria | filters | Task[] |
| `analyze_priorities` | Analyze task priorities | Task[] | Analysis |
| `find_dependencies` | Identify task dependencies | Task[] | Dependencies |
| `calculate_urgency` | Compute urgency scores | Task[] | Scores |
| `suggest_order` | Suggest execution order | Task[] | OrderedList |

### Example Reasoning Session

```
Goal: "What should I work on next?"

Step 1 - OBSERVE:
  Input: { goal: "prioritize work" }
  Output: { tasks: [...], context: "5 pending, 2 urgent" }

Step 2 - THINK:
  Input: { observation: "5 pending, 2 urgent tasks" }
  Output: { thought: "Should prioritize urgent tasks, check due dates" }

Step 3 - PLAN:
  Input: { thought: "prioritize by urgency and due date" }
  Output: { action: "analyze_priorities", params: { sortBy: ["urgency", "dueDate"] } }

Step 4 - ACT:
  Input: { action: "analyze_priorities", params: {...} }
  Output: { result: "Task A (urgent, due today), Task B (high, due tomorrow)" }

Step 5 - REFLECT:
  Input: { result: "prioritized list available" }
  Output: { goalAchieved: true, recommendation: "Start with Task A" }
```

---

## 4. Logging Strategy

### Winston Configuration

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // File for production/debugging
    new winston.transports.File({
      filename: 'logs/taskflow.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Errors that need immediate attention |
| `warn` | Potentially harmful situations |
| `info` | Important runtime events |
| `debug` | Detailed debug information (reasoning steps) |

---

## 5. Validation with Zod

### Why Zod?

1. **TypeScript inference** - Schemas generate types automatically
2. **Composable** - Build complex schemas from simple ones
3. **Transformations** - Parse and transform in one step
4. **Error messages** - Clear, customizable error messages

### Schema Examples

```typescript
import { z } from 'zod';

// Task creation input
export const CreateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z.string()
    .max(2000, 'Description must be 2000 characters or less')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  dueDate: z.string()
    .datetime()
    .optional(),
  tags: z.array(z.string().max(50))
    .default([]),
});

// Infer TypeScript type from schema
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// Usage
function createTask(input: unknown): Task {
  const validated = CreateTaskSchema.parse(input);
  // validated is now properly typed
}
```

---

## 6. Error Handling Strategy

### Error Types

```typescript
// Base error class
export class TaskFlowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = 'TaskFlowError';
  }
}

// Specific errors
export class ValidationError extends TaskFlowError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', `Invalid input: ${message}`);
  }
}

export class NotFoundError extends TaskFlowError {
  constructor(entity: string, id: string) {
    super(
      `${entity} not found: ${id}`,
      'NOT_FOUND',
      `${entity} with ID "${id}" does not exist`
    );
  }
}

export class AgentError extends TaskFlowError {
  constructor(agent: string, message: string) {
    super(
      `Agent ${agent} error: ${message}`,
      'AGENT_ERROR',
      `The ${agent} agent encountered an error: ${message}`
    );
  }
}
```

### CLI Error Handling

```typescript
async function handleCommand(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof TaskFlowError) {
      console.error(chalk.red(`Error: ${error.userMessage}`));
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
    
    // Unexpected error
    console.error(chalk.red('An unexpected error occurred'));
    console.error(error);
    process.exit(1);
  }
}
```

---

## 7. Testing Strategy

### Test Categories

| Category | Purpose | Location | Coverage Target |
|----------|---------|----------|-----------------|
| Contract | Agent interface validation | `tests/contract/` | 100% of agent methods |
| Integration | End-to-end flows | `tests/integration/` | All user stories |
| Unit | Isolated logic | `tests/unit/` | Complex algorithms |

### Example Contract Test

```typescript
describe('TaskAgent Contract', () => {
  let agent: TaskAgent;
  
  beforeEach(() => {
    agent = new TaskAgent(/* test db */);
  });
  
  describe('create', () => {
    it('should create a task with required fields', async () => {
      const result = await agent.execute({
        action: 'create',
        params: { title: 'Test task' }
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: expect.any(String),
        title: 'Test task',
        status: 'pending'
      });
    });
    
    it('should reject empty title', async () => {
      await expect(
        agent.execute({ action: 'create', params: { title: '' } })
      ).rejects.toThrow(ValidationError);
    });
  });
});
```

---

## 8. Performance Considerations

### SQLite Optimizations

1. **Write-Ahead Logging (WAL)** - Better concurrent read performance
2. **Prepared statements** - Cached execution plans
3. **Indexes** - On frequently queried columns (status, priority, due_date)

```typescript
// Enable WAL mode
db.pragma('journal_mode = WAL');

// Optimize for CLI (single connection)
db.pragma('synchronous = NORMAL');
```

### Reasoning Agent Limits

1. **Max iterations**: 10 (configurable)
2. **Timeout**: 30 seconds per session
3. **Memory limit**: Store only last 5 reasoning sessions

---

## References

1. [Commander.js Documentation](https://github.com/tj/commander.js)
2. [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
3. [Zod Documentation](https://zod.dev)
4. [Winston Documentation](https://github.com/winstonjs/winston)
5. [ReAct Paper](https://arxiv.org/abs/2210.03629)

---

**Document Author**: Spec Kit Demo Team  
**Last Updated**: 2025-12-30
