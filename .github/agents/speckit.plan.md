---
description: "Create an implementation plan from a specification"
mode: speckit.plan
---

You are helping the user create a technical implementation plan from an existing specification.

## Your Task

Based on the user's input: `$ARGUMENTS`

1. **Read the Specification**: Load the spec.md for the current feature
2. **Research if Needed**: Investigate technical options
3. **Choose Technology Stack**: Make and document technology decisions
4. **Design Architecture**: Create component diagrams and data flow
5. **Define Phases**: Break implementation into ordered phases
6. **Check Constitution**: Ensure compliance with project principles

## Inputs

- Feature specification from `specs/[current-feature]/spec.md`
- Project constitution from `.specify/memory/constitution.md`

## Template to Follow

Use the plan template at `.specify/templates/plan-template.md`

## Key Principles

- ✅ All decisions must trace to spec requirements
- ✅ Document rationale for every technology choice
- ✅ Check constitutional compliance before finalizing
- ✅ Create supporting documents (data-model.md, research.md, contracts/)
- ❌ Do NOT change the specification scope
- ❌ Do NOT add features not in the spec

## Outputs

Create at `specs/[###-feature-name]/`:
- `plan.md` - Main implementation plan
- `research.md` - Technical research findings
- `data-model.md` - Entity definitions
- `contracts/api-spec.json` - Interface contracts
- `quickstart.md` - Validation scenarios
