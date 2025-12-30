# TaskFlow CLI

> A multi-agent task management CLI demonstrating Specification-Driven Development (SDD) with GitHub Spec Kit.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Purpose

This repository serves as a **learning resource** for teams transitioning from traditional Agile development to **Specification-Driven Development (SDD)** using [GitHub Spec Kit](https://github.com/github/spec-kit).

### What You'll Learn

- How to structure a project using Spec Kit's conventions
- Writing effective specifications before code
- Creating implementation plans from specifications
- Breaking down plans into executable tasks
- Building multiple types of agents, including a **fully autonomous reasoning agent**
- The complete SDD lifecycle from design to deployment

## 📚 About Spec-Driven Development

**Spec-Driven Development flips the traditional paradigm**: instead of code being the source of truth with specifications trailing behind, the specification itself becomes the master artifact. Code is generated as the implementation of that spec—not the other way around.

### Key Principles

1. **Specifications as Source of Truth** - Write specs first, code serves specs
2. **Executable Specifications** - Specs must be precise enough to generate working systems
3. **Continuous Refinement** - Specs evolve with understanding
4. **Research-Driven Context** - Gather technical context during planning
5. **Bidirectional Feedback** - Production reality informs spec evolution

### The Four-Phase Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SPECIFY   │────▶│    PLAN     │────▶│    TASKS    │────▶│  IMPLEMENT  │
│             │     │             │     │             │     │             │
│ Define WHAT │     │ Define HOW  │     │ Break down  │     │ Build with  │
│ and WHY     │     │ technically │     │ into steps  │     │ TDD         │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/spec-kit-demo.git
cd spec-kit-demo

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start -- --help
```

### First Commands

```bash
# Create your first task
npm start -- task create "Learn Spec-Driven Development"

# List all tasks
npm start -- task list

# Ask the reasoning agent for recommendations
npm start -- reason "What should I work on next?"

# See all available agents
npm start -- agent list
```

## 📁 Project Structure

This project follows Spec Kit conventions:

```
spec-kit-demo/
├── .specify/                    # Spec Kit framework
│   ├── memory/
│   │   └── constitution.md      # Project governing principles
│   └── templates/               # Spec/plan/task templates
│
├── specs/                       # Feature specifications
│   └── 001-taskflow-core/
│       ├── spec.md              # Feature specification
│       ├── plan.md              # Implementation plan
│       ├── tasks.md             # Task breakdown
│       ├── data-model.md        # Entity definitions
│       ├── research.md          # Technical research
│       ├── quickstart.md        # Validation scenarios
│       └── contracts/           # API contracts
│
├── src/
│   ├── agents/                  # Agent implementations
│   │   ├── coordinator/         # Request routing
│   │   ├── task-agent/          # Task CRUD
│   │   ├── notification-agent/  # Event notifications
│   │   └── reasoning-agent/     # 🌟 Autonomous reasoning
│   ├── lib/                     # Shared libraries
│   └── cli/                     # CLI entry points
│
├── tests/                       # Test suite
│   ├── contract/                # Agent interface tests
│   ├── integration/             # End-to-end tests
│   └── unit/                    # Unit tests
│
└── docs/                        # Learning documentation
```

## 🤖 The Agents

### Coordinator Agent
Routes requests to appropriate specialized agents. No business logic—pure orchestration.

### Task Agent
Handles all task CRUD operations: create, read, update, delete, list.

### Notification Agent
Creates and manages notifications for task lifecycle events.

### Reasoning Agent ⭐
A **fully autonomous agent** that demonstrates advanced agent patterns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     REASONING LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│  1. OBSERVE  │ Gather context about tasks and state             │
│  2. THINK    │ Analyze observations, form hypotheses            │
│  3. PLAN     │ Decide what tools to use                         │
│  4. ACT      │ Execute tools to gather info or take action      │
│  5. REFLECT  │ Evaluate results, generate recommendations       │
│  6. REPEAT   │ Loop until goal achieved or limit reached        │
└─────────────────────────────────────────────────────────────────┘
```

**Example:**
```bash
npm start -- reason "What should I work on next?" --show-steps
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/contract/task-agent.test.ts
```

## 📖 Learning Path

New to SDD? Follow this recommended learning path:

1. **[What is SDD?](docs/01-what-is-sdd.md)** - Understanding the paradigm shift
2. **[Spec Kit Setup](docs/02-spec-kit-setup.md)** - Getting started with Spec Kit
3. **[Writing Specifications](docs/03-writing-specifications.md)** - How to write good specs
4. **[Creating Plans](docs/04-creating-plans.md)** - Technical planning phase
5. **[Task Breakdown](docs/05-task-breakdown.md)** - Breaking plans into tasks
6. **[Implementation](docs/06-implementation.md)** - TDD workflow
7. **[Agents Explained](docs/07-agents-explained.md)** - Agent architecture
8. **[Reasoning Agent Deep Dive](docs/08-reasoning-agent.md)** - Building autonomous agents
9. **[Deployment](docs/09-deployment.md)** - Production deployment

## 🔧 CLI Reference

### Global Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |
| `--verbose` | Enable verbose output |
| `--help` | Show help |
| `--version` | Show version |

### Commands

#### Task Management
```bash
taskflow task create <title> [options]   # Create a new task
taskflow task list [options]             # List all tasks
taskflow task get <id>                   # Get a specific task
taskflow task update <id> [options]      # Update a task
taskflow task delete <id>                # Delete a task
```

#### Agent Management
```bash
taskflow agent list                      # List all agents
taskflow agent status <name>             # Get agent status
taskflow agent invoke <name> [options]   # Invoke agent directly
```

#### Reasoning
```bash
taskflow reason <goal> [options]         # Invoke reasoning agent
```

#### Notifications
```bash
taskflow notifications list [options]    # List notifications
taskflow notifications clear             # Clear all notifications
```

## 🐳 Docker

```bash
# Build the image
docker build -t taskflow-cli .

# Run the CLI
docker run -it taskflow-cli task list
```

## 📜 Constitution

This project is governed by a [constitution](.specify/memory/constitution.md) that defines:

- **Article I**: Specification-First Development
- **Article II**: CLI Interface Mandate
- **Article III**: Test-First Development (NON-NEGOTIABLE)
- **Article IV**: Agent Architecture
- **Article V**: Simplicity
- **Article VI**: Documentation
- **Article VII**: Error Handling
- **Article VIII**: Security

All code must comply with these principles.

## 🤝 Contributing

1. Read the [constitution](.specify/memory/constitution.md)
2. Follow the [specification template](.specify/templates/spec-template.md)
3. Write specs before code
4. Follow TDD (tests first!)
5. Document your decisions

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Resources

- [GitHub Spec Kit](https://github.com/github/spec-kit) - The official Spec Kit repository
- [Spec-Driven Development Guide](https://github.com/github/spec-kit/blob/main/spec-driven.md) - Full SDD methodology
- [ReAct Paper](https://arxiv.org/abs/2210.03629) - The reasoning pattern used in the Reasoning Agent

---

**Built with ❤️ to demonstrate Specification-Driven Development**
