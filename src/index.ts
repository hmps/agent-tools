#!/usr/bin/env bun

/**
 * agt - Agent Tools CLI
 * 
 * A comprehensive CLI toolkit providing agents with access to a suite of tools
 * for interacting with internal and external services. Includes skill management,
 * service integrations, and utility functions designed for LLM consumption.
 * 
 * Usage:
 *   agt skill search [keywords...]
 *   agt skill all
 *   agt skill get <skill-name>
 */

import { Command } from "commander";
import { registerSkillCommands } from "../tools/skill.js";
import { registerInitCommands } from "../tools/init.js";

/**
 * Main CLI program
 */
const program = new Command();

program
  .name("agt")
  .description("Agent Tools CLI - A comprehensive toolkit for agents to interact with internal and external services")
  .version("1.0.0")
  .addHelpText(
    "after",
    "\nProvides agents with tools for:\n" +
    "  • Skill management and discovery\n" +
    "  • Service integrations and API interactions\n" +
    "  • Utility functions for common tasks\n" +
    "\nOutput format is designed for LLM consumption (plain text, structured)."
  );

// Register all skill-related commands
registerSkillCommands(program);

// Register init commands
registerInitCommands(program);

// Parse and execute
program.parse();