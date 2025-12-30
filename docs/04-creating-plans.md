# Creating Plans

> Defining HOW to build what the specification describes

## From Spec to Plan

The specification defines WHAT and WHY. The plan defines HOW:

| Specification | Plan |
|--------------|------|
| "System MUST persist tasks" | "Use SQLite with better-sqlite3" |
| "Response under 200ms" | "Add database indexes on status column" |
| "Support JSON output" | "Use Commander.js with --json flag" |

## Plan Structure

```markdown
# Implementation Plan: [Feature Name]

## Summary
One paragraph: requirement + technical approach

## Technical Context
Technology decisions with rationale

## Constitution Compliance Check
Verify alignment with project principles

## Architecture Overview
Component diagram and data flow

## Implementation Phases
Ordered steps to build the feature

## Risk Assessment
What could go wrong and mitigations

## Dependencies
External and internal dependencies
```

## Technical Context

Document every technology decision:

```markdown
## Technical Context

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Language | TypeScript 5.x | Type safety, tooling |
| Runtime | Node.js 20 LTS | Stability, long-term support |
| Database | SQLite | Single file, no server needed |
| CLI Framework | Commander.js | Industry standard, good TS support |
| Testing | Jest | Mature, good TypeScript support |
```

### Why Rationale Matters

Every decision should have a "why":

```markdown
# Bad
Database: PostgreSQL

# Good
Database: SQLite
Rationale: Single-user CLI application, no server setup needed,
file-based storage allows easy backup and portability.
```

## Constitution Compliance Check

Before proceeding, verify your plan aligns with project principles:

```markdown
## Constitution Compliance Check

### Article I: Specification-First ✅
- [x] Specification exists and is approved
- [x] All requirements traced to spec

### Article II: CLI Interface ✅
- [x] All features accessible via CLI
- [x] JSON output supported
- [x] Errors go to stderr

### Article III: Test-First ✅
- [x] Test strategy defined
- [x] Contract tests planned
- [x] Integration tests planned
```

If any article is violated, either:
1. Revise the plan to comply, OR
2. Document the exception with justification

## Architecture Overview

### Component Diagram

Use ASCII diagrams for portability:

```
┌─────────────────────────────────────────┐
│                  CLI                     │
│         (Commander.js)                   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│              Business Logic              │
│           (Service Layer)                │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│               Storage                    │
│              (SQLite)                    │
└─────────────────────────────────────────┘
```

### Data Flow

Describe how data moves through the system:

```markdown
### Data Flow

1. User invokes CLI command: `taskflow task create "Buy milk"`
2. Commander.js parses arguments
3. Service layer validates input with Zod
4. Storage layer inserts into SQLite
5. Result formatted and output to stdout
```

## Implementation Phases

Break the work into logical phases:

```markdown
## Implementation Phases

### Phase 1: Foundation
- [ ] Initialize project structure
- [ ] Configure TypeScript and ESLint
- [ ] Setup Jest for testing

### Phase 2: Core Libraries
- [ ] Create storage layer
- [ ] Create validation schemas
- [ ] Create logger

### Phase 3: Feature Implementation
- [ ] Implement Task service
- [ ] Implement CLI commands
- [ ] Wire up end-to-end

### Phase 4: Testing & Polish
- [ ] Contract tests
- [ ] Integration tests
- [ ] Error handling review
```

## Risk Assessment

Identify what could go wrong:

```markdown
## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQLite file locking | Low | Medium | Single-process design |
| Complex validation logic | Medium | Low | Use Zod schemas |
| Performance issues | Low | High | Add indexes, benchmark |
```

## Dependencies

### External Dependencies

Every package needs justification:

```markdown
## External Dependencies

| Package | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| commander | ^12.x | CLI framework | Industry standard |
| better-sqlite3 | ^11.x | Database | Sync API, fast |
| zod | ^3.x | Validation | TS inference |
| winston | ^3.x | Logging | Structured logs |
```

### Internal Dependencies

Document component relationships:

```markdown
### Internal Dependencies

- CLI commands depend on Service layer
- Service layer depends on Storage layer
- Storage layer is independent
```

## Common Planning Mistakes

### ❌ Over-Engineering

```markdown
# Bad
We'll use a microservices architecture with Kubernetes,
Redis for caching, and PostgreSQL with read replicas...

# Good (for a CLI tool)
Single TypeScript application with SQLite storage.
```

### ❌ Missing Rationale

```markdown
# Bad
We'll use React for the frontend.

# Good
We'll use React for the frontend.
Rationale: Team has React experience, component library
available, meets performance requirements.
```

### ❌ Ignoring Constitution

```markdown
# Bad
We'll write tests after implementation to save time.

# Good
Tests will be written first (Article III compliance).
Contract tests for each service, integration tests
for CLI commands.
```

## Plan Review Checklist

- [ ] All technology choices have rationale
- [ ] Constitution compliance verified
- [ ] Architecture clearly documented
- [ ] Phases are logical and ordered
- [ ] Risks identified with mitigations
- [ ] Dependencies documented and justified
- [ ] Ready for task breakdown

## Next Steps

- [Task Breakdown](05-task-breakdown.md) - Breaking plans into tasks
- [Implementation](06-implementation.md) - TDD workflow

---

**Tip**: A good plan should let any developer on the team start implementing without asking "how should I do this?"
