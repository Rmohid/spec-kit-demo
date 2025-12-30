# TaskFlow CLI Constitution

> **Purpose**: This constitution establishes the immutable principles that govern all development within the TaskFlow CLI project. All specifications, plans, and implementations MUST align with these principles.

## Article I: Specification-First Development

### Section 1.1: Specification Primacy
- All features MUST begin with a written specification before any code is written
- Specifications are the source of truth; code serves specifications
- Changes to functionality MUST first be reflected in specifications

### Section 1.2: Specification Quality
- Specifications MUST define WHAT and WHY, never HOW
- All requirements MUST be testable and measurable
- Ambiguities MUST be marked with `[NEEDS CLARIFICATION]` and resolved before implementation

## Article II: CLI Interface Mandate

### Section 2.1: Text-Based Interface
- Every feature MUST be accessible via command-line interface
- CLI commands MUST accept text input (stdin, arguments, or files)
- CLI commands MUST produce text output (stdout for results, stderr for errors)
- JSON format MUST be supported for structured data exchange

### Section 2.2: Observability
- All CLI operations MUST be inspectable and debuggable
- Operations MUST produce meaningful output that can be piped/processed
- Silent failures are NOT permitted

## Article III: Test-First Development (NON-NEGOTIABLE)

### Section 3.1: TDD Mandatory
- NO implementation code shall be written before tests exist
- Tests MUST be written → Verified to FAIL → Then implementation proceeds
- Red-Green-Refactor cycle is strictly enforced

### Section 3.2: Test Categories
- **Contract Tests**: Validate API/interface contracts
- **Integration Tests**: Test component interactions with real dependencies
- **Unit Tests**: Test isolated logic (use sparingly, prefer integration)

### Section 3.3: Test Environment
- Prefer real databases/services over mocks
- Mocks are permitted only for external services outside our control
- Tests MUST run in isolation (no shared state between tests)

## Article IV: Agent Architecture

### Section 4.1: Agent Independence
- Each agent MUST be independently deployable and testable
- Agents communicate through well-defined interfaces only
- No direct access to another agent's internal state

### Section 4.2: Agent Responsibilities
- **Coordinator Agent**: Orchestration only, no business logic
- **Specialized Agents**: Single responsibility, focused domain
- **Reasoning Agent**: Autonomous decision-making with full audit trail

### Section 4.3: Reasoning Agent Requirements
- MUST implement observe-think-plan-act-reflect loop
- MUST log all reasoning steps for debugging
- MUST have configurable iteration limits (prevent infinite loops)
- MUST support graceful degradation on errors

## Article V: Simplicity

### Section 5.1: YAGNI Principle
- Do NOT implement features "for the future"
- Start with the simplest solution that works
- Add complexity only when proven necessary

### Section 5.2: Project Structure
- Maximum 3 top-level source directories for initial implementation
- Additional directories require documented justification
- Avoid deep nesting (max 4 levels)

### Section 5.3: Dependencies
- Minimize external dependencies
- Each dependency MUST have documented justification
- Prefer standard library when functionality is equivalent

## Article VI: Documentation

### Section 6.1: Documentation Requirements
- All public interfaces MUST be documented
- Documentation MUST be written for beginners (this is a learning project)
- Code comments explain WHY, not WHAT
- Examples MUST be copy-paste ready and tested

### Section 6.2: Learning Focus
- This project serves as an SDD learning resource
- Every design decision MUST be explained
- Common pitfalls MUST be documented with solutions

## Article VII: Error Handling

### Section 7.1: Graceful Failures
- All errors MUST be caught and handled appropriately
- Error messages MUST be actionable (tell user what to do)
- Stack traces for developers, friendly messages for users

### Section 7.2: Logging
- Structured logging MUST be used (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Sensitive data MUST NOT be logged

## Article VIII: Security

### Section 8.1: Input Validation
- All external input MUST be validated
- Never trust user input
- Sanitize before processing

### Section 8.2: Data Protection
- No secrets in code or version control
- Environment variables for configuration
- Principle of least privilege

## Governance

### Amendment Process
Modifications to this constitution require:
1. Written proposal with rationale
2. Impact assessment on existing code
3. Update to all affected specifications
4. Documentation of the change

### Compliance
- All code reviews MUST verify constitutional compliance
- Violations MUST be documented and resolved before merge
- Constitution takes precedence over convenience

---

**Version**: 1.0.0  
**Ratified**: 2025-12-30  
**Last Amended**: 2025-12-30
