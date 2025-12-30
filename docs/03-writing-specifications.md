# Writing Specifications

> The art of defining WHAT and WHY before HOW

## The Golden Rule

**Specifications describe WHAT you want to build and WHY it matters.**

They should NEVER describe HOW to build it. Technical decisions belong in the plan.

## Specification Structure

Every specification follows this structure:

```markdown
# Feature Specification: [Name]

## Overview
Brief description (2-3 sentences)

## User Stories (Prioritized)
Who needs what and why

## Acceptance Scenarios
Given/When/Then format

## Requirements
Functional and Non-Functional

## Success Criteria
Measurable outcomes

## Out of Scope
What this feature does NOT include
```

## Writing User Stories

### Priority-Based Ordering

User stories should be ordered by priority (P1, P2, P3). Each story should be independently valuable:

```markdown
### User Story 1 - Create Tasks (Priority: P1)

As a user, I want to create tasks so that I can track my work.

**Why this priority**: This is the core capability without which 
the application has no value.

**Independent Test**: Can create a task and see it in the list.
```

### The "Independent Test" Principle

Each user story should be testable on its own. Ask yourself:
- "If I only implement this story, does the user get value?"
- "Can I demonstrate this feature in isolation?"

## Writing Acceptance Scenarios

Use the Given/When/Then format:

```markdown
**Acceptance Scenarios**:

1. **Given** no tasks exist,
   **When** I create a task with title "Buy groceries",
   **Then** a new task is created with status "pending"

2. **Given** a task exists,
   **When** I mark it as complete,
   **Then** the status changes to "done"
```

### Tips for Good Scenarios

| Do | Don't |
|----|-------|
| Be specific: "title 'Buy groceries'" | Be vague: "a title" |
| Test one thing per scenario | Combine multiple behaviors |
| Include error cases | Only test happy paths |
| Use real-world examples | Use "foo" and "bar" |

## Edge Cases

Always document edge cases explicitly:

```markdown
### Edge Cases

- What happens when title is empty? → Validation error
- What happens when database is unavailable? → Graceful error message
- What happens with very long titles? → Truncate at 200 characters
```

## Requirements

### Functional Requirements

Use RFC 2119 language (MUST, SHOULD, MAY):

```markdown
### Functional Requirements

- **FR-001**: System MUST allow creating tasks with a title
- **FR-002**: System MUST persist tasks to storage
- **FR-003**: System SHOULD support task priorities
- **FR-004**: System MAY support task attachments (future)
```

### Non-Functional Requirements

```markdown
### Non-Functional Requirements

- **NFR-001**: API response time MUST be under 200ms
- **NFR-002**: System MUST handle 100 concurrent users
- **NFR-003**: Data MUST be encrypted at rest
```

## Success Criteria

Make them measurable:

```markdown
### Success Criteria

- **SC-001**: User can create, view, update, delete tasks (CRUD complete)
- **SC-002**: All acceptance scenarios pass automated tests
- **SC-003**: Response time under 200ms for all operations
- **SC-004**: Test coverage exceeds 80%
```

## Out of Scope

Be explicit about what you're NOT building:

```markdown
## Out of Scope

- User authentication (single-user for now)
- Cloud sync (local storage only)
- Mobile app (CLI only)
- Real-time notifications (polling only)
```

## Common Mistakes

### ❌ Including Implementation Details

```markdown
# Bad
The system will use PostgreSQL to store tasks in a tasks table
with columns id, title, status...
```

```markdown
# Good
The system MUST persist tasks with their title, status, and timestamps.
```

### ❌ Vague Requirements

```markdown
# Bad
The system should be fast and user-friendly.
```

```markdown
# Good
Response time MUST be under 200ms for all CRUD operations.
Users MUST receive confirmation after each action.
```

### ❌ Missing Priorities

```markdown
# Bad
User Story 1 - Create Tasks
User Story 2 - Delete Tasks
User Story 3 - Search Tasks
```

```markdown
# Good
User Story 1 - Create Tasks (Priority: P1)
User Story 2 - List Tasks (Priority: P1)
User Story 3 - Delete Tasks (Priority: P2)
User Story 4 - Search Tasks (Priority: P3)
```

## Handling Uncertainty

When something is unclear, mark it explicitly:

```markdown
- **FR-005**: System MUST support task categories 
  [NEEDS CLARIFICATION: How many categories? User-defined or preset?]
```

Resolve all `[NEEDS CLARIFICATION]` markers before moving to planning.

## Specification Review Checklist

Before considering a spec complete:

- [ ] All user stories have priorities
- [ ] All stories have acceptance scenarios
- [ ] No implementation details present
- [ ] Edge cases documented
- [ ] Success criteria are measurable
- [ ] Out of scope clearly defined
- [ ] No `[NEEDS CLARIFICATION]` markers remain

## Next Steps

- [Creating Plans](04-creating-plans.md) - Technical planning phase
- [Task Breakdown](05-task-breakdown.md) - Breaking plans into tasks

---

**Remember**: A good specification can be understood by both developers AND stakeholders. If your grandmother can't understand what you're building (at a high level), simplify it.
