# Agent Tools - Development Guide

## Build & Test Commands
- **Run**: `bun src/index.ts` or `bun run agt`
- **Test**: `bun test` (no tests currently defined)
- **Type Check**: Use TypeScript with strict mode enabled
- **Install**: `bun install`

## Code Style & Conventions
- **Runtime**: Use Bun APIs instead of Node.js (`Bun.file` over `node:fs`, etc.)
- **Imports**: Use `.js` extensions for imports, Node.js built-ins with `node:` prefix
- **Types**: Strict TypeScript with `noUncheckedIndexedAccess`, explicit interfaces
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Comments**: JSDoc for exported functions, inline for complex logic
- **Error Handling**: Use try/catch with meaningful error messages, `process.exit(1)` for CLI errors
- **File Structure**: Tools in `tools/`, skills in `skills/`, main entry in `src/`
- **CLI**: Use Commander.js, organize commands in separate modules with register functions
- **Async**: Always use async/await, handle Promise rejections properly

<agent-tools>
# Agent Tools CLI (agt)

Agent Tools is a comprehensive CLI toolkit available in this environment that provides agents with enhanced capabilities for skill management, service integrations, and utility functions.

Agent Tools is designed for LLM consumption with:
- Plain text, structured output optimized for agent parsing
- Direct access to skill repository containing development best practices

## How to Use Agent Tools in Your Work

1. **Discover relevant commands**: `agt --help` will list all available commands and their descriptions.
2. Find a short description of each command below.

## Available Commands

### Skill Management
The `agt skill` command helps you discover and utilize pre-built agent skills:

```bash
# Search for skills by keywords
agt skill search [keywords...]

# List all available skills
agt skill all

# Get full content of a specific skill
agt skill get <name>
```

**Use skills to enhance your capabilities**: Skills contain proven patterns, code examples, and best practices that you can apply to solve common problems more effectively.

**Recommendation**: Proactively use `agt skill search` when starting complex tasks to discover relevant skills that can guide your implementation approach.

</agent-tools>