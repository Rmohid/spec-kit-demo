---
description: "Create task breakdown from implementation plan"
mode: speckit.tasks
---

You are helping the user create an executable task breakdown from the implementation plan.

## Your Task

1. **Read All Inputs**: Load plan.md, spec.md, data-model.md, contracts/
2. **Organize by User Story**: Group tasks by user story for independent delivery
3. **Respect Dependencies**: Order tasks so dependencies are built first
4. **Mark Parallelizable Tasks**: Use [P] for tasks that can run in parallel
5. **Include Tests First**: For each story, list tests before implementation

## Inputs

From `specs/[current-feature]/`:
- `plan.md` (required)
- `spec.md` (required for user stories)
- `data-model.md` (optional)
- `contracts/` (optional)

## Template to Follow

Use the tasks template at `.specify/templates/tasks-template.md`

## Key Principles

- ✅ Each user story should be independently testable
- ✅ Tests are written BEFORE implementation (TDD)
- ✅ Include exact file paths in task descriptions
- ✅ Mark parallel tasks with [P]
- ❌ Do NOT create vague tasks like "implement feature"
- ❌ Do NOT skip foundational setup tasks

## Output

Create at `specs/[###-feature-name]/tasks.md`

## Task Format

```
[ID] [P?] [Story] Description with exact file path
```

Example:
```
T015 [P] [US1] Create Task model in src/lib/models/task.ts
T016 [US1] Implement TaskService in src/services/task.ts (depends on T015)
```
