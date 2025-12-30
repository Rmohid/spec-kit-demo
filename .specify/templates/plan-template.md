# Implementation Plan: [FEATURE NAME]

**Branch**: `[###-feature-name]`  
**Date**: [DATE]  
**Spec**: [link to spec.md]  
**Status**: Draft | Approved | In Progress | Complete

---

## Summary

[One paragraph summarizing: primary requirement from spec + chosen technical approach]

---

## Technical Context

<!--
  ACTION REQUIRED: Fill in the technical decisions for this feature.
  Mark unknowns with [NEEDS CLARIFICATION] or [NEEDS RESEARCH]
-->

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Language/Runtime** | [e.g., Node.js 20 LTS] | [why this choice] |
| **Primary Framework** | [e.g., Commander.js for CLI] | [why this choice] |
| **Storage** | [e.g., SQLite] | [why this choice] |
| **Testing Framework** | [e.g., Jest] | [why this choice] |
| **Target Platform** | [e.g., Linux/macOS/Windows CLI] | [requirements reference] |

### Performance Requirements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Response Time | [e.g., <100ms] | [how measured] |
| Memory Usage | [e.g., <100MB] | [how measured] |
| Concurrent Users | [e.g., N/A for CLI] | [how measured] |

### Constraints

- [Constraint 1 - e.g., Must work offline]
- [Constraint 2 - e.g., No external API dependencies]

---

## Constitution Compliance Check

> **GATE**: Must pass before proceeding to implementation design.

### Article I: Specification-First ✅
- [ ] Specification exists and is approved
- [ ] All requirements traced to spec

### Article II: CLI Interface ✅
- [ ] All features accessible via CLI
- [ ] JSON output supported
- [ ] Errors go to stderr

### Article III: Test-First ✅
- [ ] Test strategy defined
- [ ] Contract tests planned
- [ ] Integration tests planned

### Article V: Simplicity ✅
- [ ] Using ≤3 top-level source directories
- [ ] No speculative features
- [ ] Dependencies justified

### Article VII: Error Handling ✅
- [ ] Error handling strategy defined
- [ ] User-friendly error messages planned

---

## Project Structure

### Documentation Structure
```
specs/[###-feature]/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Key validation scenarios
├── tasks.md             # Task breakdown (from /speckit.tasks)
└── contracts/
    └── api-spec.json    # Interface contracts
```

### Source Code Structure
```
src/
├── agents/              # Agent implementations
│   ├── [agent-1]/
│   ├── [agent-2]/
│   └── ...
├── lib/                 # Shared libraries
│   ├── [module-1].js
│   └── [module-2].js
├── cli/                 # CLI entry points
│   ├── index.js
│   └── commands/
└── server/              # Optional API server
    └── routes/

tests/
├── contract/            # Contract tests
├── integration/         # Integration tests
└── unit/                # Unit tests
```

---

## Architecture Overview

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                         CLI                              │
│  (User Interface - Commander.js)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Coordinator Agent                       │
│  (Orchestration - Routes requests to agents)            │
└───────┬─────────────┬─────────────┬─────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────────────┐
│   Agent   │  │   Agent   │  │  Reasoning Agent  │
│     1     │  │     2     │  │   (Autonomous)    │
└─────┬─────┘  └─────┬─────┘  └─────────┬─────────┘
      │              │                  │
      └──────────────┴──────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │    Storage      │
            │   (SQLite)      │
            └─────────────────┘
```

### Data Flow

1. User invokes CLI command
2. CLI parses arguments and routes to Coordinator
3. Coordinator determines which agent(s) to invoke
4. Agent(s) execute and return results
5. Coordinator aggregates results
6. CLI formats and outputs to user

---

## Implementation Phases

### Phase 0: Research (if needed)
- [ ] Research topic 1: [description]
- [ ] Research topic 2: [description]
- [ ] Document findings in `research.md`

### Phase 1: Foundation
- [ ] Project initialization
- [ ] Dependency installation
- [ ] Base structure setup
- [ ] Configuration management

### Phase 2: Core Libraries
- [ ] Shared utilities
- [ ] Storage layer
- [ ] Logging infrastructure

### Phase 3: Agent Implementation
- [ ] Agent 1: [name]
- [ ] Agent 2: [name]
- [ ] Coordinator Agent

### Phase 4: CLI Interface
- [ ] Command structure
- [ ] Argument parsing
- [ ] Output formatting

### Phase 5: Testing
- [ ] Contract tests
- [ ] Integration tests
- [ ] End-to-end validation

### Phase 6: Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Mitigation strategy] |
| [Risk 2] | Low/Med/High | Low/Med/High | [Mitigation strategy] |

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th directory] | [specific need] | [why simpler won't work] |

---

## Dependencies

### External Dependencies

| Package | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| [package] | [version] | [what it does] | [why needed] |

### Internal Dependencies

- [Component A] depends on [Component B] because [reason]

---

## Review Checklist

- [ ] All phases have clear deliverables
- [ ] Dependencies documented and justified
- [ ] Architecture aligns with constitution
- [ ] Risks identified and mitigated
- [ ] Ready for task breakdown

---

**Plan Author**: [Name]  
**Reviewed By**: [Name]  
**Approval Date**: [Date]
