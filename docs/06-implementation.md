# Implementation

> The TDD workflow: Red → Green → Refactor

## The TDD Mantra

Every piece of implementation code follows this cycle:

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   1. RED      Write a test that fails                       │
│      │                                                       │
│      ▼                                                       │
│   2. GREEN   Write minimum code to pass                     │
│      │                                                       │
│      ▼                                                       │
│   3. REFACTOR  Improve code, keep tests passing             │
│      │                                                       │
│      └──────────────▶ Repeat                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Write a Failing Test (RED)

### Contract Tests

Test the interface/API of a component:

```typescript
// tests/contract/task-service.test.ts

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService(/* test database */);
  });

  describe('create', () => {
    it('should create a task with title', async () => {
      const task = await service.create({ title: 'Buy groceries' });

      expect(task).toMatchObject({
        id: expect.any(String),
        title: 'Buy groceries',
        status: 'pending',
      });
    });

    it('should reject empty title', async () => {
      await expect(service.create({ title: '' }))
        .rejects.toThrow('Title is required');
    });
  });
});
```

### Run the Test - It MUST Fail

```bash
npm test -- tests/contract/task-service.test.ts

# Expected output:
# FAIL tests/contract/task-service.test.ts
# ● TaskService › create › should create a task with title
#   Cannot find module '../src/services/task-service'
```

**This failure is correct!** You haven't written the implementation yet.

## Step 2: Write Minimum Code (GREEN)

Write the simplest code that makes the test pass:

```typescript
// src/services/task-service.ts

export class TaskService {
  async create(input: { title: string }) {
    if (!input.title) {
      throw new Error('Title is required');
    }

    return {
      id: crypto.randomUUID(),
      title: input.title,
      status: 'pending',
    };
  }
}
```

### Run the Test - It MUST Pass

```bash
npm test -- tests/contract/task-service.test.ts

# Expected output:
# PASS tests/contract/task-service.test.ts
# ✓ should create a task with title
# ✓ should reject empty title
```

## Step 3: Refactor (Keep Tests Passing)

Now improve the code while keeping tests green:

```typescript
// src/services/task-service.ts

import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export class TaskService {
  async create(input: unknown) {
    const validated = CreateTaskSchema.parse(input);

    return {
      id: crypto.randomUUID(),
      title: validated.title,
      description: validated.description ?? null,
      priority: validated.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
}
```

Run tests again - they should still pass.

## Integration Tests

Test complete flows:

```typescript
// tests/integration/task-commands.test.ts

describe('Task CLI Commands', () => {
  it('should create and list tasks', async () => {
    // Create a task
    const createResult = await runCLI('task create "Test task"');
    expect(createResult.exitCode).toBe(0);
    expect(createResult.stdout).toContain('Task created');

    // List tasks
    const listResult = await runCLI('task list --json');
    expect(listResult.exitCode).toBe(0);
    
    const tasks = JSON.parse(listResult.stdout);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Test task');
  });
});
```

## Test Categories

| Type | Purpose | When to Use |
|------|---------|-------------|
| **Contract** | Verify API/interface | Every service/agent |
| **Integration** | Test full flows | User stories |
| **Unit** | Isolated logic | Complex algorithms |

### Prefer Integration Over Unit

From the constitution:
> "Prefer real databases/services over mocks"

```typescript
// Good: Use real database
beforeEach(() => {
  db = new Database(':memory:'); // Real SQLite, in-memory
  service = new TaskService(db);
});

// Avoid: Excessive mocking
beforeEach(() => {
  mockDb = { query: jest.fn() }; // Mocks hide bugs
  service = new TaskService(mockDb);
});
```

## TDD for CLI Commands

### 1. Write Test First

```typescript
// tests/integration/task-create.test.ts

describe('task create command', () => {
  it('should create task with --json flag', async () => {
    const result = await runCLI('task create "Buy milk" --json');
    
    expect(result.exitCode).toBe(0);
    
    const task = JSON.parse(result.stdout);
    expect(task.title).toBe('Buy milk');
    expect(task.status).toBe('pending');
  });

  it('should show error for empty title', async () => {
    const result = await runCLI('task create ""');
    
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Title is required');
  });
});
```

### 2. Implement Command

```typescript
// src/cli/commands/task.ts

import { Command } from 'commander';
import { TaskService } from '../../services/task-service.js';

export function registerTaskCommands(program: Command) {
  const task = program.command('task');

  task
    .command('create')
    .argument('<title>', 'Task title')
    .action(async (title) => {
      const service = new TaskService();
      const opts = program.opts();

      try {
        const task = await service.create({ title });

        if (opts.json) {
          console.log(JSON.stringify(task, null, 2));
        } else {
          console.log(`Task created: ${task.id}`);
        }
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });
}
```

## Common TDD Mistakes

### ❌ Writing Tests After Code

```bash
# Bad workflow
1. Write implementation
2. Write tests
3. Tests pass immediately (no confidence they test the right thing)
```

### ❌ Testing Implementation Details

```typescript
// Bad: Tests internal method
it('should call _validateInput', () => {
  const spy = jest.spyOn(service, '_validateInput');
  service.create({ title: 'Test' });
  expect(spy).toHaveBeenCalled();
});

// Good: Tests behavior
it('should reject invalid input', async () => {
  await expect(service.create({ title: '' }))
    .rejects.toThrow('Title is required');
});
```

### ❌ Too Many Mocks

```typescript
// Bad: Everything is mocked
const mockDb = { query: jest.fn().mockReturnValue([]) };
const mockLogger = { info: jest.fn() };
const mockValidator = { validate: jest.fn().mockReturnValue(true) };

// Good: Use real dependencies
const db = new Database(':memory:');
const service = new TaskService(db);
```

## Error Handling in TDD

Always test error cases:

```typescript
describe('error handling', () => {
  it('should return 404 for non-existent task', async () => {
    const result = await service.get('non-existent-id');
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should handle database errors gracefully', async () => {
    // Simulate database error
    db.close();
    
    await expect(service.create({ title: 'Test' }))
      .rejects.toThrow('Database error');
  });
});
```

## Implementation Checklist

For every task:

- [ ] Write test first
- [ ] Run test - verify it FAILS
- [ ] Write minimum code to pass
- [ ] Run test - verify it PASSES
- [ ] Refactor if needed
- [ ] Run test - verify it still PASSES
- [ ] Commit with descriptive message

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/contract/task-service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="create"

# Run with coverage
npm run test:coverage

# Watch mode (re-run on changes)
npm run test:watch
```

## Next Steps

- [Agents Explained](07-agents-explained.md) - Agent architecture
- [Reasoning Agent Deep Dive](08-reasoning-agent.md) - Autonomous agents

---

**The TDD Rule**: If you're writing code that doesn't have a failing test waiting for it, you're doing it wrong.
