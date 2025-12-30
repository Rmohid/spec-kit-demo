# Agents Explained

> Understanding the agent architecture in TaskFlow CLI

## What is an Agent?

An **agent** is a specialized component that handles a specific domain of operations. Agents:
- Have a clear, single responsibility
- Expose a defined set of capabilities
- Operate independently but can communicate
- Are testable in isolation

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLI Layer                              │
│         (User interaction, argument parsing, output)            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Coordinator Agent                           │
│                    (Routes requests to agents)                   │
└───────┬─────────────────────┬─────────────────────┬─────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐
│  Task Agent   │    │ Notification  │    │   Reasoning Agent     │
│               │    │    Agent      │    │    (Autonomous)       │
│ • create      │    │               │    │                       │
│ • read        │    │ • notify      │    │ • observe             │
│ • update      │    │ • list        │    │ • think               │
│ • delete      │    │ • clear       │    │ • plan                │
│ • list        │    │               │    │ • act                 │
└───────────────┘    └───────────────┘    │ • reflect             │
                                          └───────────────────────┘
```

## The BaseAgent Class

All agents extend the `BaseAgent` abstract class:

```typescript
abstract class BaseAgent {
  // Agent metadata
  protected readonly info: AgentInfo;
  
  // Logger scoped to this agent
  protected readonly logger: winston.Logger;
  
  // Current operational status
  protected status: AgentStatus;
  
  // Execute a request (common error handling)
  async execute<T>(request: AgentActionRequest): Promise<AgentResponse<T>>
  
  // Subclasses implement this
  protected abstract handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown>;
}
```

### Benefits of BaseAgent

1. **Consistent interface** - All agents have the same `execute()` method
2. **Built-in error handling** - Errors are caught and formatted
3. **Logging** - Every agent gets a scoped logger
4. **Metadata** - Easy to discover capabilities

## Agent Types

### 1. Simple CRUD Agent (Task Agent)

The simplest type of agent—performs direct operations:

```typescript
class TaskAgent extends BaseAgent {
  protected async handleAction(action, params) {
    switch (action) {
      case 'create': return this.createTask(params);
      case 'get': return this.getTask(params);
      case 'update': return this.updateTask(params);
      case 'delete': return this.deleteTask(params);
      case 'list': return this.listTasks(params);
    }
  }
}
```

**Characteristics:**
- Synchronous operations
- Direct database access
- Simple request/response

### 2. Orchestrator Agent (Coordinator)

Doesn't do business logic—routes to other agents:

```typescript
class CoordinatorAgent extends BaseAgent {
  protected async handleAction(action, params) {
    switch (action) {
      case 'route':
        const agent = registry.getAgent(params.agent);
        return agent.execute(params.action, params.params);
    }
  }
}
```

**Characteristics:**
- No business logic
- Knows about other agents
- Aggregates responses

### 3. Event-Based Agent (Notification Agent)

Reacts to events and maintains state:

```typescript
class NotificationAgent extends BaseAgent {
  async notifyTaskCreated(taskId, title) {
    await this.execute({
      action: 'notify',
      params: { type: 'task_created', taskId, message: `Task created: ${title}` }
    });
  }
}
```

**Characteristics:**
- Reactive (responds to events)
- May have side effects
- Often integrates with CRUD agents

### 4. Autonomous Agent (Reasoning Agent)

The most sophisticated type—makes decisions:

```typescript
class ReasoningAgent extends BaseAgent {
  protected async handleAction(action, params) {
    switch (action) {
      case 'reason':
        return this.engine.reason(params.goal, params.options);
    }
  }
}
```

**Characteristics:**
- Multiple reasoning steps
- Uses tools to gather information
- Makes decisions based on analysis
- Can operate without human input

## Agent Communication

Agents communicate through the Coordinator:

```typescript
// CLI calls coordinator
const response = await coordinator.routeTo('task-agent', 'create', {
  title: 'New task'
});

// Coordinator routes to task-agent
// Task-agent creates task
// Task-agent notifies notification-agent (side effect)
// Response flows back
```

## Agent Registry

Agents register themselves at startup:

```typescript
const registry = getAgentRegistry();

// Auto-registered agents
registry.register(new TaskAgent());
registry.register(new NotificationAgent());
registry.register(new CoordinatorAgent());
registry.register(new ReasoningAgent());

// Discover agents
const agents = registry.listAgents();
const agent = registry.getAgent('task-agent');
```

## Creating a New Agent

1. **Extend BaseAgent**:
```typescript
class MyAgent extends BaseAgent {
  constructor() {
    super({
      name: 'my-agent',
      displayName: 'My Agent',
      description: 'Does something useful',
      capabilities: ['action1', 'action2'],
    });
  }

  protected async handleAction(action, params) {
    // Implement actions
  }
}
```

2. **Register the agent**:
```typescript
// In registry.ts
registry.register(new MyAgent());
```

3. **Add CLI commands** (if needed):
```typescript
// In commands/my-agent.ts
program
  .command('my-agent')
  .action(async () => {
    const agent = getMyAgent();
    // ...
  });
```

## Best Practices

### 1. Single Responsibility
Each agent should do one thing well:
- ✅ Task Agent: CRUD for tasks
- ❌ Task Agent: CRUD + notifications + analysis

### 2. Independent Testing
Agents should be testable without other agents:
```typescript
describe('TaskAgent', () => {
  let agent: TaskAgent;
  
  beforeEach(() => {
    agent = new TaskAgent();
  });
  
  it('should create a task', async () => {
    // Test in isolation
  });
});
```

### 3. Clear Interfaces
Use TypeScript interfaces for all inputs/outputs:
```typescript
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}
```

### 4. Graceful Error Handling
Never throw—return error responses:
```typescript
return {
  success: false,
  agent: this.info.name,
  action,
  error: 'Something went wrong'
};
```

### 5. Comprehensive Logging
Log all significant operations:
```typescript
this.logger.info('Task created', { taskId, title });
this.logger.debug('Executing action', { action, params });
this.logger.error('Failed', { error: message });
```

## Next Steps

- [Reasoning Agent Deep Dive](08-reasoning-agent.md) - Learn about autonomous agents
- [Implementation Guide](06-implementation.md) - TDD workflow for agents
