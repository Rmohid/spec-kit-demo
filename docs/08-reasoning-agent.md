# Reasoning Agent Deep Dive

> Building a fully autonomous agent with the observe-think-plan-act-reflect loop

## What Makes an Agent "Autonomous"?

Most agents are reactive—they receive a command and execute it. The Reasoning Agent is different:

| Reactive Agent | Autonomous Agent |
|----------------|------------------|
| Executes commands | Interprets goals |
| Single action | Multiple steps |
| Deterministic | Adaptive |
| No memory | Maintains context |

## The ReAct Pattern

The Reasoning Agent implements the ReAct (Reason + Act) pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    REASONING LOOP                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐                                              │
│   │  OBSERVE │ ─── Gather context about current state       │
│   └────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                              │
│   │  THINK   │ ─── Analyze observations, form hypotheses    │
│   └────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                              │
│   │   PLAN   │ ─── Decide which tools to use                │
│   └────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                              │
│   │   ACT    │ ─── Execute tools, gather results            │
│   └────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   ┌──────────┐                                              │
│   │ REFLECT  │ ─── Evaluate results, generate output        │
│   └────┬─────┘                                              │
│        │                                                     │
│        ▼                                                     │
│   Goal achieved? ──Yes──▶ Return result                     │
│        │                                                     │
│        No                                                    │
│        │                                                     │
│        └────────────────▶ Loop back to OBSERVE              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   REASONING AGENT                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               ReasoningEngine                        │    │
│  │                                                      │    │
│  │  - Orchestrates the 5-phase loop                    │    │
│  │  - Manages iteration limits                         │    │
│  │  - Handles timeouts                                 │    │
│  └──────────────────────────┬──────────────────────────┘    │
│                             │                                │
│           ┌─────────────────┼─────────────────┐             │
│           │                 │                 │             │
│           ▼                 ▼                 ▼             │
│  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  ToolExecutor   │ │   Memory    │ │     Logger      │   │
│  │                 │ │   Manager   │ │                 │   │
│  │ - query_tasks   │ │             │ │ - Step logging  │   │
│  │ - analyze_...   │ │ - Context   │ │ - Debug output  │   │
│  │ - find_overdue  │ │ - History   │ │                 │   │
│  │ - suggest_order │ │ - Stats     │ │                 │   │
│  └─────────────────┘ └─────────────┘ └─────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: OBSERVE

Gather information about the current state:

```typescript
interface Observation {
  goal: string;
  taskStats: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
  };
  availableTools: string[];
  previousSteps: ReasoningStep[];
}

private observe(goal: string): Observation {
  const tasks = this.storage.listTasks({});
  
  return {
    goal,
    taskStats: {
      total: tasks.length,
      byStatus: this.countByField(tasks, 'status'),
      byPriority: this.countByField(tasks, 'priority'),
      overdue: tasks.filter(t => this.isOverdue(t)).length,
    },
    availableTools: this.toolExecutor.listTools(),
    previousSteps: this.memory.getSteps(),
  };
}
```

## Phase 2: THINK

Analyze observations and form hypotheses:

```typescript
interface Thought {
  analysis: string;
  hypotheses: string[];
  keyInsights: string[];
}

private think(observation: Observation): Thought {
  const insights: string[] = [];
  const hypotheses: string[] = [];

  // Analyze the goal
  if (observation.goal.includes('prioritize') || 
      observation.goal.includes('next')) {
    hypotheses.push('User wants task prioritization');
    insights.push('Should analyze by priority and due date');
  }

  // Analyze task state
  if (observation.taskStats.overdue > 0) {
    insights.push(`${observation.taskStats.overdue} overdue tasks need attention`);
  }

  if (observation.taskStats.byPriority.urgent > 0) {
    insights.push('Urgent tasks should be addressed first');
  }

  return {
    analysis: `Analyzing goal: "${observation.goal}"`,
    hypotheses,
    keyInsights: insights,
  };
}
```

## Phase 3: PLAN

Decide which tools to use:

```typescript
interface Plan {
  actions: PlannedAction[];
  rationale: string;
}

interface PlannedAction {
  tool: string;
  params: Record<string, unknown>;
  purpose: string;
}

private plan(thought: Thought, observation: Observation): Plan {
  const actions: PlannedAction[] = [];

  // Always start with current task analysis
  if (thought.hypotheses.includes('User wants task prioritization')) {
    actions.push({
      tool: 'analyze_priorities',
      params: { sortBy: ['priority', 'dueDate'] },
      purpose: 'Understand current task priorities',
    });
  }

  // Check for overdue if mentioned
  if (observation.taskStats.overdue > 0) {
    actions.push({
      tool: 'find_overdue',
      params: {},
      purpose: 'Identify overdue tasks',
    });
  }

  // Add suggestion tool
  actions.push({
    tool: 'suggest_order',
    params: { limit: 5 },
    purpose: 'Recommend task execution order',
  });

  return {
    actions,
    rationale: `Based on goal analysis, executing ${actions.length} tools`,
  };
}
```

## Phase 4: ACT

Execute the planned tools:

```typescript
interface ActionResult {
  tool: string;
  success: boolean;
  data: unknown;
  error?: string;
}

private async act(plan: Plan): Promise<ActionResult[]> {
  const results: ActionResult[] = [];

  for (const action of plan.actions) {
    try {
      const result = await this.toolExecutor.execute(
        action.tool, 
        action.params
      );
      
      results.push({
        tool: action.tool,
        success: true,
        data: result,
      });
      
      this.logger.debug('Tool executed', { tool: action.tool, result });
    } catch (error) {
      results.push({
        tool: action.tool,
        success: false,
        data: null,
        error: error.message,
      });
      
      this.logger.warn('Tool failed', { tool: action.tool, error });
    }
  }

  return results;
}
```

## Phase 5: REFLECT

Evaluate results and generate output:

```typescript
interface Reflection {
  goalAchieved: boolean;
  confidence: number;
  recommendations: string[];
  summary: string;
}

private reflect(
  goal: string, 
  results: ActionResult[]
): Reflection {
  const successfulResults = results.filter(r => r.success);
  const confidence = successfulResults.length / results.length;

  const recommendations: string[] = [];

  // Generate recommendations from results
  for (const result of successfulResults) {
    if (result.tool === 'find_overdue' && result.data.length > 0) {
      recommendations.push(
        `Address ${result.data.length} overdue task(s) immediately`
      );
    }

    if (result.tool === 'suggest_order') {
      const suggested = result.data as Task[];
      if (suggested.length > 0) {
        recommendations.push(
          `Start with: "${suggested[0].title}"`
        );
      }
    }
  }

  return {
    goalAchieved: recommendations.length > 0,
    confidence,
    recommendations,
    summary: this.generateSummary(goal, results),
  };
}
```

## Available Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `query_tasks` | Get tasks by criteria | `status`, `priority`, `limit` |
| `analyze_priorities` | Rank by priority/urgency | `sortBy` |
| `find_overdue` | Find overdue tasks | none |
| `find_dependencies` | Find related tasks | `tags` |
| `suggest_order` | Suggest execution order | `limit` |
| `calculate_urgency` | Calculate urgency scores | none |

### Adding a New Tool

```typescript
// In tool-executor.ts

this.register({
  name: 'estimate_completion',
  description: 'Estimate time to complete pending tasks',
  parameters: {
    averageMinutes: 'Average minutes per task',
  },
  execute: async (params) => {
    const tasks = storage.listTasks({ status: 'pending' });
    const avgMinutes = params.averageMinutes ?? 30;
    
    return {
      pendingCount: tasks.length,
      estimatedMinutes: tasks.length * avgMinutes,
      estimatedHours: (tasks.length * avgMinutes) / 60,
    };
  },
});
```

## Memory Management

The Memory Manager maintains context across iterations:

```typescript
class MemoryManager {
  private context: Map<string, unknown> = new Map();
  private steps: ReasoningStep[] = [];

  // Store context for current session
  setContext(key: string, value: unknown) {
    this.context.set(key, value);
  }

  // Retrieve context
  getContext(key: string): unknown {
    return this.context.get(key);
  }

  // Record a reasoning step
  addStep(step: ReasoningStep) {
    this.steps.push(step);
    // Persist to database for debugging
    this.storage.saveReasoningStep(step);
  }

  // Get all steps for current session
  getSteps(): ReasoningStep[] {
    return [...this.steps];
  }
}
```

## Safeguards

### Iteration Limits

Prevent infinite loops:

```typescript
const DEFAULT_MAX_ITERATIONS = 10;

async reason(goal: string, options: ReasoningOptions) {
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  
  for (let i = 0; i < maxIterations; i++) {
    const result = await this.executeIteration(goal);
    
    if (result.goalAchieved) {
      return result;
    }
  }
  
  return {
    goalAchieved: false,
    recommendations: ['Max iterations reached'],
    summary: 'Could not fully achieve goal within iteration limit',
  };
}
```

### Timeout Handling

```typescript
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

async reason(goal: string, options: ReasoningOptions) {
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  
  return Promise.race([
    this.executeReasoning(goal, options),
    this.createTimeout(timeout),
  ]);
}

private createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Reasoning timeout after ${ms}ms`));
    }, ms);
  });
}
```

## Usage Examples

### Basic Usage

```bash
taskflow reason "What should I work on next?"
```

Output:
```
Based on analysis of your 12 tasks:

Recommendations:
1. Address 1 overdue task(s) immediately
2. Focus on 2 urgent task(s) first
3. Start with: "Fix login bug"

Confidence: 80%
```

### With Detailed Steps

```bash
taskflow reason "Organize my tasks" --show-steps
```

Output:
```
Step 1 (OBSERVE):
  Total tasks: 12
  By status: pending=5, in_progress=3, done=4
  Overdue: 1

Step 2 (THINK):
  Goal: Task organization
  Insights: 1 overdue task needs attention

Step 3 (PLAN):
  Actions: analyze_priorities, find_overdue, suggest_order

Step 4 (ACT):
  ✓ analyze_priorities: Analyzed 12 tasks
  ✓ find_overdue: Found 1 overdue task
  ✓ suggest_order: Generated order for 5 tasks

Step 5 (REFLECT):
  Goal achieved: Yes
  Confidence: 80%

Recommendations:
...
```

## Testing the Reasoning Agent

```typescript
describe('ReasoningAgent', () => {
  it('should analyze and recommend', async () => {
    // Setup test tasks
    await createTestTasks([
      { title: 'Urgent task', priority: 'urgent' },
      { title: 'Normal task', priority: 'medium' },
    ]);

    const result = await agent.execute({
      action: 'reason',
      params: { goal: 'What should I do?' },
    });

    expect(result.success).toBe(true);
    expect(result.data.recommendations).toContain(
      expect.stringContaining('urgent')
    );
  });
});
```

## Why Not Use an LLM?

This implementation uses rule-based reasoning instead of an LLM for:

1. **Simplicity**: No API keys, no costs, no latency
2. **Debuggability**: Every decision is traceable
3. **Education**: Shows the underlying patterns clearly
4. **Offline**: Works without internet

In production, you could replace the rule-based `think` and `reflect` phases with LLM calls while keeping the same structure.

## Next Steps

- [Deployment](09-deployment.md) - Production deployment
- [Agents Explained](07-agents-explained.md) - General agent concepts

---

**Key Insight**: The power of autonomous agents comes from the structured reasoning loop, not from any single technology. The same pattern works with rule-based systems, LLMs, or hybrid approaches.
