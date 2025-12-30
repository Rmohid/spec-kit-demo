# What is Specification-Driven Development?

> A guide for teams transitioning from Agile to SDD

## The Paradigm Shift

For decades, **code has been king**. Specifications served code—they were scaffolding we built and then discarded once the "real work" of coding began. We wrote PRDs to guide development, created design docs to inform implementation, drew diagrams to visualize architecture. But these were always subordinate to the code itself.

**Spec-Driven Development (SDD) inverts this power structure.**

Specifications don't serve code—code serves specifications. The Product Requirements Document (PRD) isn't a guide for implementation; it's the source that generates implementation.

## Why Now?

Three trends make SDD not just possible but necessary:

### 1. AI Capabilities Have Reached a Threshold
Natural language specifications can now reliably generate working code. This isn't about replacing developers—it's about amplifying their effectiveness by automating mechanical translation.

### 2. Software Complexity Continues to Grow
Modern systems integrate dozens of services, frameworks, and dependencies. Keeping all these aligned with original intent through manual processes becomes increasingly difficult.

### 3. The Pace of Change Accelerates
Requirements change far more rapidly today than ever before. Traditional development treats these changes as disruptions. SDD transforms requirement changes into normal workflow.

## SDD vs. Traditional Development

| Aspect | Traditional | Spec-Driven |
|--------|-------------|-------------|
| Source of truth | Code | Specification |
| Documentation | After the fact | Before implementation |
| Changes | Disruptive | Systematic regeneration |
| Tech debt | Accumulates | Prevented by design |
| Alignment | Manual, often drifts | Automatic, always current |

## The Four Phases

### Phase 1: Specify
Define **WHAT** you want to build and **WHY**.

- Focus on user needs, not technical implementation
- Write acceptance criteria
- Mark ambiguities explicitly
- No tech stack decisions yet

**Output**: Feature specification (`spec.md`)

### Phase 2: Plan
Define **HOW** to build it technically.

- Choose technology stack
- Design architecture
- Document research
- Validate against constitution

**Output**: Implementation plan (`plan.md`), data models, contracts

### Phase 3: Tasks
Break the plan into executable steps.

- Ordered by dependency
- Parallelizable where possible
- Each task has acceptance criteria
- Follows TDD approach

**Output**: Task breakdown (`tasks.md`)

### Phase 4: Implement
Build according to the plan.

- Write tests first (Red)
- Implement to pass tests (Green)
- Refactor as needed
- Verify against spec

**Output**: Working, tested code

## Key Concepts

### The Constitution
A set of immutable principles that govern all development. For example:
- "All features must have CLI interfaces"
- "Tests must be written before implementation"
- "Start with the simplest solution"

### Living Specifications
Specifications aren't static documents—they evolve as understanding grows. Changes flow through the entire system:

```
Spec Change → Plan Update → Task Revision → Code Regeneration
```

### Executable Specifications
Specifications must be precise enough to generate working systems. This eliminates the gap between intent and implementation.

## Common Concerns

### "Isn't this waterfall?"
No. Unlike waterfall:
- Specifications are living documents
- Feedback loops are continuous
- Changes are embraced, not feared
- Iteration happens at all levels

### "What about creativity?"
SDD amplifies creativity by:
- Freeing developers from mechanical translation
- Enabling rapid experimentation with multiple approaches
- Making "what if" scenarios cheap to explore

### "What if requirements are unclear?"
That's expected! SDD provides explicit mechanisms:
- `[NEEDS CLARIFICATION]` markers
- `/speckit.clarify` command
- Iterative refinement process

## Getting Started

1. **Read the constitution** - Understand the governing principles
2. **Study the templates** - See how specs/plans/tasks are structured
3. **Follow the workflow** - Specify → Plan → Tasks → Implement
4. **Embrace iteration** - Refine continuously

## Next Steps

- [Spec Kit Setup](02-spec-kit-setup.md) - Set up your first Spec Kit project
- [Writing Specifications](03-writing-specifications.md) - Learn to write effective specs
