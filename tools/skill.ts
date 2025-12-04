import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";

// PROJECT_ROOT is injected at build time via --define flag
// Falls back to import.meta.url resolution for development
declare const PROJECT_ROOT: string | undefined;

export function getProjectRoot(): string {
  if (typeof PROJECT_ROOT !== "undefined") {
    return PROJECT_ROOT;
  }
  // Fallback for development (running via bun src/index.ts)
  const { dirname } = require("node:path");
  const { fileURLToPath } = require("node:url");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, "..");
}

const SKILLS_DIR = join(getProjectRoot(), "skills");

export interface Skill {
  name: string;
  description: string;
  path: string;
}

/**
 * Parse YAML frontmatter from a SKILL.md file
 */
function parseFrontmatter(content: string): { name: string; description: string } | null {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  const frontmatter = match?.[1];

  if (!frontmatter) {
    return null;
  }

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  const name = nameMatch?.[1];
  const description = descMatch?.[1];

  if (!name || !description) {
    return null;
  }

  return {
    name: name.trim(),
    description: description.trim(),
  };
}

/**
 * Strip YAML frontmatter from content
 */
function stripFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  return content.replace(frontmatterRegex, '');
}

/**
 * Discover all skills in the skills/ directory
 */
export async function discoverSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    const entries = await readdir(SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = join(SKILLS_DIR, entry.name);
        const skillFile = join(skillPath, "SKILL.md");

        try {
          const content = await readFile(skillFile, "utf-8");
          const metadata = parseFrontmatter(content);

          if (metadata) {
            skills.push({
              name: metadata.name,
              description: metadata.description,
              path: `skills/${entry.name}`,
            });
          }
        } catch (err) {
          // Skip directories without SKILL.md
          continue;
        }
      }
    }
  } catch (err) {
    console.error(`Error: Cannot read skills directory: ${SKILLS_DIR}`);
    process.exit(1);
  }

  return skills;
}

/**
 * Print skills in LLM-friendly format
 */
export function printSkills(skills: Skill[]): void {
  if (skills.length === 0) {
    console.log("No skills found.");
    return;
  }

  for (const skill of skills) {
    console.log(`SKILL: ${skill.name}`);
    console.log(`DESCRIPTION: ${skill.description}`);
    console.log(`CMD: agt skill get ${skill.name}`);
    console.log(); // Blank line separator
  }
}

/**
 * Search skills by keywords
 */
export async function searchSkills(keywords: string[]): Promise<void> {
  const skills = await discoverSkills();

  if (keywords.length === 0) {
    // No keywords - return all skills
    printSkills(skills);
    return;
  }

  // Filter skills that match any keyword (case-insensitive)
  const searchTerms = keywords.map(k => k.toLowerCase());
  const matches = skills.filter(skill => {
    const searchText = `${skill.name} ${skill.description}`.toLowerCase();
    return searchTerms.some(term => searchText.includes(term));
  });

  printSkills(matches);
}

/**
 * List all available skills
 */
export async function listAllSkills(): Promise<void> {
  const skills = await discoverSkills();
  printSkills(skills);
}

/**
 * Get a specific skill's full content
 */
export async function getSkill(skillName: string): Promise<void> {
  const skills = await discoverSkills();
  const skill = skills.find(s => s.name === skillName);

  if (!skill) {
    console.error(`Error: Skill '${skillName}' not found.`);
    process.exit(1);
  }

  const skillFile = join(getProjectRoot(), skill.path, "SKILL.md");

  try {
    const content = await readFile(skillFile, "utf-8");
    const contentWithoutFrontmatter = stripFrontmatter(content);
    console.log(contentWithoutFrontmatter);
  } catch (err) {
    console.error(`Error: Cannot read skill file: ${skillFile}`);
    process.exit(1);
  }
}

/**
 * Register skill commands with the main program
 */
export function registerSkillCommands(program: Command): void {
  // Skill command group - all skill operations under one namespace
  const skill = program.command("skill").description("Manage agent skills");

  skill
    .command("search")
    .description("Search for skills by keywords")
    .argument("[keywords...]", "Keywords to search for")
    .action(async (keywords: string[]) => {
      await searchSkills(keywords);
    });

  skill
    .command("all")
    .description("List all available skills")
    .action(async () => {
      await listAllSkills();
    });

  skill
    .command("get")
    .description("Get full content of a skill")
    .argument("<name>", "Skill name")
    .action(async (name: string) => {
      await getSkill(name);
    });
}
