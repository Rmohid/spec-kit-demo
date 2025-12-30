# Tasks: TaskFlow Core

**Input**: Design documents from `/specs/001-taskflow-core/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅

---

## Task Format

```
[ID] [P?] [Story] Description
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4 = User Stories from spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure  
**Blocks**: All subsequent phases

- [ ] T001 Initialize git repository with main branch
- [ ] T002 [P] Run `npm install` to install all dependencies
- [ ] T003 [P] Configure ESLint for TypeScript (`eslint.config.js`)
- [ ] T004 [P] Configure Prettier (`.prettierrc`)
- [ ] T005 [P] Create data directory for SQLite database
- [ ] T006 Verify TypeScript compilation with `npm run build`

**Checkpoint**: `npm install && npm run build && npm test` runs without errors

---

## Phase 2: Foundational Libraries

**Purpose**: Core infrastructure required by all agents  
**Blocks**: All agent implementation

- [ ] T007 [P] Create TypeScript types in `src/lib/types.ts`
- [ ] T008 [P] Create configuration module in `src/lib/config.ts`
- [ ] T009 [P] Create logger module in `src/lib/logger.ts`
- [ ] T010 Create Zod validators in `src/lib/validators.ts`
- [ ] T011 Create storage layer in `src/lib/storage.ts` (SQLite initialization, schema)
- [ ] T012 Create base agent abstract class in `src/agents/base-agent.ts`

**Checkpoint**: Libraries importable, `npm run typecheck` passes

---

## Phase 3: User Story 1 - Basic Task Management (Priority: P1) 🎯 MVP

**Goal**: Create, view, update, and delete tasks from CLI  
**Independent Test**: Run CLI commands to create, list, update, delete tasks

### Tests First (Article III Compliance) ⚠️

> Write these tests FIRST. Verify they FAIL before implementation.

- [ ] T013 [P] [US1] Contract test: `tests/contract/task-agent.test.ts`
- [ ] T014 [P] [US1] Integration test: `tests/integration/task-commands.test.ts`

### Implementation

- [ ] T015 [US1] Implement Task Agent in `src/agents/task-agent/index.ts`
  - create, get, update, delete, list methods
  - Input validation using Zod schemas
  - SQLite CRUD operations
- [ ] T016 [US1] Implement task CLI commands in `src/cli/commands/task.ts`
  - `task create <title>` with options
  - `task list` with filters
  - `task get <id>`
  - `task update <id>` with options
  - `task delete <id>`
- [ ] T017 [US1] Wire up CLI entry point in `src/cli/index.ts`
  - Commander.js setup
  - Global options (--json, --verbose)
  - Help text
- [ ] T018 [US1] Add JSON output formatting
- [ ] T019 [US1] Add human-readable table output for lists
- [ ] T020 [US1] Implement error handling and user-friendly messages

**Checkpoint**: All US1 acceptance scenarios pass
```bash
taskflow task create "Test"
taskflow task list
taskflow task update <id> --status done
taskflow task delete <id>
```

---

## Phase 4: User Story 2 - Agent-Based Operations (Priority: P2)

**Goal**: Interact with specialized agents, demonstrate modular architecture  
**Independent Test**: Invoke agents directly via CLI

### Tests First ⚠️

- [ ] T021 [P] [US2] Contract test: `tests/contract/coordinator.test.ts`
- [ ] T022 [P] [US2] Integration test: `tests/integration/agent-commands.test.ts`

### Implementation

- [ ] T023 [US2] Create agent registry in `src/agents/registry.ts`
  - Register available agents
  - Agent discovery mechanism
- [ ] T024 [US2] Implement Coordinator Agent in `src/agents/coordinator/index.ts`
  - Request routing to appropriate agent
  - Response aggregation
  - Error handling and fallbacks
- [ ] T025 [US2] Implement agent CLI commands in `src/cli/commands/agent.ts`
  - `agent list` - show all agents
  - `agent status <name>` - get agent details
  - `agent invoke <name> --action --params` - direct invocation
- [ ] T026 [US2] Update Task Agent to register with Coordinator
- [ ] T027 [US2] Add agent metadata (capabilities, description)

**Checkpoint**: US2 acceptance scenarios pass
```bash
taskflow agent list
taskflow agent status task-agent
taskflow agent invoke task-agent --action create --params '{"title":"Test"}'
```

---

## Phase 5: User Story 3 - Autonomous Reasoning Agent (Priority: P3) ⭐

**Goal**: Analyze tasks and provide intelligent recommendations  
**Independent Test**: Give reasoning agent a goal, observe reasoning steps

### Tests First ⚠️

- [ ] T028 [P] [US3] Contract test: `tests/contract/reasoning-agent.test.ts`
- [ ] T029 [P] [US3] Integration test: `tests/integration/reasoning-flow.test.ts`
- [ ] T030 [P] [US3] Unit test for reasoning engine: `tests/unit/reasoning-engine.test.ts`

### Implementation

- [ ] T031 [US3] Implement Memory Manager in `src/agents/reasoning-agent/memory-manager.ts`
  - Short-term context (current session)
  - Store/retrieve reasoning steps in SQLite
- [ ] T032 [US3] Implement Tool Executor in `src/agents/reasoning-agent/tool-executor.ts`
  - `query_tasks` - get tasks matching criteria
  - `analyze_priorities` - rank tasks by urgency
  - `find_overdue` - identify overdue tasks
  - `suggest_order` - recommend task execution order
- [ ] T033 [US3] Implement Reasoning Engine in `src/agents/reasoning-agent/reasoning-engine.ts`
  - Observe phase: gather context
  - Think phase: analyze and form hypotheses
  - Plan phase: create action sequence
  - Act phase: execute tools
  - Reflect phase: evaluate results
  - Loop control with max iterations
  - Timeout handling
- [ ] T034 [US3] Implement Reasoning Agent in `src/agents/reasoning-agent/index.ts`
  - Wire up engine, tools, memory
  - Process user goals
  - Format results
- [ ] T035 [US3] Implement reason CLI command in `src/cli/commands/reason.ts`
  - `reason <goal>` - invoke reasoning agent
  - `--max-iterations` option
  - `--show-steps` for detailed output
- [ ] T036 [US3] Create README for reasoning agent in `src/agents/reasoning-agent/README.md`
  - Architecture explanation
  - Example usage
  - Extension guide

**Checkpoint**: US3 acceptance scenarios pass
```bash
taskflow reason "What should I work on next?"
taskflow reason "Organize my overdue tasks" --show-steps
```

---

## Phase 6: User Story 4 - Notification Agent (Priority: P4)

**Goal**: Log and display task event notifications  
**Independent Test**: Trigger task events, verify notifications generated

### Tests First ⚠️

- [ ] T037 [P] [US4] Contract test: `tests/contract/notification-agent.test.ts`
- [ ] T038 [P] [US4] Integration test: `tests/integration/notification-flow.test.ts`

### Implementation

- [ ] T039 [US4] Implement Notification Agent in `src/agents/notification-agent/index.ts`
  - Create notification for task events
  - List notifications
  - Mark as read
- [ ] T040 [US4] Implement notification CLI commands in `src/cli/commands/notifications.ts`
  - `notifications list` with filters
  - `notifications clear`
- [ ] T041 [US4] Wire up notifications to Task Agent
  - Emit events on task create/update/complete
- [ ] T042 [US4] Add overdue task detection

**Checkpoint**: US4 acceptance scenarios pass
```bash
taskflow task create "Test notification"
taskflow notifications list
taskflow notifications clear
```

---

## Phase 7: Polish & Integration

**Purpose**: Cross-cutting concerns and final integration

- [ ] T043 [P] Comprehensive error handling review
- [ ] T044 [P] Input validation edge cases
- [ ] T045 End-to-end integration testing
- [ ] T046 [P] Performance validation (<500ms for CRUD, <30s for reasoning)
- [ ] T047 [P] Code cleanup and linting fixes
- [ ] T048 Add --version and --help to all commands

**Checkpoint**: All tests pass, quickstart.md scenarios work

---

## Phase 8: Documentation

**Purpose**: Complete documentation for learning purposes

- [ ] T049 [P] Write comprehensive README.md
- [ ] T050 [P] Write LEARNING-GUIDE.md (SDD tutorial)
- [ ] T051 [P] Write `docs/01-what-is-sdd.md`
- [ ] T052 [P] Write `docs/02-spec-kit-setup.md`
- [ ] T053 [P] Write `docs/03-writing-specifications.md`
- [ ] T054 [P] Write `docs/04-creating-plans.md`
- [ ] T055 [P] Write `docs/05-task-breakdown.md`
- [ ] T056 [P] Write `docs/06-implementation.md`
- [ ] T057 [P] Write `docs/07-agents-explained.md`
- [ ] T058 [P] Write `docs/08-reasoning-agent.md` (deep dive)
- [ ] T059 [P] Write `docs/09-deployment.md`
- [ ] T060 Add inline code comments for complex logic

**Checkpoint**: Documentation complete, newcomer can follow guides

---

## Phase 9: Deployment

**Purpose**: Production-ready packaging

- [ ] T061 [P] Create Dockerfile
- [ ] T062 [P] Create docker-compose.yml
- [ ] T063 Write deployment section in docs
- [ ] T064 Final validation in Docker container
- [ ] T065 Tag v1.0.0 release

**Checkpoint**: `docker-compose up` produces working application

---

## Dependencies & Execution Order

### Phase Dependencies
```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation)
    │
    ▼
Phase 3 (US1 - Tasks) ─────────────────────────────────┐
    │                                                   │
    ▼                                                   │
Phase 4 (US2 - Agents) ◀────────────────────────────────┤
    │                                                   │
    ├────────────────────────┐                         │
    ▼                        ▼                         │
Phase 5 (US3 - Reasoning)  Phase 6 (US4 - Notifications)
    │                        │
    └────────────┬───────────┘
                 │
                 ▼
          Phase 7 (Polish)
                 │
                 ▼
          Phase 8 (Docs)
                 │
                 ▼
          Phase 9 (Deploy)
```

### Task Priorities

**Critical Path** (must be sequential):
1. T001-T006 (Setup)
2. T007-T012 (Foundation)
3. T015-T020 (US1 - core functionality)
4. T023-T027 (US2 - agent infrastructure)
5. T031-T036 (US3 - reasoning agent)

**Parallel Opportunities**:
- All test tasks marked [P] can run in parallel within their phase
- Documentation tasks (T049-T060) can all run in parallel
- Docker tasks (T061-T062) can run in parallel

---

## Test-First Reminder (Article III)

For EVERY implementation task:
```
1. Write the test (contract or integration)
2. Run it → MUST FAIL (red)
3. Implement the minimum code to pass
4. Run test → MUST PASS (green)
5. Refactor if needed
6. Commit with descriptive message
```

---

## Progress Tracking

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 1: Setup | ⬜ Not Started | - |
| Phase 2: Foundation | ⬜ Not Started | - |
| Phase 3: User Story 1 (Tasks) | ⬜ Not Started | - |
| Phase 4: User Story 2 (Agents) | ⬜ Not Started | - |
| Phase 5: User Story 3 (Reasoning) | ⬜ Not Started | - |
| Phase 6: User Story 4 (Notifications) | ⬜ Not Started | - |
| Phase 7: Polish | ⬜ Not Started | - |
| Phase 8: Documentation | ⬜ Not Started | - |
| Phase 9: Deployment | ⬜ Not Started | - |

---

**Generated**: 2025-12-30  
**Based on**: spec.md, plan.md, data-model.md, contracts/api-spec.json
