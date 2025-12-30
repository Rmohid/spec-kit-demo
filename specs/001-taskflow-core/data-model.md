# Data Model: TaskFlow Core

**Feature**: 001-taskflow-core  
**Version**: 1.0.0  
**Last Updated**: 2025-12-30

---

## Overview

This document defines the data entities for TaskFlow CLI. All entities are persisted in SQLite and accessed through the storage layer.

---

## Entity: Task

Represents a unit of work to be completed.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier, auto-generated |
| `title` | string | Yes | Short description of the task (max 200 chars) |
| `description` | string | No | Detailed description (max 2000 chars) |
| `status` | enum | Yes | Current state: `pending`, `in_progress`, `done`, `cancelled` |
| `priority` | enum | Yes | Priority level: `low`, `medium`, `high`, `urgent` |
| `dueDate` | ISO 8601 string | No | When the task should be completed |
| `tags` | string[] | No | Categorization tags |
| `createdAt` | ISO 8601 string | Yes | When task was created, auto-generated |
| `updatedAt` | ISO 8601 string | Yes | When task was last modified, auto-updated |

### Status Transitions

```
┌─────────┐
│ pending │◀──────────────────────────────┐
└────┬────┘                               │
     │ start                              │ reopen
     ▼                                    │
┌─────────────┐      complete      ┌──────┴──┐
│ in_progress │───────────────────▶│  done   │
└──────┬──────┘                    └─────────┘
       │ cancel
       ▼
┌───────────┐
│ cancelled │
└───────────┘
```

### TypeScript Interface

```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Zod Schema

```typescript
const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  status: z.enum(['pending', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().datetime().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

---

## Entity: ReasoningStep

Records one iteration of the reasoning agent's thought process for debugging and learning.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier |
| `sessionId` | string (UUID) | Yes | Groups steps from one reasoning session |
| `stepNumber` | number | Yes | Order of this step in the session (1-based) |
| `phase` | enum | Yes | `observe`, `think`, `plan`, `act`, `reflect` |
| `input` | string | Yes | What was input to this phase |
| `output` | string | Yes | What this phase produced |
| `durationMs` | number | Yes | How long this phase took |
| `createdAt` | ISO 8601 string | Yes | When this step occurred |

### TypeScript Interface

```typescript
interface ReasoningStep {
  id: string;
  sessionId: string;
  stepNumber: number;
  phase: 'observe' | 'think' | 'plan' | 'act' | 'reflect';
  input: string;
  output: string;
  durationMs: number;
  createdAt: string;
}
```

---

## Entity: Notification

Records events for task-related notifications.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier |
| `type` | enum | Yes | `task_created`, `task_updated`, `task_completed`, `task_overdue` |
| `taskId` | string (UUID) | Yes | Related task |
| `message` | string | Yes | Human-readable notification message |
| `read` | boolean | Yes | Whether notification has been viewed |
| `createdAt` | ISO 8601 string | Yes | When notification was created |

### TypeScript Interface

```typescript
interface Notification {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_overdue';
  taskId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

---

## Entity: AgentInfo

Metadata about available agents (stored in memory, not database).

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique agent identifier (e.g., `task-agent`) |
| `displayName` | string | Yes | Human-readable name |
| `description` | string | Yes | What this agent does |
| `capabilities` | string[] | Yes | List of actions this agent can perform |
| `status` | enum | Yes | `active`, `inactive`, `error` |

### TypeScript Interface

```typescript
interface AgentInfo {
  name: string;
  displayName: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'error';
}
```

---

## Database Schema (SQLite)

### SQL DDL

```sql
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Reasoning steps table
CREATE TABLE IF NOT EXISTS reasoning_steps (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  phase TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_reasoning_session ON reasoning_steps(session_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  task_id TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_task ON notifications(task_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## Relationships

```
┌──────────────┐
│    Task      │
│              │
│ id (PK)      │◀─────────────┐
│ title        │              │
│ status       │              │
│ ...          │              │
└──────────────┘              │
                              │
┌──────────────┐              │
│ Notification │              │
│              │              │
│ id (PK)      │              │
│ task_id (FK) │──────────────┘
│ type         │
│ ...          │
└──────────────┘

┌────────────────┐
│ ReasoningStep  │
│                │
│ id (PK)        │
│ session_id     │──────┐ (groups steps
│ step_number    │      │  by session)
│ phase          │      │
│ ...            │◀─────┘
└────────────────┘
```

---

## Validation Rules

### Task Validation

1. `title` must not be empty and must be ≤200 characters
2. `description` if provided must be ≤2000 characters
3. `status` must be one of the valid enum values
4. `priority` must be one of the valid enum values
5. `dueDate` if provided must be valid ISO 8601 format
6. `tags` must be an array of strings, each tag ≤50 characters

### Status Transition Rules

| From | Allowed To |
|------|------------|
| `pending` | `in_progress`, `cancelled` |
| `in_progress` | `done`, `pending`, `cancelled` |
| `done` | `pending` (reopen) |
| `cancelled` | `pending` (reopen) |

---

**Document Author**: Spec Kit Demo Team  
**Last Updated**: 2025-12-30
