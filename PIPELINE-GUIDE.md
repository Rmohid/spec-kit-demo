# Development Pipeline Guide

> Side-by-side comparison of Agile SDLC vs Spec-Driven Development workflows

This guide helps teams familiar with traditional Agile workflows understand the equivalent steps in Specification-Driven Development (SDD). Each section includes copy-paste commands you can run to execute that phase.

---

## Quick Reference

| Agile Phase | SDD Equivalent | Command |
|-------------|----------------|---------|
| Write User Stories | `/speckit.specify` | Create `spec.md` |
| Sprint Planning | `/speckit.plan` | Create `plan.md` |
| Create Tickets | `/speckit.tasks` | Create `tasks.md` |
| Development | `/speckit.implement` | TDD implementation |
| Code Review | Constitution check | Verify compliance |
| Testing | `npm test` | Contract + integration tests |
| Build | `npm run build` | TypeScript compilation |
| Deploy | `docker-compose up` | Container deployment |

---

## Phase 1: Requirements Gathering

### 🔵 Agile Approach
- Product Owner writes user stories in Jira/Linear
- Stories follow "As a user, I want X so that Y" format
- Acceptance criteria added as bullet points
- Stories estimated with story points

### 🟢 SDD Approach
- Write a formal specification document
- Focus on WHAT and WHY, not HOW
- Include testable acceptance scenarios (Given/When/Then)
- Prioritize user stories (P1, P2, P3)

### 📋 Commands

```bash
# View the specification template
cat .specify/templates/spec-template.md

# View the completed specification for this project
cat specs/001-taskflow-core/spec.md

# Key sections to look for:
# - User Stories with priorities
# - Acceptance Scenarios (Given/When/Then)
# - Functional Requirements (FR-001, FR-002, etc.)
# - Success Criteria (measurable outcomes)
```

### 🤖 With AI Agent (if using Copilot/Claude)
```
/speckit.specify Build a task management CLI with multiple agents including a reasoning agent that can analyze tasks and provide recommendations
```

---

## Phase 2: Technical Planning

### 🔵 Agile Approach
- Architecture discussions in meetings
- Technical decisions in Confluence/Notion
- Tech lead creates high-level design
- Developers figure out details during sprint

### 🟢 SDD Approach
- Create formal implementation plan from spec
- Document ALL technical decisions with rationale
- Research unknowns before coding
- Check against project constitution

### 📋 Commands

```bash
# View the plan template
cat .specify/templates/plan-template.md

# View the completed implementation plan
cat specs/001-taskflow-core/plan.md

# View technical research
cat specs/001-taskflow-core/research.md

# View data model
cat specs/001-taskflow-core/data-model.md

# View API contracts
cat specs/001-taskflow-core/contracts/api-spec.json

# Check constitution compliance
cat .specify/memory/constitution.md
```

### 🤖 With AI Agent
```
/speckit.plan Use TypeScript with Node.js, SQLite for storage, Commander.js for CLI, Jest for testing
```

---

## Phase 3: Task Breakdown

### 🔵 Agile Approach
- Break stories into subtasks in Jira
- Estimate each subtask
- Assign to team members
- Track on sprint board

### 🟢 SDD Approach
- Generate ordered task list from plan
- Group by user story for independent delivery
- Mark parallel tasks with [P]
- Include test tasks BEFORE implementation

### 📋 Commands

```bash
# View the tasks template
cat .specify/templates/tasks-template.md

# View the completed task breakdown
cat specs/001-taskflow-core/tasks.md

# Count total tasks
grep -c "^\- \[ \]" specs/001-taskflow-core/tasks.md

# See tasks for a specific user story
grep "\[US1\]" specs/001-taskflow-core/tasks.md

# See parallelizable tasks
grep "\[P\]" specs/001-taskflow-core/tasks.md
```

### 🤖 With AI Agent
```
/speckit.tasks
```

---

## Phase 4: Development (Implementation)

### 🔵 Agile Approach
- Pick up ticket from sprint board
- Write code
- Write tests (sometimes after)
- Create PR when done

### 🟢 SDD Approach
- Follow tasks in order (respect dependencies)
- Write test FIRST (must fail)
- Write minimum code to pass test
- Refactor, then commit

### 📋 Commands

```bash
# === STEP 1: Install dependencies ===
npm install

# === STEP 2: Run TypeScript compiler in watch mode ===
npm run typecheck

# === STEP 3: Follow TDD cycle ===

# 3a. Write a test (example: create a new test file)
cat > tests/unit/example.test.ts << 'EOF'
describe('Example', () => {
  it('should demonstrate TDD', () => {
    expect(1 + 1).toBe(2);
  });
});
EOF

# 3b. Run the test (should FAIL first if testing real code)
npm test -- tests/unit/example.test.ts

# 3c. Write implementation code
# ... edit source files ...

# 3d. Run test again (should PASS)
npm test -- tests/unit/example.test.ts

# 3e. Run all tests
npm test

# === STEP 4: Build the project ===
npm run build
```

### 🤖 With AI Agent
```
/speckit.implement
```

---

## Phase 5: Testing

### 🔵 Agile Approach
- Unit tests (sometimes)
- QA team does manual testing
- Integration tests in CI/CD
- Bug fixes in next sprint

### 🟢 SDD Approach
- Contract tests verify agent interfaces
- Integration tests verify user stories
- Unit tests for complex logic
- All tests run before every commit

### 📋 Commands

```bash
# === Run all tests ===
npm test

# === Run tests with coverage report ===
npm run test:coverage

# === Run specific test categories ===

# Contract tests (agent interfaces)
npm test -- tests/contract/

# Integration tests (end-to-end flows)
npm test -- tests/integration/

# Unit tests (isolated logic)
npm test -- tests/unit/

# === Run a specific test file ===
npm test -- tests/contract/task-agent.test.ts

# === Run tests in watch mode (re-run on file changes) ===
npm run test:watch

# === View coverage report ===
open coverage/lcov-report/index.html  # macOS
# xdg-open coverage/lcov-report/index.html  # Linux
```

### Test Categories Explained

| Category | Purpose | Location |
|----------|---------|----------|
| Contract | Verify agent API contracts | `tests/contract/` |
| Integration | Test complete user flows | `tests/integration/` |
| Unit | Test isolated functions | `tests/unit/` |

---

## Phase 6: Code Quality & Linting

### 🔵 Agile Approach
- ESLint in IDE
- Prettier on save
- Code review catches issues
- Style guide in wiki

### 🟢 SDD Approach
- Lint rules enforced
- Constitution defines principles
- Automated checks before commit
- Code must comply with constitution

### 📋 Commands

```bash
# === Run linter ===
npm run lint

# === Auto-fix linting issues ===
npm run lint:fix

# === Format code with Prettier ===
npm run format

# === Type checking without build ===
npm run typecheck

# === Check constitution compliance manually ===
# Review your code against:
cat .specify/memory/constitution.md

# Key articles to verify:
# - Article II: CLI Interface (all features via CLI, JSON output)
# - Article III: Test-First (tests written before code)
# - Article V: Simplicity (no over-engineering)
# - Article VII: Error Handling (graceful failures)
```

---

## Phase 7: Build & Compile

### 🔵 Agile Approach
- CI/CD runs build
- Build errors block merge
- Artifacts stored in registry

### 🟢 SDD Approach
- TypeScript compilation
- Output to `dist/` directory
- Build must pass before testing

### 📋 Commands

```bash
# === Clean previous build ===
npm run clean

# === Compile TypeScript to JavaScript ===
npm run build

# === Verify build output ===
ls -la dist/

# === Test the built CLI directly ===
node dist/cli/index.js --help

# === Run the CLI via npm ===
npm start -- --help
npm start -- task list
npm start -- agent list
```

---

## Phase 8: Manual Verification

### 🔵 Agile Approach
- QA tests in staging
- Stakeholder demos
- UAT sign-off

### 🟢 SDD Approach
- Run quickstart scenarios
- Verify all acceptance criteria
- Test each user story independently

### 📋 Commands

```bash
# === Follow the quickstart validation scenarios ===
cat specs/001-taskflow-core/quickstart.md

# === Manual verification checklist ===

# 1. Create a task
npm start -- task create "Test task" --priority high
npm start -- task create "Another task" --priority urgent --due "2025-01-15T09:00:00Z"

# 2. List tasks
npm start -- task list
npm start -- task list --status pending
npm start -- task list --json

# 3. Update a task (use ID from list output)
npm start -- task update <TASK_ID> --status in_progress

# 4. Test reasoning agent
npm start -- reason "What should I work on next?"
npm start -- reason "Analyze my tasks" --show-steps

# 5. Check agents
npm start -- agent list
npm start -- agent status reasoning-agent

# 6. Check notifications
npm start -- notifications list
npm start -- notifications clear

# 7. Delete a task
npm start -- task delete <TASK_ID> --force

# 8. Verify JSON output works for all commands
npm start -- task list --json
npm start -- agent list --json
npm start -- reason "Quick check" --json
```

---

## Phase 9: Packaging

### 🔵 Agile Approach
- Docker build in CI
- Push to container registry
- Version tags

### 🟢 SDD Approach
- Dockerfile defines image
- docker-compose for local testing
- Multi-stage build for optimization

### 📋 Commands

```bash
# === Build Docker image ===
cd docker
docker build -t taskflow-cli:latest -f Dockerfile ..

# === Verify image was created ===
docker images | grep taskflow

# === Run CLI in container ===
docker run --rm taskflow-cli:latest --help
docker run --rm taskflow-cli:latest task list

# === Run with persistent data ===
docker run --rm -v taskflow-data:/app/data taskflow-cli:latest task create "Docker test"
docker run --rm -v taskflow-data:/app/data taskflow-cli:latest task list

# === Using docker-compose ===
docker-compose build
docker-compose run --rm taskflow task list
```

---

## Phase 10: Deployment

### 🔵 Agile Approach
- CI/CD pipeline deploys
- Blue-green or rolling deployment
- Monitor and rollback if needed

### 🟢 SDD Approach
- Same infrastructure approach
- Constitution compliance verified
- Spec serves as deployment contract

### 📋 Commands

```bash
# === Local deployment with docker-compose ===
cd docker
docker-compose up -d

# === Check container is running ===
docker-compose ps

# === View logs ===
docker-compose logs -f

# === Execute commands in running container ===
docker-compose exec taskflow task list

# === Stop deployment ===
docker-compose down

# === Production deployment (example) ===
# Tag and push to registry
docker tag taskflow-cli:latest your-registry.com/taskflow-cli:1.0.0
docker push your-registry.com/taskflow-cli:1.0.0

# Deploy to Kubernetes (example)
# kubectl apply -f k8s/deployment.yaml
```

---

## Phase 11: Documentation

### 🔵 Agile Approach
- README in repo
- API docs generated
- Wiki for guides
- Often outdated

### 🟢 SDD Approach
- Specs ARE documentation
- Code generated from specs
- Always in sync
- Learning-focused for this demo

### 📋 Commands

```bash
# === View project documentation ===

# Main README
cat README.md

# Learning guides
ls docs/
cat docs/01-what-is-sdd.md
cat docs/07-agents-explained.md

# Reasoning agent deep dive
cat src/agents/reasoning-agent/README.md

# === View specifications as documentation ===

# Feature specification (WHAT and WHY)
cat specs/001-taskflow-core/spec.md

# Implementation plan (HOW)
cat specs/001-taskflow-core/plan.md

# API contract (interface)
cat specs/001-taskflow-core/contracts/api-spec.json
```

---

## Complete Pipeline: One Command Per Phase

Copy and run these commands in sequence to experience the full SDD pipeline:

```bash
# 1. UNDERSTAND THE SPEC
echo "📋 Phase 1: Understanding the Specification"
head -50 specs/001-taskflow-core/spec.md

# 2. REVIEW THE PLAN
echo "📐 Phase 2: Reviewing the Plan"
head -50 specs/001-taskflow-core/plan.md

# 3. CHECK TASKS
echo "📝 Phase 3: Checking Task Breakdown"
grep "^\- \[ \]" specs/001-taskflow-core/tasks.md | head -20

# 4. INSTALL DEPENDENCIES
echo "📦 Phase 4: Installing Dependencies"
npm install

# 5. RUN TESTS
echo "🧪 Phase 5: Running Tests"
npm test 2>&1 | tail -20

# 6. BUILD
echo "🔨 Phase 6: Building"
npm run build

# 7. VERIFY
echo "✅ Phase 7: Verifying"
npm start -- task create "Pipeline test" --json
npm start -- task list
npm start -- reason "Quick check"

# 8. PACKAGE
echo "📦 Phase 8: Packaging"
cd docker && docker build -t taskflow-cli:latest -f Dockerfile .. && cd ..

# 9. DEPLOY
echo "🚀 Phase 9: Deploying"
cd docker && docker-compose up -d && cd ..

# 10. SMOKE TEST
echo "💨 Phase 10: Smoke Test"
docker-compose -f docker/docker-compose.yml exec taskflow task list

# 11. CLEANUP
echo "🧹 Phase 11: Cleanup"
docker-compose -f docker/docker-compose.yml down
```

---

## Comparison Summary

| Agile Artifact | SDD Artifact | Key Difference |
|----------------|--------------|----------------|
| User Story | `spec.md` User Story | SDD has formal Given/When/Then scenarios |
| Tech Design Doc | `plan.md` | SDD requires constitution compliance |
| Jira Tickets | `tasks.md` | SDD orders by dependency, marks parallel |
| Code | `src/` | Same, but TDD is mandatory in SDD |
| Tests | `tests/` | SDD writes tests BEFORE code |
| README | `spec.md` + `plan.md` | Specs ARE the documentation |
| Sprint Retro | Constitution update | Principles evolve formally |

---

## Key Mindset Shifts

### From Agile to SDD

| Agile Mindset | SDD Mindset |
|---------------|-------------|
| "Let's figure it out as we code" | "Let's specify it completely first" |
| "Tests verify our code works" | "Tests define what code should do" |
| "Documentation can come later" | "Specification IS the documentation" |
| "Tech debt is inevitable" | "Tech debt is prevented by design" |
| "Stories are rough guides" | "Specs are executable contracts" |

### Remember

1. **Spec first, code second** - Never write code without a spec
2. **Tests first, implementation second** - Red-Green-Refactor always
3. **Constitution is law** - All decisions must comply
4. **Specs are living** - They evolve, but formally

---

## Need Help?

```bash
# CLI help
npm start -- --help
npm start -- task --help
npm start -- reason --help

# View examples
cat specs/001-taskflow-core/quickstart.md

# Read the learning guide
cat docs/01-what-is-sdd.md
```

---

# 🎯 Practical Example: Adding a "Task Search" Feature

This walkthrough demonstrates the complete SDD pipeline by adding a new feature: **searching tasks by keyword**. Follow along step-by-step to see how SDD works in practice.

## Scenario

**Product Request**: "Users should be able to search for tasks by keyword in the title or description."

In Agile, you might create a Jira ticket and start coding. In SDD, we follow a structured process.

---

## Step 1: Create the Specification

### What We're Doing
Before writing any code, we formally specify WHAT we want and WHY.

### Commands

```bash
# Create a new feature directory
mkdir -p specs/002-task-search

# Create the specification file
cat > specs/002-task-search/spec.md << 'EOF'
# Feature Specification: Task Search

**Feature Branch**: `002-task-search`
**Created**: $(date +%Y-%m-%d)
**Status**: Draft
**Input**: Users need to find tasks quickly by searching keywords

---

## Overview

Add keyword search capability to TaskFlow CLI, allowing users to find tasks
by searching text in titles and descriptions.

---

## User Scenarios & Testing

### User Story 1 - Search Tasks by Keyword (Priority: P1)

As a user, I want to search for tasks containing a specific word or phrase
so that I can quickly find relevant tasks without scrolling through the entire list.

**Why this priority**: This is the core feature - without search, the feature has no value.

**Independent Test**: Can search for "report" and only see tasks with "report" in title/description.

**Acceptance Scenarios**:

1. **Given** tasks exist with various titles,
   **When** I run `taskflow task search "report"`,
   **Then** only tasks containing "report" in title OR description are returned

2. **Given** tasks exist,
   **When** I run `taskflow task search "nonexistent"`,
   **Then** an empty list is returned with a friendly message

3. **Given** I search with `--json` flag,
   **When** results are returned,
   **Then** output is valid JSON array

---

### Edge Cases

- What if search term is empty? → Show error: "Search term required"
- What if search term has special characters? → Escape and search literally
- Case sensitivity? → Search should be case-insensitive

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST support searching tasks by keyword
- **FR-002**: Search MUST check both title AND description fields
- **FR-003**: Search MUST be case-insensitive
- **FR-004**: Results MUST be returned in JSON format when --json flag is used
- **FR-005**: Empty results MUST show friendly message, not error

### Non-Functional Requirements

- **NFR-001**: Search MUST complete in under 100ms for up to 1000 tasks

---

## Success Criteria

- **SC-001**: All acceptance scenarios pass
- **SC-002**: Search returns results in <100ms
- **SC-003**: Existing tests still pass (no regression)

---

## Out of Scope

- Full-text search with relevance ranking
- Search by tags (future feature)
- Regular expression search

---

**Specification Author**: Developer
**Approval Date**: Pending
EOF

# View what we created
echo "✅ Specification created!"
cat specs/002-task-search/spec.md
```

### Agile Equivalent
In Agile, this would be a user story card:
```
As a user
I want to search tasks by keyword  
So that I can find tasks quickly

Acceptance Criteria:
- Can search by title
- Can search by description
- Case insensitive
```

**SDD Difference**: Our spec is more formal, has Given/When/Then scenarios, and explicitly marks edge cases and out-of-scope items.

---

## Step 2: Create the Implementation Plan

### What We're Doing
Define HOW we'll build it technically, with all decisions documented.

### Commands

```bash
# Create the implementation plan
cat > specs/002-task-search/plan.md << 'EOF'
# Implementation Plan: Task Search

**Branch**: `002-task-search`
**Date**: $(date +%Y-%m-%d)
**Spec**: [spec.md](./spec.md)
**Status**: Draft

---

## Summary

Add a `search` action to the Task Agent and corresponding CLI command.
Search will use SQLite LIKE queries for simplicity and performance.

---

## Technical Context

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Search Method** | SQLite LIKE | Simple, no dependencies, fast for <10k tasks |
| **Case Handling** | LOWER() function | SQLite doesn't have case-insensitive LIKE by default |
| **New Files** | 0 | Extend existing task-agent and CLI |
| **Modified Files** | 3 | storage.ts, task-agent/index.ts, cli/commands/task.ts |

---

## Constitution Compliance Check

- [x] **Article II**: CLI interface with --json support ✓
- [x] **Article III**: Tests written first ✓
- [x] **Article V**: Simple solution (SQLite LIKE) ✓
- [x] **Article VII**: Error handling for empty search ✓

---

## Implementation Approach

### Storage Layer (src/lib/storage.ts)
Add new method:
```typescript
searchTasks(query: string, limit?: number): Task[]
```

SQL:
```sql
SELECT * FROM tasks 
WHERE LOWER(title) LIKE LOWER('%' || ? || '%')
   OR LOWER(description) LIKE LOWER('%' || ? || '%')
ORDER BY created_at DESC
LIMIT ?
```

### Task Agent (src/agents/task-agent/index.ts)
Add 'search' to capabilities and handleAction switch.

### CLI (src/cli/commands/task.ts)
Add new subcommand:
```
taskflow task search <query> [--limit N] [--json]
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Slow with many tasks | Low | Medium | Add index, set default limit |

---

**Plan Author**: Developer
**Approval Date**: Pending
EOF

echo "✅ Plan created!"
head -50 specs/002-task-search/plan.md
```

### Agile Equivalent
In Agile, this might be discussed in sprint planning or a tech design doc that often gets outdated.

**SDD Difference**: The plan is versioned with the code and must pass constitution checks.

---

## Step 3: Create the Task Breakdown

### What We're Doing
Break the plan into ordered, executable tasks with test-first approach.

### Commands

```bash
# Create the task breakdown
cat > specs/002-task-search/tasks.md << 'EOF'
# Tasks: Task Search

**Input**: specs/002-task-search/plan.md, spec.md
**Prerequisites**: Plan approved

---

## Phase 1: Tests First (Article III Compliance) ⚠️

> Write these tests FIRST. They MUST FAIL before implementation.

- [ ] T001 [US1] Add contract test for search action in `tests/contract/task-agent.test.ts`
- [ ] T002 [US1] Add test: search returns matching tasks
- [ ] T003 [US1] Add test: search is case-insensitive  
- [ ] T004 [US1] Add test: search with no results returns empty array
- [ ] T005 [US1] Add test: empty search term returns error

**Checkpoint**: Run `npm test` - tests should FAIL (Red phase)

---

## Phase 2: Implementation

- [ ] T006 [US1] Add `searchTasks()` method to `src/lib/storage.ts`
- [ ] T007 [US1] Add 'search' capability to Task Agent in `src/agents/task-agent/index.ts`
- [ ] T008 [US1] Add `task search` CLI command in `src/cli/commands/task.ts`
- [ ] T009 [US1] Add Zod schema for search input in `src/lib/validators.ts`

**Checkpoint**: Run `npm test` - tests should PASS (Green phase)

---

## Phase 3: Polish

- [ ] T010 Verify JSON output works correctly
- [ ] T011 Update quickstart.md with search examples
- [ ] T012 Run full test suite to check for regressions

**Checkpoint**: All tests pass, feature works end-to-end

---

## Execution Order

```
T001 → T002 → T003 → T004 → T005  (Tests - must fail)
                ↓
T006 → T007 → T008 → T009         (Implementation)
                ↓
T010 → T011 → T012                (Polish)
```
EOF

echo "✅ Tasks created!"
cat specs/002-task-search/tasks.md
```

### Agile Equivalent
In Agile, these would be subtasks on the Jira ticket, often without strict ordering.

**SDD Difference**: Tasks are explicitly ordered, tests come FIRST, and checkpoints verify progress.

---

## Step 4: Write Tests First (Red Phase)

### What We're Doing
Write failing tests BEFORE any implementation code. This is non-negotiable in SDD.

### Commands

```bash
# Add search tests to the existing contract test file
cat >> tests/contract/task-agent.test.ts << 'EOF'

  // ============================================
  // SEARCH TESTS (Task Search Feature - 002)
  // ============================================

  describe('search action', () => {
    beforeEach(async () => {
      // Create test tasks for searching
      await agent.execute({
        action: 'create',
        params: { title: 'Buy groceries', description: 'Get milk and bread' },
      });
      await agent.execute({
        action: 'create',
        params: { title: 'Write report', description: 'Q4 financial summary' },
      });
      await agent.execute({
        action: 'create',
        params: { title: 'Call dentist', description: 'Schedule appointment' },
      });
    });

    it('should find tasks matching title', async () => {
      const response = await agent.execute<Task[]>({
        action: 'search',
        params: { query: 'report' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0]?.title).toBe('Write report');
    });

    it('should find tasks matching description', async () => {
      const response = await agent.execute<Task[]>({
        action: 'search',
        params: { query: 'milk' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0]?.title).toBe('Buy groceries');
    });

    it('should be case-insensitive', async () => {
      const response = await agent.execute<Task[]>({
        action: 'search',
        params: { query: 'REPORT' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
    });

    it('should return empty array for no matches', async () => {
      const response = await agent.execute<Task[]>({
        action: 'search',
        params: { query: 'nonexistent' },
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it('should reject empty search query', async () => {
      const response = await agent.execute({
        action: 'search',
        params: { query: '' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('required');
    });
  });
EOF

echo "✅ Tests added!"

# Run tests - they should FAIL because search isn't implemented yet
echo ""
echo "🔴 Running tests (expecting FAILURE - Red phase)..."
npm test -- tests/contract/task-agent.test.ts 2>&1 | tail -30
```

### Expected Output
The tests should **FAIL** with errors like:
- `Action 'search' not supported`

This is correct! We're in the "Red" phase of TDD.

### Agile Equivalent
In Agile, tests are often written after implementation (or skipped entirely).

**SDD Difference**: Tests are written FIRST and must fail before we write implementation code.

---

## Step 5: Implement the Feature (Green Phase)

### What We're Doing
Write the minimum code needed to make tests pass.

### Commands

```bash
# Step 5a: Add searchTasks to storage layer
cat >> src/lib/storage.ts << 'EOF'

  /**
   * Search tasks by keyword in title or description.
   * Case-insensitive search.
   */
  searchTasks(query: string, limit: number = 50): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE LOWER(title) LIKE LOWER('%' || ? || '%')
         OR (description IS NOT NULL AND LOWER(description) LIKE LOWER('%' || ? || '%'))
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(query, query, limit) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }
EOF

echo "✅ Storage method added (need to add inside class - doing manual edit)"
```

Let me add these properly:

```bash
# We need to edit files properly - let's show what changes are needed

echo "
=== CHANGES NEEDED ===

1. In src/lib/storage.ts, add inside the Storage class:

   searchTasks(query: string, limit: number = 50): Task[] {
     const stmt = this.db.prepare(\`
       SELECT * FROM tasks 
       WHERE LOWER(title) LIKE LOWER('%' || ? || '%')
          OR (description IS NOT NULL AND LOWER(description) LIKE LOWER('%' || ? || '%'))
       ORDER BY created_at DESC
       LIMIT ?
     \`);
     const rows = stmt.all(query, query, limit) as TaskRow[];
     return rows.map((row) => this.rowToTask(row));
   }

2. In src/agents/task-agent/index.ts:
   - Add 'search' to capabilities array
   - Add case 'search': return this.searchTasks(params); in handleAction
   - Add searchTasks method

3. In src/cli/commands/task.ts:
   - Add 'task search <query>' subcommand

=== After making changes, run: ===
npm run build
npm test -- tests/contract/task-agent.test.ts
"
```

### Manual Implementation Steps

Since we're demonstrating the process, here are the exact edits needed:

```bash
# View current task-agent capabilities to know where to add 'search'
grep -n "capabilities:" src/agents/task-agent/index.ts
```

### Agile Equivalent
In Agile, you'd just write the code. In SDD, you write minimum code to pass failing tests.

**SDD Difference**: Implementation is driven by tests. You don't add anything tests don't require.

---

## Step 6: Verify Tests Pass (Green Phase Complete)

### What We're Doing
Confirm all tests pass after implementation.

### Commands

```bash
# After implementing the changes, run tests
npm run build
npm test -- tests/contract/task-agent.test.ts

# Expected: All tests PASS (Green phase)
echo ""
echo "🟢 If all tests pass, Green phase is complete!"
```

---

## Step 7: Manual Verification

### What We're Doing  
Test the feature manually as a user would.

### Commands

```bash
# Create some test tasks
npm start -- task create "Weekly report" --description "Summarize team progress"
npm start -- task create "Buy birthday gift" --description "Something for Mom"
npm start -- task create "Report bug to vendor" --description "Login issue"

# Test search
echo "=== Search for 'report' ==="
npm start -- task search "report"

echo "=== Search for 'mom' (case insensitive) ==="
npm start -- task search "MOM"

echo "=== Search with JSON output ==="
npm start -- task search "report" --json

echo "=== Search with no results ==="
npm start -- task search "nonexistent"
```

---

## Step 8: Build and Package

### Commands

```bash
# Full rebuild
npm run clean
npm run build

# Run full test suite (check for regressions)
npm test

# Build Docker image with new feature
cd docker
docker build -t taskflow-cli:latest -f Dockerfile ..
cd ..

echo "✅ Build and package complete!"
```

---

## Step 9: Update Documentation

### Commands

```bash
# Update quickstart with search examples
cat >> specs/002-task-search/quickstart.md << 'EOF'
# Quickstart: Task Search

## Basic Search
```bash
taskflow task search "report"
```

## Case-Insensitive
```bash
taskflow task search "URGENT"  # finds "urgent", "Urgent", etc.
```

## JSON Output
```bash
taskflow task search "project" --json
```

## With Limit
```bash
taskflow task search "task" --limit 10
```
EOF

echo "✅ Documentation updated!"
```

---

## Step 10: Mark Tasks Complete

### Commands

```bash
# Update tasks.md to show completion
sed -i '' 's/- \[ \] T001/- [x] T001/' specs/002-task-search/tasks.md
sed -i '' 's/- \[ \] T002/- [x] T002/' specs/002-task-search/tasks.md
# ... etc

# Or view the task list
cat specs/002-task-search/tasks.md
```

---

## Summary: What We Did

| Step | Agile Equivalent | SDD Action | Time |
|------|------------------|------------|------|
| 1 | Write user story | Create spec.md | 10 min |
| 2 | Tech discussion | Create plan.md | 10 min |
| 3 | Create subtasks | Create tasks.md | 5 min |
| 4 | (often skipped) | Write failing tests | 15 min |
| 5 | Write code | Implement to pass tests | 20 min |
| 6 | Run tests | Verify green | 2 min |
| 7 | QA testing | Manual verification | 5 min |
| 8 | CI/CD | Build & package | 2 min |
| 9 | Update wiki | Update docs | 5 min |
| 10 | Close ticket | Mark tasks done | 1 min |

**Total: ~75 minutes** for a complete, documented, tested feature.

---

## Key Takeaways

### What's Different in SDD

1. **Spec First**: We wrote a complete specification before touching code
2. **Tests First**: Tests were written and failed BEFORE implementation
3. **Constitution Check**: We verified compliance with project principles
4. **Documentation Built-In**: Spec and plan ARE the documentation
5. **Traceable**: Every line of code traces back to a requirement

### What Stays the Same

1. Still write code
2. Still run tests
3. Still deploy with Docker
4. Still need good engineering practices

### The Payoff

- **No ambiguity**: Everyone knows exactly what "done" means
- **No drift**: Code matches spec because tests enforce it
- **No stale docs**: Spec IS the documentation
- **Easy onboarding**: New devs read spec, understand feature
- **Confident refactoring**: Tests verify behavior preserved
