# agent-tools

A collection of utility tools designed for working with AI agents, capturing patterns that make development workflows agent-friendly.

## Motivation

Working with AI agents introduces new patterns and requirements. For example, logs need to be accessible both to agents (for debugging and context) and to humans (for review and monitoring). This repository collects these agent-friendly tools as they're discovered across different projects.

The collection will grow over time as more patterns emerge from real-world agent interactions.

## Installation

Run the install script to add all tools to your PATH:

```bash
./install.sh
```

This creates symlinks in `~/.local/bin` for each tool and updates your shell configuration (`.bashrc` or `.zshrc`) if needed.

## Available Tools

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
├── tools/          # Individual tool scripts
│   └── logdev.sh   # Development logging wrapper
└── install.sh      # Installation script
```

Tools in the `tools/` directory are installed as symlinks to `~/.local/bin`, making them available system-wide while keeping the source files editable in this repository.

## Contributing

As you discover patterns that make development more agent-friendly, add them here. Each tool should:
- Solve a specific agent-workflow problem
- Be self-contained and reusable
- Include usage documentation in comments
