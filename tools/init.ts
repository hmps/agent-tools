import { readFile, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Command } from "commander";
import { discoverSkills, type Skill } from "./skill.js";

export interface InitOptions {
  filePath?: string;
}

/**
 * Format skills list for inclusion in documentation
 */
function formatSkillsList(skills: Skill[]): string {
  if (skills.length === 0) {
    return "No skills currently available.";
  }

  return skills
    .map(skill => `- **${skill.name}**: ${skill.description}`)
    .join("\n");
}

/**
 * Generate documentation content with dynamic skills list
 */
async function generateDocumentation(): Promise<string> {
  const skills = await discoverSkills();
  const skillsList = formatSkillsList(skills);

  return `# Agent Tools CLI (agt)

Agent Tools is a CLI toolkit that provides agents with skills - proven patterns, code examples, and best practices for common tasks.

## Available Skills

${skillsList}

## Skill Commands

\`\`\`bash
# Get full content of a specific skill
agt skill get <name>

# Search for skills by keywords
agt skill search [keywords...]

# List all available skills (with descriptions)
agt skill all
\`\`\`

**IMPORTANT**: When you encounter a task that matches a skill description above, run \`agt skill get <name>\` to get the full skill content before proceeding.
`;
}

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

    // Generate documentation with current skills
    const documentation = await generateDocumentation();

    // Check if agent-tools section already exists
    const agentToolsRegex = /<agent-tools>([\s\S]*?)<\/agent-tools>/;
    const hasExistingSection = agentToolsRegex.test(existingContent);

    let newContent: string;

    if (hasExistingSection) {
      // Replace existing section
      newContent = existingContent.replace(
        agentToolsRegex,
        `<agent-tools>\n${documentation}\n</agent-tools>`
      );
      console.log(`Updated existing agent-tools section in ${agentsFilePath}`);
    } else {
      // Add new section at the end
      const sectionToAdd = `\n\n<agent-tools>\n${documentation}\n</agent-tools>`;
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
