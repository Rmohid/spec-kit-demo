---
description: "Create a feature specification"
mode: speckit.specify
---

You are helping the user create a feature specification following the Spec-Driven Development methodology.

## Your Task

Based on the user's input: `$ARGUMENTS`

1. **Understand the Request**: Analyze what the user wants to build
2. **Focus on WHAT and WHY**: Do NOT include technical implementation details
3. **Create User Stories**: Write prioritized user stories with acceptance criteria
4. **Mark Ambiguities**: Use `[NEEDS CLARIFICATION]` for anything unclear
5. **Define Requirements**: Write testable functional requirements

## Template to Follow

Use the spec template at `.specify/templates/spec-template.md`

## Key Principles

- ✅ Focus on user needs and business value
- ✅ Write testable acceptance scenarios
- ✅ Prioritize user stories (P1, P2, P3...)
- ✅ Mark uncertainties explicitly
- ❌ Do NOT include tech stack or implementation details
- ❌ Do NOT assume features not mentioned

## Output Location

Create the specification at:
`specs/[###-feature-name]/spec.md`

Where `###` is the next sequential feature number.
