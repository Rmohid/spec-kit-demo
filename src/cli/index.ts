#!/usr/bin/env node
/**
 * TaskFlow CLI - Main Entry Point
 *
 * Multi-agent task management CLI demonstrating Spec-Driven Development.
 *
 * @module cli
 */

import { Command } from 'commander';
import { registerTaskCommands } from './commands/task.js';
import { registerAgentCommands } from './commands/agent.js';
import { registerNotificationCommands } from './commands/notifications.js';
import { logger } from '../lib/logger.js';

/**
 * Create and configure the CLI program.
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name('taskflow')
    .description(
      'Multi-agent task management CLI demonstrating Spec-Driven Development with GitHub Spec Kit'
    )
    .version('1.0.0')
    .option('--json', 'Output results as JSON', false)
    .option('--verbose', 'Enable verbose output', false);

  // Register command modules
  registerTaskCommands(program);
  registerAgentCommands(program);
  registerNotificationCommands(program);

  // Global error handler
  program.exitOverride((err) => {
    if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
      process.exit(0);
    }
    if (err.code === 'commander.version') {
      process.exit(0);
    }
    logger.error('CLI error', { code: err.code, message: err.message });
    process.exit(1);
  });

  return program;
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
  const program = createProgram();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unhandled error', { error: message });
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

// Run the CLI
main();
