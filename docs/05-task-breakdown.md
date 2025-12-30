# Task Breakdown

> Converting plans into executable, ordered tasks

## Why Task Breakdown Matters

The task breakdown transforms a plan into actionable steps that:
- Follow dependencies correctly
- Enable parallel work where possible
- Enforce test-first development
- Track progress clearly

## Task Format

Each task follows this format:

```
[ID] [P?] [Story] Description
```

- **ID**: Unique identifier (T001, T002, etc.)
- **[P]**: Can run in parallel (no dependencies)
- **[Story]**: Which user story (US1, US2, etc.)

Example:
```markdown
- [ ] T015 [P] [US1] Create Task model in `src/models/task.ts`
- [ ] T016 [US1] Implement TaskService in `src/services/task.ts`
```

## Phase Structure

Organize tasks into phases:

```markdown
## Phase 1: Setup
Purpose: Project initialization
Blocks: All subsequent phases

## Phase 2: Foundation
Purpose: Core infrastructure
Blocks: Feature implementation

## Phase 3: User Story 1 (P1)
Purpose: MVP functionality
Independent Test: [from spec]

## Phase 4: User Story 2 (P2)
...
```

## Test-First Task Ordering

For each user story, ALWAYS write tests first:

```markdown
## Phase 3: User Story 1 - Task Management (P1)

### Tests First ⚠️

> Write these tests FIRST. Verify they FAIL before implementation.

- [ ] T010 [P] [US1] Contract test: `tests/contract/task-service.test.ts`
- [ ] T011 [P] [US1] Integration test: `tests/integration/task-commands.test.ts`

### Implementation

- [ ] T012 [US1] Implement TaskService in `src/services/task.ts`
- [ ] T013 [US1] Add CLI commands in `src/cli/commands/task.ts`
- [ ] T014 [US1] Wire up in `src/cli/index.ts`

**Checkpoint**: Run tests - they should now PASS
```

## Identifying Dependencies

Tasks have dependencies when:
1. One task needs output from another
2. One task modifies files another needs
3. One task requires setup from another

```markdown
## Dependencies

T012 depends on T010 (test must exist first)
T013 depends on T012 (service must exist)
T014 depends on T013 (commands must exist)
```

Visualize with a dependency graph:

```
T010 (test) ──┐
              ├──▶ T012 (service) ──▶ T013 (CLI) ──▶ T014 (wire up)
T011 (test) ──┘
```

## Parallel Task Identification

Tasks can run in parallel when they:
- Work on different files
- Have no shared dependencies
- Don't modify shared state

```markdown
## Parallel Opportunities

Within Phase 2:
- [ ] T006 [P] Create logger in `src/lib/logger.ts`
- [ ] T007 [P] Create storage in `src/lib/storage.ts`
- [ ] T008 [P] Create validators in `src/lib/validators.ts`

These can all run in parallel (different files, no dependencies).
```

## Checkpoints

Add checkpoints after each phase:

```markdown
**Checkpoint**: 
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] Manual verification of [specific feature]
```

## Complete Task Example

```markdown
# Tasks: Task Management Feature

## Phase 1: Setup

- [ ] T001 Initialize npm project with `npm init`
- [ ] T002 [P] Configure TypeScript (`tsconfig.json`)
- [ ] T003 [P] Configure Jest (`jest.config.js`)
- [ ] T004 [P] Configure ESLint (`eslint.config.js`)
- [ ] T005 Create directory structure

**Checkpoint**: `npm install && npm run build` works

---

## Phase 2: Foundation

- [ ] T006 [P] Create logger in `src/lib/logger.ts`
- [ ] T007 [P] Create storage in `src/lib/storage.ts`
- [ ] T008 Create base service in `src/lib/base-service.ts`

**Checkpoint**: Libraries importable, basic tests pass

---

## Phase 3: User Story 1 - Create Tasks (P1) 🎯

**Goal**: Users can create and list tasks
**Independent Test**: `taskflow task create "Test"` works

### Tests First ⚠️

- [ ] T009 [P] [US1] Contract test: `tests/contract/task-service.test.ts`
- [ ] T010 [P] [US1] Integration test: `tests/integration/task-commands.test.ts`

### Implementation

- [ ] T011 [US1] Implement TaskService
- [ ] T012 [US1] Add `task create` command
- [ ] T013 [US1] Add `task list` command
- [ ] T014 [US1] Wire up CLI

**Checkpoint**: US1 acceptance scenarios pass
```

## Estimating Effort

While SDD doesn't require story points, you can add estimates:

```markdown
- [ ] T011 [US1] Implement TaskService (~2 hours)
- [ ] T012 [US1] Add CLI commands (~1 hour)
```

## Progress Tracking

Use a progress table:

```markdown
## Progress

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Setup | ✅ Complete | 2025-01-01 |
| Phase 2: Foundation | 🔄 In Progress | - |
| Phase 3: User Story 1 | ⬜ Not Started | - |
```

## Common Mistakes

### ❌ Implementation Before Tests

```markdown
# Bad
- [ ] T010 Implement TaskService
- [ ] T011 Write tests for TaskService

# Good
- [ ] T010 Write tests for TaskService
- [ ] T011 Implement TaskService (tests should now pass)
```

### ❌ No Parallel Markers

```markdown
# Bad
- [ ] T006 Create logger
- [ ] T007 Create storage
- [ ] T008 Create validators

# Good
- [ ] T006 [P] Create logger
- [ ] T007 [P] Create storage
- [ ] T008 [P] Create validators
```

### ❌ Vague Descriptions

```markdown
# Bad
- [ ] T010 Setup database

# Good
- [ ] T010 Create SQLite schema in `src/lib/storage.ts` with tasks table
```

## Task Breakdown Checklist

- [ ] All tasks have unique IDs
- [ ] Parallel tasks marked with [P]
- [ ] User story references included
- [ ] File paths specified
- [ ] Tests come before implementation
- [ ] Checkpoints after each phase
- [ ] Dependencies documented

## Execution Tips

### For Solo Developers
1. Work through phases sequentially
2. Complete all tests before implementation
3. Each checkpoint is a potential commit

### For Teams
1. Complete Phase 1-2 together
2. Assign different user stories to different developers
3. Merge at Phase N (Polish)
4. Use [P] markers to identify parallelizable work

## Next Steps

- [Implementation](06-implementation.md) - TDD workflow
- [Agents Explained](07-agents-explained.md) - Agent architecture

---

**Remember**: The task list is your roadmap. Each task should be small enough to complete in one sitting and clear enough that you know when it's done.
