---
description: "Implement tasks from the task breakdown"
mode: speckit.implement
---

You are helping the user implement the feature according to the task breakdown.

## Your Task

1. **Read the Task List**: Load tasks.md
2. **Follow TDD**: For each task, write test first, then implementation
3. **Respect Order**: Complete tasks in dependency order
4. **Validate Often**: Run tests after each task
5. **Update Progress**: Check off completed tasks

## The TDD Cycle (NON-NEGOTIABLE)

For EVERY implementation task:

```
1. Write the test → Must compile
2. Run the test → Must FAIL (Red)
3. Write minimum implementation
4. Run the test → Must PASS (Green)
5. Refactor if needed
6. Commit with descriptive message
```

## Inputs

From `specs/[current-feature]/`:
- `tasks.md` (required)
- `plan.md` (for technical context)
- `data-model.md` (for entity definitions)
- `contracts/` (for interface definitions)

## Key Principles

- ✅ Complete tasks in order (respect dependencies)
- ✅ Run tests frequently
- ✅ Commit after each task or logical group
- ✅ Ask for clarification if task is ambiguous
- ❌ Do NOT skip tests
- ❌ Do NOT implement ahead of tests
- ❌ Do NOT change the spec or plan during implementation

## Checkpoints

After completing each user story phase:
1. Run all tests for that story
2. Verify the story works independently
3. Update tasks.md to mark completion
4. Consider committing/PR at this point

## Commands to Run

```bash
# TypeScript check
npm run typecheck

# Run tests
npm test

# Run specific test file
npm test -- tests/contract/[file].test.ts

# Build
npm run build
```
