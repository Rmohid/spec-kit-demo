# Quickstart Validation: TaskFlow Core

**Feature**: 001-taskflow-core  
**Purpose**: Key scenarios to validate the implementation works correctly

---

## Prerequisites

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Verify installation
taskflow --version
# Expected: 1.0.0
```

---

## Scenario 1: Basic Task CRUD (User Story 1)

### 1.1 Create a Task

```bash
# Create a simple task
taskflow task create "Buy groceries"

# Expected output:
# Task created: abc12345-... - Buy groceries

# Create task with all options
taskflow task create "Finish report" \
  --description "Q4 financial report" \
  --priority high \
  --due "2025-01-15T17:00:00Z" \
  --tags "work,finance"

# Verify with JSON output
taskflow task create "Test task" --json
# Expected: JSON object with id, title, status, etc.
```

### 1.2 List Tasks

```bash
# List all tasks
taskflow task list

# Expected: Table showing all tasks

# Filter by status
taskflow task list --status pending

# Get JSON output
taskflow task list --json
```

### 1.3 Update a Task

```bash
# Get a task ID first
TASK_ID=$(taskflow task list --json | jq -r '.[0].id')

# Update status
taskflow task update $TASK_ID --status in_progress

# Update multiple fields
taskflow task update $TASK_ID \
  --priority urgent \
  --due "2025-01-10T09:00:00Z"
```

### 1.4 Delete a Task

```bash
# Delete with confirmation
taskflow task delete $TASK_ID

# Force delete (no confirmation)
taskflow task delete $TASK_ID --force
```

### 1.5 Error Handling

```bash
# Invalid task ID
taskflow task get nonexistent-id
# Expected: Error message, exit code 1

# Invalid priority
taskflow task create "Test" --priority invalid
# Expected: Validation error
```

---

## Scenario 2: Agent Operations (User Story 2)

### 2.1 List Agents

```bash
taskflow agent list

# Expected output:
# NAME              STATUS    CAPABILITIES
# coordinator       active    route, aggregate
# task-agent        active    create, read, update, delete, list
# notification-agent active   notify, list
# reasoning-agent   active    reason, analyze
```

### 2.2 Check Agent Status

```bash
taskflow agent status task-agent

# Expected: Detailed agent information
```

### 2.3 Invoke Agent Directly

```bash
# Invoke task agent
taskflow agent invoke task-agent \
  --action create \
  --params '{"title": "Direct invoke test"}'

# Expected: Task created via direct agent invocation
```

---

## Scenario 3: Reasoning Agent (User Story 3)

### 3.1 Basic Reasoning

```bash
# Create some test tasks first
taskflow task create "Urgent deadline" --priority urgent --due "2025-01-02T09:00:00Z"
taskflow task create "Regular meeting" --priority medium
taskflow task create "Low priority cleanup" --priority low

# Ask for prioritization
taskflow reason "What should I work on next?"

# Expected: Reasoned recommendation with explanation
```

### 3.2 Show Reasoning Steps

```bash
taskflow reason "Organize my overdue tasks" --show-steps

# Expected: Detailed output showing:
# Step 1 (OBSERVE): Gathered 3 tasks...
# Step 2 (THINK): Analyzing priorities...
# Step 3 (PLAN): Will sort by urgency...
# Step 4 (ACT): Executing analysis...
# Step 5 (REFLECT): Recommendation ready...
```

### 3.3 JSON Output

```bash
taskflow reason "Analyze my task backlog" --json

# Expected: Full ReasoningResult JSON object
```

---

## Scenario 4: Notifications (User Story 4)

### 4.1 View Notifications

```bash
# After creating/updating tasks, check notifications
taskflow notifications list

# Expected: List of recent notifications

# Show only unread
taskflow notifications list --unread
```

### 4.2 Clear Notifications

```bash
taskflow notifications clear

# Expected: "Cleared X notifications"
```

---

## Scenario 5: JSON Mode (All Commands)

Verify all commands support JSON output:

```bash
# Tasks
taskflow task list --json
taskflow task create "JSON test" --json
taskflow task get $TASK_ID --json

# Agents
taskflow agent list --json
taskflow agent status task-agent --json

# Reasoning
taskflow reason "Test query" --json

# Notifications
taskflow notifications list --json
```

---

## Scenario 6: Error Scenarios

### 6.1 Validation Errors

```bash
# Empty title
taskflow task create ""
# Expected: Error - Title is required

# Invalid status transition
taskflow task update $TASK_ID --status invalid
# Expected: Error - Invalid status value
```

### 6.2 Not Found Errors

```bash
taskflow task get "nonexistent-uuid"
# Expected: Error - Task not found, exit code 1

taskflow agent status "fake-agent"
# Expected: Error - Agent not found
```

### 6.3 Reasoning Limits

```bash
# Test max iterations
taskflow reason "Complex analysis" --max-iterations 2 --show-steps
# Expected: Should stop after 2 iterations
```

---

## Validation Checklist

After running all scenarios, verify:

- [ ] All task CRUD operations work correctly
- [ ] Tasks are persisted (restart CLI and tasks are still there)
- [ ] JSON output is valid for all commands
- [ ] Errors are shown on stderr with exit code 1
- [ ] Agent list shows all 4 agents
- [ ] Reasoning agent produces logical output
- [ ] Reasoning steps are visible with --show-steps
- [ ] Notifications are generated for task events
- [ ] Help text is available (`taskflow --help`, `taskflow task --help`)

---

## Performance Validation

```bash
# Time a simple operation (should be <500ms)
time taskflow task list

# Time reasoning (should complete within 30s)
time taskflow reason "Analyze all tasks"
```

---

**Document Author**: Spec Kit Demo Team  
**Last Updated**: 2025-12-30
