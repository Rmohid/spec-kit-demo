# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`  
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

---

## Task Format

```
[ID] [P?] [Story] Description
```

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Path Conventions

Based on project structure in `plan.md`:
- **Source code**: `src/`
- **Tests**: `tests/`
- **Agents**: `src/agents/[agent-name]/`
- **Libraries**: `src/lib/`
- **CLI**: `src/cli/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure  
**Blocks**: All subsequent phases

- [ ] T001 Initialize Node.js project with package.json
- [ ] T002 [P] Configure ESLint and Prettier
- [ ] T003 [P] Configure Jest for testing
- [ ] T004 [P] Create base directory structure
- [ ] T005 Setup environment configuration (.env handling)

**Checkpoint**: `npm install` and `npm test` run without errors

---

## Phase 2: Foundational Libraries

**Purpose**: Core infrastructure required by all agents  
**Blocks**: All agent implementation

- [ ] T006 [P] Create logger utility in `src/lib/logger.js`
- [ ] T007 [P] Create storage interface in `src/lib/storage.js`
- [ ] T008 Create base agent class in `src/lib/base-agent.js`
- [ ] T009 [P] Create validation utilities in `src/lib/validators.js`

**Checkpoint**: Libraries importable and basic tests pass

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [From spec - what this delivers]  
**Independent Test**: [From spec - how to verify]

### Tests First (Article III Compliance) ⚠️

> Write these tests FIRST. Verify they FAIL before implementation.

- [ ] T010 [P] [US1] Contract test: `tests/contract/[component].test.js`
- [ ] T011 [P] [US1] Integration test: `tests/integration/[feature].test.js`

### Implementation

- [ ] T012 [P] [US1] Create data model: `src/lib/models/[entity].js`
- [ ] T013 [US1] Implement service: `src/lib/[service].js`
- [ ] T014 [US1] Implement agent: `src/agents/[agent]/index.js`
- [ ] T015 [US1] Add CLI command: `src/cli/commands/[command].js`
- [ ] T016 [US1] Wire up in CLI: `src/cli/index.js`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [From spec]  
**Independent Test**: [From spec]

### Tests First ⚠️

- [ ] T017 [P] [US2] Contract test: `tests/contract/[component].test.js`
- [ ] T018 [P] [US2] Integration test: `tests/integration/[feature].test.js`

### Implementation

- [ ] T019 [P] [US2] Create/extend model: `src/lib/models/[entity].js`
- [ ] T020 [US2] Implement service: `src/lib/[service].js`
- [ ] T021 [US2] Implement agent: `src/agents/[agent]/index.js`
- [ ] T022 [US2] Add CLI command: `src/cli/commands/[command].js`

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [From spec]  
**Independent Test**: [From spec]

### Tests First ⚠️

- [ ] T023 [P] [US3] Contract test: `tests/contract/[component].test.js`
- [ ] T024 [P] [US3] Integration test: `tests/integration/[feature].test.js`

### Implementation

- [ ] T025 [P] [US3] Implement reasoning engine: `src/agents/reasoning-agent/reasoning-engine.js`
- [ ] T026 [US3] Implement tool executor: `src/agents/reasoning-agent/tool-executor.js`
- [ ] T027 [US3] Implement memory manager: `src/agents/reasoning-agent/memory-manager.js`
- [ ] T028 [US3] Wire up reasoning agent: `src/agents/reasoning-agent/index.js`
- [ ] T029 [US3] Add CLI command: `src/cli/commands/reason.js`

**Checkpoint**: All user stories functional

---

## Phase 6: Polish & Integration

**Purpose**: Cross-cutting concerns and final integration

- [ ] T030 [P] Add comprehensive error handling
- [ ] T031 [P] Add input validation across all commands
- [ ] T032 Coordinator agent integration
- [ ] T033 [P] End-to-end testing
- [ ] T034 [P] Performance validation

**Checkpoint**: All tests pass, performance targets met

---

## Phase 7: Documentation

**Purpose**: Complete documentation for learning purposes

- [ ] T035 [P] Write README.md
- [ ] T036 [P] Write LEARNING-GUIDE.md
- [ ] T037 [P] Document each agent in respective README files
- [ ] T038 [P] Complete `docs/` tutorials
- [ ] T039 [P] Add inline code comments for complex logic
- [ ] T040 Validate quickstart.md scenarios

**Checkpoint**: Documentation complete and tested

---

## Phase 8: Deployment

**Purpose**: Production-ready packaging

- [ ] T041 [P] Create Dockerfile
- [ ] T042 [P] Create docker-compose.yml
- [ ] T043 Write deployment documentation
- [ ] T044 Final validation in container

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
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Phase 3 (US1)  Phase 4 (US2)  Phase 5 (US3)
    │              │              │
    └──────────────┴──────────────┘
                   │
                   ▼
            Phase 6 (Polish)
                   │
                   ▼
            Phase 7 (Docs)
                   │
                   ▼
            Phase 8 (Deploy)
```

### Parallel Opportunities

1. **Within Phase 1**: T002, T003, T004 can run in parallel
2. **Within Phase 2**: T006, T007, T009 can run in parallel
3. **After Phase 2**: User Stories can be developed in parallel
4. **Within each User Story**: Tests can be written in parallel
5. **Phase 7**: All documentation tasks can run in parallel
6. **Phase 8**: Dockerfile and docker-compose can run in parallel

---

## Execution Notes

### For Single Developer
1. Complete Phase 1 → Phase 2 sequentially
2. Complete User Stories in priority order (P1 → P2 → P3)
3. Each story is a potential release point

### For Team
1. Complete Phase 1 → Phase 2 together
2. Assign different User Stories to different developers
3. Merge at Phase 6

### Test-First Reminder (Article III)
```
For EVERY implementation task:
1. Write the test
2. Run it → MUST FAIL
3. Implement the code
4. Run test → MUST PASS
5. Refactor if needed
6. Commit
```

---

## Progress Tracking

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| Phase 1: Setup | ⬜ Not Started | - |
| Phase 2: Foundation | ⬜ Not Started | - |
| Phase 3: User Story 1 | ⬜ Not Started | - |
| Phase 4: User Story 2 | ⬜ Not Started | - |
| Phase 5: User Story 3 | ⬜ Not Started | - |
| Phase 6: Polish | ⬜ Not Started | - |
| Phase 7: Documentation | ⬜ Not Started | - |
| Phase 8: Deployment | ⬜ Not Started | - |

---

**Generated**: [DATE]  
**Based on**: spec.md, plan.md, data-model.md
