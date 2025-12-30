# Reasoning Agent

> A fully autonomous agent that uses structured reasoning to analyze tasks and provide intelligent recommendations.

## Overview

The Reasoning Agent is the showcase feature of TaskFlow CLI, demonstrating how to build an autonomous agent that can reason through complex queries. Unlike simple CRUD agents, the Reasoning Agent implements a structured thinking process inspired by the ReAct (Reason + Act) pattern.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REASONING AGENT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   ReasoningEngine                        │    │
│  │                                                          │    │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │    │
│  │  │ OBSERVE │───▶│  THINK  │───▶│  PLAN   │              │    │
│  │  └─────────┘    └─────────┘    └─────────┘              │    │
│  │       ▲                              │                   │    │
│  │       │                              ▼                   │    │
│  │  ┌─────────┐                   ┌─────────┐              │    │
│  │  │ REFLECT │◀──────────────────│   ACT   │              │    │
│  │  └─────────┘                   └─────────┘              │    │
│  │                                     │                    │    │
│  └─────────────────────────────────────┼────────────────────┘    │
│                                        │                         │
│  ┌─────────────────────┐    ┌──────────▼──────────┐             │
│  │   MemoryManager     │    │   ToolExecutor      │             │
│  │                     │    │                     │             │
│  │ - Session context   │    │ - query_tasks       │             │
│  │ - Step history      │    │ - analyze_priorities│             │
│  │ - Task stats        │    │ - find_overdue      │             │
│  │                     │    │ - suggest_order     │             │
│  └─────────────────────┘    └─────────────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## The Reasoning Loop

The agent follows a 5-phase reasoning loop:

### 1. OBSERVE (Gather Context)

The agent gathers information about the current state:
- Total number of tasks
- Task distribution by status and priority
- Number of overdue tasks
- Available tools

```typescript
// Example observation output
Goal: What should I work on next?

Current State:
- Total tasks: 12
- By status: {"pending": 5, "in_progress": 3, "done": 4}
- By priority: {"high": 2, "medium": 7, "low": 3}
- Overdue tasks: 1

Available tools: query_tasks, analyze_priorities, find_overdue, suggest_order
```

### 2. THINK (Analyze & Hypothesize)

The agent analyzes the goal and observations to form hypotheses:
- What is the user really asking for?
- What information do we need?
- What patterns do we see in the data?

```typescript
// Example thought output
Analysis of goal and current state:

- User wants task prioritization recommendations.
- Need to analyze tasks by priority and due date.

Key observations:
- 12 tasks in system
- 1 overdue task needs attention
- Priority distribution shows workload balance
```

### 3. PLAN (Decide Actions)

The agent decides which tools to use:
- Each tool has a specific purpose
- Tools are chosen based on the goal analysis
- Order of execution matters

```typescript
// Example plan output
Planned actions:
1. analyze_priorities: Understand current task priorities
2. find_overdue: Identify overdue tasks
3. suggest_order: Determine optimal task execution order
```

### 4. ACT (Execute Tools)

The agent executes the planned tools:
- Tools query the database
- Results are collected
- Errors are handled gracefully

```typescript
// Example action output
✓ analyze_priorities: Analyzed 12 tasks. Top priority: Fix login bug
✓ find_overdue: Found 1 overdue task(s): Update documentation
✓ suggest_order: Suggested order for 5 tasks based on priority and urgency
```

### 5. REFLECT (Evaluate & Recommend)

The agent evaluates results and generates recommendations:
- Was the goal achieved?
- What confidence do we have?
- What should the user do?

```typescript
// Example reflection output
{
  "goalAchieved": true,
  "confidence": 0.8,
  "recommendations": [
    "Address 1 overdue task(s) immediately",
    "Focus on 2 urgent task(s) first",
    "Review and update task priorities regularly"
  ],
  "summary": "Based on analysis of your 12 tasks..."
}
```

## Available Tools

| Tool | Description | When Used |
|------|-------------|-----------|
| `query_tasks` | Get tasks matching criteria | General queries |
| `analyze_priorities` | Rank tasks by priority/urgency | Prioritization questions |
| `find_overdue` | Find all overdue tasks | Deadline concerns |
| `find_dependencies` | Find related tasks by tags | Dependency questions |
| `suggest_order` | Suggest execution order | Planning questions |
| `calculate_urgency` | Calculate urgency scores | Urgency analysis |

## Usage

### Basic Usage

```bash
# Ask what to work on
taskflow reason "What should I work on next?"

# Analyze overdue tasks
taskflow reason "Show me my overdue tasks and suggest what to do"

# Get task organization suggestions
taskflow reason "How should I organize my tasks this week?"
```

### With Options

```bash
# Show detailed reasoning steps
taskflow reason "Prioritize my tasks" --show-steps

# Limit iterations (for faster responses)
taskflow reason "Quick status check" --max-iterations 2

# Get JSON output
taskflow reason "Analyze my backlog" --json
```

### Programmatic Usage

```typescript
import { getReasoningAgent } from './agents/reasoning-agent';

const agent = getReasoningAgent();

const response = await agent.execute({
  action: 'reason',
  params: {
    goal: 'What should I work on next?',
    maxIterations: 5,
    includeSteps: true,
  },
});

if (response.success) {
  const result = response.data as ReasoningResult;
  console.log('Recommendations:', result.recommendations);
  console.log('Confidence:', result.confidence);
}
```

## Extending the Agent

### Adding New Tools

```typescript
// In tool-executor.ts

this.register({
  name: 'my_new_tool',
  description: 'Does something useful',
  parameters: {
    param1: 'Description of param1',
  },
  execute: async (params) => {
    // Tool implementation
    return {
      success: true,
      data: { /* results */ },
    };
  },
});
```

### Customizing Reasoning

The reasoning engine can be customized by:
1. Modifying the `think` phase to recognize new goal patterns
2. Adjusting the `plan` phase to use different tool combinations
3. Updating the `reflect` phase to generate different recommendations

## Design Decisions

### Why Not Use an LLM?

This demo uses rule-based reasoning instead of an LLM for several reasons:

1. **Simplicity**: No API keys or external dependencies
2. **Debuggability**: Every decision is traceable
3. **Speed**: Instant responses without API latency
4. **Cost**: No per-request charges
5. **Education**: Shows the underlying patterns clearly

In production, you could replace the rule-based logic with LLM calls while keeping the same structure.

### Why the 5-Phase Loop?

The observe-think-plan-act-reflect loop provides:

1. **Structure**: Clear phases make debugging easier
2. **Auditability**: Every step is logged
3. **Flexibility**: Each phase can be enhanced independently
4. **Learning**: The reflect phase enables iterative improvement

### Memory Management

The Memory Manager provides:
- **Session context**: Current tasks and statistics
- **Step history**: All reasoning steps for debugging
- **Persistence**: Steps are saved to SQLite for later analysis

## Troubleshooting

### Reasoning Takes Too Long

```bash
# Reduce max iterations
taskflow reason "Quick check" --max-iterations 2
```

### Not Getting Expected Recommendations

1. Check if you have tasks in the system: `taskflow task list`
2. Review reasoning steps: `taskflow reason "..." --show-steps`
3. Check the logs: `LOG_LEVEL=debug taskflow reason "..."`

### Tool Execution Fails

Check the error in the action output. Common issues:
- Database not initialized
- Invalid parameters
- Missing dependencies

## Further Reading

- [ReAct Paper](https://arxiv.org/abs/2210.03629) - The pattern this is based on
- [Spec Kit Documentation](https://github.com/github/spec-kit) - SDD methodology
- [Agent Architecture Guide](../../../docs/07-agents-explained.md) - General agent concepts
