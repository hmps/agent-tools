# Agent Tools

A CLI tool built with Bun that provides different tools for AI coding agents to use. This toolkit is designed to replace MCP (Model Context Protocol) in many ways and exposes tools and search capabilities for Multi-Modal Language Models (MMLMs) to manage, understand, and use tools on the local file system and to interact with external services.

Agent Tools captures patterns that make development workflows agent-friendly, including capabilities like parsing GitHub comments, running specialized skills, and providing structured access to local development environments.

## Overview

Agent Tools provides a comprehensive suite of utilities that enable AI coding agents to:
- **Manage Local File Systems**: Advanced search, navigation, and file manipulation capabilities
- **Parse External Services**: Built-in support for GitHub comment parsing and other service integrations
- **Execute Specialized Skills**: Pre-built workflows for common development tasks and patterns
- **Provide Structured Logging**: Agent-accessible logs that maintain human readability

### Key Features

- **MCP Replacement**: Direct tool access without protocol overhead
- **Real-time Development**: Works seamlessly with live development workflows  
- **Cross-platform Compatibility**: Built with standard Unix utilities
- **Agent-First Design**: Tools specifically designed for AI agent consumption
- **Human-Friendly**: Maintains developer experience while enabling agent access

## Motivation

Working with AI agents introduces new patterns and requirements. For example, logs need to be accessible both to agents (for debugging and context) and to humans (for review and monitoring). This repository collects these agent-friendly tools as they're discovered across different projects.

The collection will grow over time as more patterns emerge from real-world agent interactions, with examples including GitHub comment parsing, specialized development skills, and enhanced file system interaction capabilities.

## Installation

Run the install script to add all tools to your PATH:

```bash
./install.sh
```

This creates symlinks in `~/.local/bin` for each tool and updates your shell configuration (`.bashrc` or `.zshrc`) if needed.

## Available Tools

### `agt`

Search and fetch agent skills. Skills are modular capabilities that provide agents with domain-specific expertise, workflows, and best practices.

**Usage:**
```bash
agt skill search [keywords...]    # Search for skills by keywords
agt skill get <skill-name>        # Get full content of a skill
```

**Examples:**
```bash
# List all available skills
agt skill search

# Search for skills about code review
agt skill search code review

# Get the full content of a specific skill
agt skill get receiving-code-review
```

**Output Format:**

The search command returns results in an LLM-friendly plain text format:

```
SKILL: receiving-code-review
DESCRIPTION: Use when receiving code review feedback, before implementing...
CMD: agt skill get receiving-code-review

SKILL: another-skill
DESCRIPTION: Another skill description here
CMD: agt skill get another-skill
```

The `get` command returns the complete SKILL.md file content, including all instructions and examples.

**Skills Directory:**

Skills are stored in the `skills/` directory, each in its own subdirectory with a `SKILL.md` file containing:
- YAML frontmatter with `name` and `description`
- Complete instructions and guidance
- Examples and best practices

For more about Agent Skills, see the [Anthropic documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview).

### `logdev`

Runs a development command while simultaneously logging all output (stdout + stderr) to a file. This keeps logs available for later review by both humans and agents while maintaining real-time terminal output.

**Usage:**
```bash
logdev [--logfile=PATH] COMMAND [ARGS...]
```

**Options:**
- `--logfile=PATH` - Specify log file path (default: `.logs/dev.log`)
- `--logfile PATH` - Alternative syntax

**Examples:**
```bash
# Run dev server with logging
logdev npm run dev

# Use custom log file
logdev --logfile=.logs/custom.log bun dev

# Works with environment wrappers
logdev dotenvx run -- next dev --turbopack
```

The log file includes a header with timestamp, command, and working directory. Exit codes from the wrapped command are preserved.

## Repository Structure

```
agent-tools/
├── skills/                      # Agent Skills directory
│   └── receiving-code-review/   # Example skill
│       └── SKILL.md             # Skill definition
├── tools/                       # Individual tool scripts
│   └── agt.ts                   # Agent skills search & fetch CLI
└── install.sh                   # Installation script
```

Tools in the `tools/` directory are installed as symlinks to `~/.local/bin`, making them available system-wide while keeping the source files editable in this repository.

## Future Capabilities

As this toolkit grows, planned features include:

### External Service Integration
- **GitHub Comment Parsing**: Extract and analyze comments from GitHub PRs and issues
- **API Interaction Tools**: Structured interfaces for common development APIs
- **Service Authentication**: Secure credential management for external services

### Specialized Skills
- **Code Analysis**: Pattern recognition and codebase understanding tools
- **Testing Workflows**: Automated test generation and execution patterns
- **Deployment Pipelines**: Agent-friendly CI/CD integration tools
- **Documentation Generation**: Automatic documentation creation and maintenance

### Advanced File System Operations
- **Intelligent Search**: Context-aware file and code pattern discovery
- **Version Control Integration**: Enhanced git operations for agent workflows
- **Project Structure Analysis**: Codebase architecture understanding tools

## Agent Integration

This toolkit is specifically designed for AI coding agents and MMLMs. Key integration benefits:

- **Direct Access**: No protocol overhead compared to traditional MCP implementations
- **Structured Output**: Machine-readable logs and responses with preserved human readability
- **Context Preservation**: Tools maintain execution context and metadata for better agent understanding
- **Error Handling**: Robust error reporting and exit code preservation

## Contributing

As you discover patterns that make development more agent-friendly, add them here. Each tool should:
- Solve a specific agent-workflow problem
- Be self-contained and reusable
- Include usage documentation in comments
- Follow the agent-first design philosophy
- Maintain compatibility with existing development processes
