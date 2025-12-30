# Spec Kit Setup

> Getting started with Specification-Driven Development

## Prerequisites

Before setting up Spec Kit, ensure you have:

- Node.js 20+ (LTS recommended)
- npm or yarn
- Git
- A code editor (VS Code recommended)

## Project Structure

A Spec Kit project follows a specific directory structure:

```
your-project/
├── .specify/                    # Spec Kit configuration
│   ├── memory/
│   │   └── constitution.md      # Project governing principles
│   ├── templates/               # Document templates
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   └── tasks-template.md
│   └── scripts/                 # Automation scripts
│
├── specs/                       # Feature specifications
│   └── 001-feature-name/
│       ├── spec.md              # What and Why
│       ├── plan.md              # How (technical)
│       ├── tasks.md             # Step-by-step breakdown
│       ├── data-model.md        # Entity definitions
│       ├── research.md          # Technical research
│       └── quickstart.md        # Validation scenarios
│
├── src/                         # Source code
├── tests/                       # Test suite
└── docs/                        # Learning documentation
```

## Step 1: Initialize the Project

```bash
# Create project directory
mkdir my-sdd-project
cd my-sdd-project

# Initialize Node.js project
npm init -y

# Create Spec Kit structure
mkdir -p .specify/memory .specify/templates .specify/scripts
mkdir -p specs docs src tests
```

## Step 2: Create the Constitution

The constitution defines immutable principles for your project. Create `.specify/memory/constitution.md`:

```bash
cat > .specify/memory/constitution.md << 'EOF'
# Project Constitution

## Article I: Specification-First
- All features begin with a written specification
- Specifications are the source of truth

## Article II: Test-First Development
- Tests must be written before implementation
- Tests must fail before code is written

## Article III: Simplicity
- Start with the simplest solution
- Add complexity only when proven necessary

[Add your project-specific principles]
EOF
```

## Step 3: Create Templates

### Specification Template

Create `.specify/templates/spec-template.md` with sections for:
- Overview
- User Stories (prioritized)
- Acceptance Scenarios (Given/When/Then)
- Requirements (Functional and Non-Functional)
- Success Criteria
- Out of Scope

### Plan Template

Create `.specify/templates/plan-template.md` with sections for:
- Technical Context
- Constitution Compliance Check
- Architecture Overview
- Implementation Phases
- Risk Assessment

### Tasks Template

Create `.specify/templates/tasks-template.md` with:
- Phase breakdown
- Task IDs and dependencies
- Parallel task markers [P]
- User story references [US1], [US2]

## Step 4: Create Your First Specification

```bash
# Create feature directory
mkdir -p specs/001-my-first-feature

# Copy template
cp .specify/templates/spec-template.md specs/001-my-first-feature/spec.md

# Edit the specification
code specs/001-my-first-feature/spec.md
```

## The SDD Workflow

Once set up, follow this workflow for every feature:

```
1. SPECIFY  →  Write spec.md (WHAT and WHY)
      │
      ▼
2. PLAN     →  Write plan.md (HOW technically)
      │
      ▼
3. TASKS    →  Write tasks.md (step-by-step)
      │
      ▼
4. IMPLEMENT → Follow TDD (Red → Green → Refactor)
```

## Verification Checklist

After setup, verify:

- [ ] `.specify/` directory exists with constitution and templates
- [ ] `specs/` directory exists for feature specifications
- [ ] Constitution defines your core principles
- [ ] Templates are ready for new features

## Common Setup Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Skipping constitution | No governing principles | Define principles first |
| Generic templates | Templates don't fit project | Customize templates |
| No spec directory structure | Specs scattered everywhere | Use numbered directories |

## Next Steps

- [Writing Specifications](03-writing-specifications.md) - Learn to write effective specs
- [Creating Plans](04-creating-plans.md) - Technical planning phase

---

**Tip**: The constitution is your project's "law" - take time to define principles that matter to your team.
