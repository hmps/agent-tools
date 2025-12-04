import { readFile, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Command } from "commander";

export interface InitOptions {
  filePath?: string;
}

/**
 * Default content to add to AGENTS.md about agent-tools
 */
const AGENT_TOOLS_DOCUMENTATION = `# Agent Tools CLI (agt)

Agent Tools is a comprehensive CLI toolkit available in this environment that provides agents with enhanced capabilities for skill management, service integrations, and utility functions.

Agent Tools is designed for LLM consumption with:
- Plain text, structured output optimized for agent parsing
- Direct access to skill repository containing development best practices

## How to Use Agent Tools in Your Work

1. **Discover relevant commands**: \`agt --help\` will list all available commands and their descriptions.
2. Find a short description of each command below.

## Available Commands

\`agt get-dir\` get the root directory of the agent-tools project. This is useful for accessing the skill repository and other resources.

### Skill Management
The \`agt skill\` command helps you discover and utilize pre-built agent skills:

\`\`\`bash
# Search for skills by keywords
agt skill search [keywords...]

# List all available skills
agt skill all

# Get full content of a specific skill
agt skill get <name>
\`\`\`

**Use skills to enhance your capabilities**: Skills contain proven patterns, code examples, and best practices that you can apply to solve common problems more effectively.

**Recommendation**: Proactively use \`agt skill search\` when starting complex tasks to discover relevant skills that can guide your implementation approach.
`;

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize agent-tools documentation in AGENTS.md
 */
export async function initAgentTools(options: InitOptions = {}): Promise<void> {
  const agentsFilePath = options.filePath ? resolve(options.filePath) : join(process.cwd(), "AGENTS.md");

  // Check if AGENTS.md exists
  if (!(await fileExists(agentsFilePath))) {
    console.error(`Error: File not found: ${agentsFilePath}`);
    console.error(`Please ensure the file exists before running agt init`);
    process.exit(1);
  }

  try {
    // Read existing content
    const existingContent = await readFile(agentsFilePath, "utf-8");

    // Check if agent-tools section already exists
    const agentToolsRegex = /<agent-tools>([\s\S]*?)<\/agent-tools>/;
    const hasExistingSection = agentToolsRegex.test(existingContent);

    let newContent: string;

    if (hasExistingSection) {
      // Replace existing section
      newContent = existingContent.replace(
        agentToolsRegex,
        `<agent-tools>\n${AGENT_TOOLS_DOCUMENTATION}\n</agent-tools>`
      );
      console.log(`Updated existing agent-tools section in ${agentsFilePath}`);
    } else {
      // Add new section at the end
      const sectionToAdd = `\n\n<agent-tools>\n${AGENT_TOOLS_DOCUMENTATION}\n</agent-tools>`;
      newContent = existingContent + sectionToAdd;
      console.log(`Added new agent-tools section to ${agentsFilePath}`);
    }

    // Write updated content
    await writeFile(agentsFilePath, newContent, "utf-8");
    console.log(`Successfully updated ${agentsFilePath}`);

  } catch (err) {
    console.error(`Error: Failed to update ${agentsFilePath}:`, err);
    process.exit(1);
  }
}

/**
 * Register init commands with the main program
 */
export function registerInitCommands(program: Command): void {
  program
    .command("init")
    .description("Initialize agent-tools documentation in AGENTS.md")
    .option("--file-path <path>", "Full path to the agents file (default: AGENTS.md in current directory)")
    .action(async (options: InitOptions) => {
      await initAgentTools(options);
    });
}
