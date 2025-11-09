#!/usr/bin/env bun

/**
 * agt - Agent Tools CLI
 * 
 * A CLI tool for searching and fetching agent skills.
 * Designed for LLM consumption with plain text output.
 * 
 * Usage:
 *   agt skill search [keywords...]
 *   agt skill all
 *   agt skill get <skill-name>
 */

import { Command } from "commander";
import { registerSkillCommands } from "../tools/skill.js";

/**
 * Main CLI program
 */
const program = new Command();

program
  .name("agt")
  .description("Agent Tools CLI - Search and fetch agent skills")
  .version("1.0.0")
  .addHelpText(
    "after",
    "\nOutput format is designed for LLM consumption (plain text, structured)."
  );

// Register all skill-related commands
registerSkillCommands(program);

// Parse and execute
program.parse();