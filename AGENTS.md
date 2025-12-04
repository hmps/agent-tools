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

Agent Tools is a CLI toolkit that provides agents with skills - proven patterns, code examples, and best practices for common tasks.

## Available Skills

- **test-driven-development**: Use when implementing any feature or bugfix, before writing implementation code - write the test first, watch it fail, write minimal code to pass; ensures tests actually verify behavior by requiring failure first
- **playwright**: Complete browser automation with Playwright. Auto-detects dev servers, writes clean test scripts to /tmp. Test pages, fill forms, take screenshots, check responsive design, validate UX, test login flows, check links, automate any browser task. Use when user wants to test websites, automate browser interactions, validate web functionality, or perform any browser-based testing.
- **extract-learnings**: Use after completing a session to identify genuine learnings from mistakes, corrections, or rework - focuses only on patterns that were actually wrong, not things that worked correctly the first time
- **writing-plans**: Create detailed implementation plans with bite-sized tasks for engineers with zero codebase context. Use this when design is complete and you need detailed implementation tasks for engineers with zero codebase context
- **receiving-code-review**: Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation
- **subagent-driven-development**: Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates
- **using-git-worktree**: Create isolated git worktrees at bare repo root level

## Skill Commands

```bash
# Get full content of a specific skill
agt skill get <name>

# Search for skills by keywords
agt skill search [keywords...]

# List all available skills (with descriptions)
agt skill all
```

**IMPORTANT**: When you encounter a task that matches a skill description above, run `agt skill get <name>` to get the full skill content before proceeding.

</agent-tools>