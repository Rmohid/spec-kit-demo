# Implementation Plan: TaskFlow Core

**Branch**: `001-taskflow-core`  
**Date**: 2025-12-30  
**Spec**: [specs/001-taskflow-core/spec.md](./spec.md)  
**Status**: Approved

---

## Summary

Build a TypeScript/Node.js CLI application for task management featuring four specialized agents (Coordinator, Task, Notification, Reasoning). The Reasoning Agent implements a fully autonomous observe-think-plan-act-reflect loop. The architecture emphasizes testability, modularity, and educational value for teams learning Specification-Driven Development.

---

## Technical Context

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Language/Runtime** | TypeScript 5.x on Node.js 20 LTS | Type safety, modern features, wide adoption, excellent tooling |
| **CLI Framework** | Commander.js | Industry standard, excellent TypeScript support, subcommand support |
| **Storage** | better-sqlite3 | Synchronous API (simpler for CLI), fast, no server needed, single file |
| **Validation** | Zod | Runtime type validation, excellent TypeScript integration, composable schemas |
| **Testing Framework** | Jest with ts-jest | Mature, well-documented, good TypeScript support |
| **Logging** | Winston | Structured logging, multiple transports, log levels |
| **Target Platform** | Cross-platform CLI (Linux/macOS/Windows) | Maximum accessibility |

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| CLI Response Time | <500ms for CRUD ops | Jest timing assertions |
| Reasoning Timeout | 30 seconds max | Configurable timeout with graceful exit |
| Memory Usage | <100MB typical | Manual profiling during development |

### Constraints

- Must work completely offline (no external APIs)
- Single-user (no auth complexity)
- SQLite file-based storage (no database server)
- All output must support JSON format for piping/scripting

---

## Constitution Compliance Check

### Article I: Specification-First ✅
- [x] Specification exists and is approved (`spec.md`)
- [x] All requirements traced to spec (FR-001 through FR-010)

### Article II: CLI Interface ✅
- [x] All features accessible via CLI commands
- [x] JSON output supported via `--json` flag
- [x] Errors output to stderr, results to stdout

### Article III: Test-First ✅
- [x] Jest configured with >80% coverage threshold
- [x] Contract tests planned for each agent
- [x] Integration tests planned for CLI commands

### Article V: Simplicity ✅
- [x] Three top-level source directories: `agents/`, `lib/`, `cli/`
- [x] No speculative features (out of scope clearly defined)
- [x] Minimal dependencies, each justified

### Article VII: Error Handling ✅
- [x] Zod for input validation with helpful error messages
- [x] Try-catch with user-friendly error formatting
- [x] Exit codes: 0 success, 1 error

---

## Project Structure

### Documentation Structure
```
specs/001-taskflow-core/
├── spec.md              # Feature specification ✅
├── plan.md              # This file ✅
├── research.md          # Technical research
├── data-model.md        # Entity definitions
├── quickstart.md        # Validation scenarios
├── tasks.md             # Task breakdown
└── contracts/
    └── api-spec.json    # CLI interface contract
```

### Source Code Structure
```
src/
├── agents/                      # Agent implementations
│   ├── base-agent.ts            # Abstract base class for all agents
│   ├── coordinator/
│   │   └── index.ts             # Routes requests to appropriate agents
│   ├── task-agent/
│   │   └── index.ts             # CRUD operations for tasks
│   ├── notification-agent/
│   │   └── index.ts             # Event notifications
│   └── reasoning-agent/
│       ├── index.ts             # Main reasoning agent
│       ├── reasoning-engine.ts  # Observe-think-plan-act-reflect loop
│       ├── tool-executor.ts     # Executes tools/actions
│       └── memory-manager.ts    # Short-term and long-term memory
│
├── lib/                         # Shared libraries
│   ├── config.ts                # Environment configuration
│   ├── logger.ts                # Winston logger setup
│   ├── storage.ts               # SQLite database interface
│   ├── validators.ts            # Zod schemas for validation
│   └── types.ts                 # Shared TypeScript types
│
└── cli/                         # CLI entry points
    ├── index.ts                 # Main entry point
    └── commands/
        ├── task.ts              # Task CRUD commands
        ├── agent.ts             # Agent management commands
        ├── reason.ts            # Reasoning agent invocation
        └── notifications.ts     # Notification commands

tests/
├── contract/                    # Contract tests (agent interfaces)
│   ├── task-agent.test.ts
│   ├── coordinator.test.ts
│   └── reasoning-agent.test.ts
├── integration/                 # Integration tests (full flows)
│   ├── task-commands.test.ts
│   └── reasoning-flow.test.ts
└── unit/                        # Unit tests (isolated logic)
    ├── validators.test.ts
    └── reasoning-engine.test.ts
```

---

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            CLI Layer                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────────────────┐  │
│  │  task   │ │  agent  │ │ reason  │ │    notifications      │  │
│  │ command │ │ command │ │ command │ │       command         │  │
│  └────┬────┘ └────┬────┘ └────┬────┘ └───────────┬───────────┘  │
└───────┼──────────┼──────────┼───────────────────┼───────────────┘
        │          │          │                   │
        └──────────┴──────────┴───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Coordinator Agent                            │
│  - Receives all requests                                         │
│  - Routes to appropriate specialized agent                       │
│  - Aggregates responses                                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────────────┐
│  Task Agent   │    │ Notification  │    │   Reasoning Agent     │
│               │    │    Agent      │    │                       │
│ - Create      │    │               │    │ ┌───────────────────┐ │
│ - Read        │    │ - Log events  │    │ │ Reasoning Engine  │ │
│ - Update      │    │ - Track       │    │ │                   │ │
│ - Delete      │    │   notifications│   │ │ 1. Observe        │ │
│ - List        │    │               │    │ │ 2. Think          │ │
│ - Search      │    │               │    │ │ 3. Plan           │ │
└───────┬───────┘    └───────────────┘    │ │ 4. Act            │ │
        │                                  │ │ 5. Reflect        │ │
        │                                  │ └─────────┬─────────┘ │
        │                                  │           │           │
        │                                  │ ┌─────────▼─────────┐ │
        │                                  │ │  Tool Executor    │ │
        │                                  │ │  - Query tasks    │ │
        │                                  │ │  - Analyze data   │ │
        │                                  │ │  - Update tasks   │ │
        │                                  │ └───────────────────┘ │
        │                                  │                       │
        │                                  │ ┌───────────────────┐ │
        │                                  │ │  Memory Manager   │ │
        │                                  │ │  - Context        │ │
        │                                  │ │  - History        │ │
        │                                  │ └───────────────────┘ │
        │                                  └───────────┬───────────┘
        │                                              │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Storage (SQLite)  │
                    │                     │
                    │ - tasks             │
                    │ - reasoning_steps   │
                    │ - notifications     │
                    └─────────────────────┘
```

### Data Flow

1. **User invokes CLI** → `taskflow task create "Buy groceries"`
2. **CLI parses command** → Extracts action and arguments
3. **Request to Coordinator** → `{ agent: "task", action: "create", params: {...} }`
4. **Coordinator routes** → Identifies Task Agent as handler
5. **Task Agent executes** → Validates input, creates task in SQLite
6. **Notification Agent notified** → Logs task creation event
7. **Response aggregated** → Coordinator collects results
8. **CLI outputs** → Formats as JSON or human-readable text

### Reasoning Agent Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REASONING LOOP                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ OBSERVE │───▶│  THINK  │───▶│  PLAN   │───▶│   ACT   │       │
│  │         │    │         │    │         │    │         │       │
│  │ Gather  │    │ Analyze │    │ Create  │    │ Execute │       │
│  │ context │    │ & reason│    │ action  │    │ tools   │       │
│  └─────────┘    └─────────┘    │ steps   │    └────┬────┘       │
│       ▲                        └─────────┘         │            │
│       │                                            ▼            │
│       │         ┌─────────┐                  ┌─────────┐        │
│       │         │ REFLECT │◀─────────────────│ RESULT  │        │
│       │         │         │                  │         │        │
│       │         │ Evaluate│                  │ Action  │        │
│       │         │ outcome │                  │ output  │        │
│       │         └────┬────┘                  └─────────┘        │
│       │              │                                          │
│       │              ▼                                          │
│       │    ┌──────────────────┐                                 │
│       │    │  Goal achieved?  │                                 │
│       │    └────────┬─────────┘                                 │
│       │             │                                           │
│       │      No     │     Yes                                   │
│       └─────────────┘      │                                    │
│                            ▼                                    │
│                     ┌─────────────┐                             │
│                     │   OUTPUT    │                             │
│                     │ Final result│                             │
│                     └─────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 0: Research
- [x] Evaluate CLI frameworks (Commander.js selected)
- [x] Evaluate SQLite libraries (better-sqlite3 selected)
- [x] Research reasoning agent patterns (ReAct pattern)
- [ ] Document findings in `research.md`

### Phase 1: Foundation
- [ ] Initialize TypeScript project
- [ ] Install and configure dependencies
- [ ] Setup Jest with TypeScript
- [ ] Create base directory structure
- [ ] Implement configuration management

### Phase 2: Core Libraries
- [ ] Implement logger (Winston)
- [ ] Implement storage layer (SQLite)
- [ ] Define TypeScript types and interfaces
- [ ] Implement Zod validators
- [ ] Create base agent class

### Phase 3: Task Agent (US1)
- [ ] Implement Task Agent
- [ ] Create, Read, Update, Delete operations
- [ ] Task listing and filtering
- [ ] Contract tests

### Phase 4: Coordinator & Agent Infrastructure (US2)
- [ ] Implement Coordinator Agent
- [ ] Agent registration and discovery
- [ ] Request routing logic
- [ ] Agent CLI commands

### Phase 5: Reasoning Agent (US3)
- [ ] Implement Reasoning Engine
- [ ] Implement Tool Executor
- [ ] Implement Memory Manager
- [ ] Wire up Reasoning Agent
- [ ] Add `reason` CLI command

### Phase 6: Notification Agent (US4)
- [ ] Implement Notification Agent
- [ ] Event logging
- [ ] Notification listing command

### Phase 7: CLI Polish
- [ ] Error handling and formatting
- [ ] JSON output mode
- [ ] Help text and documentation
- [ ] End-to-end testing

### Phase 8: Documentation & Deployment
- [ ] Complete learning guides
- [ ] Docker configuration
- [ ] README and quickstart

---

## Dependencies

### External Dependencies

| Package | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| commander | ^12.1.0 | CLI framework | Industry standard, excellent TS support |
| better-sqlite3 | ^11.6.0 | Database | Sync API ideal for CLI, no server needed |
| winston | ^3.17.0 | Logging | Structured logs, multiple transports |
| zod | ^3.24.1 | Validation | Runtime validation with TS inference |
| chalk | ^5.3.0 | Terminal colors | Better CLI UX |
| uuid | ^11.0.3 | ID generation | Unique task identifiers |
| dotenv | ^16.4.7 | Config | Environment variable management |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.7.2 | Language |
| jest | ^29.7.0 | Testing |
| ts-jest | ^29.2.5 | Jest TypeScript support |
| tsx | ^4.19.2 | Dev runner |
| eslint | ^9.17.0 | Linting |
| prettier | ^3.4.2 | Formatting |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Reasoning agent infinite loop | Medium | High | Configurable max iterations, timeout |
| SQLite file locking issues | Low | Medium | Single CLI process design |
| Complex reasoning logic | High | Medium | Extensive logging, step-by-step debugging |
| TypeScript/ESM compatibility | Medium | Low | Use tsx for dev, thorough testing |

---

## Complexity Tracking

*No constitutional violations. Architecture uses exactly 3 top-level source directories (`agents/`, `lib/`, `cli/`) as permitted.*

---

**Plan Author**: Spec Kit Demo Team  
**Reviewed By**: Auto-generated following Spec Kit templates  
**Approval Date**: 2025-12-30
