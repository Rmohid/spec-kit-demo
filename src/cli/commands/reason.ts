/**
 * TaskFlow CLI - Reason Command
 *
 * CLI command for invoking the Reasoning Agent.
 *
 * @module commands/reason
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getReasoningAgent } from '../../agents/reasoning-agent/index.js';
import type { ReasoningResult, ReasoningStep } from '../../lib/types.js';

/**
 * Format a reasoning step for display.
 */
function formatStep(step: ReasoningStep): string {
  const phaseColors: Record<string, (s: string) => string> = {
    observe: chalk.blue,
    think: chalk.yellow,
    plan: chalk.magenta,
    act: chalk.green,
    reflect: chalk.cyan,
  };

  const color = phaseColors[step.phase] ?? chalk.white;
  const header = color(`[Step ${step.stepNumber}] ${step.phase.toUpperCase()}`);
  const duration = chalk.gray(`(${step.durationMs}ms)`);

  return [
    `${header} ${duration}`,
    chalk.gray('Input:'),
    step.input.split('\n').map((l) => `  ${l}`).join('\n'),
    chalk.gray('Output:'),
    step.output.split('\n').map((l) => `  ${l}`).join('\n'),
    '',
  ].join('\n');
}

/**
 * Format reasoning result for display.
 */
function formatResult(result: ReasoningResult, showSteps: boolean): string {
  const lines: string[] = [];

  // Header
  lines.push(chalk.bold.cyan('═══════════════════════════════════════════════════════════════'));
  lines.push(chalk.bold.cyan('                    REASONING RESULT'));
  lines.push(chalk.bold.cyan('═══════════════════════════════════════════════════════════════'));
  lines.push('');

  // Goal
  lines.push(chalk.bold('Goal:'));
  lines.push(`  ${result.goal}`);
  lines.push('');

  // Show steps if requested
  if (showSteps && result.steps.length > 0) {
    lines.push(chalk.bold('Reasoning Steps:'));
    lines.push(chalk.gray('───────────────────────────────────────────────────────────────'));
    for (const step of result.steps) {
      lines.push(formatStep(step));
    }
    lines.push(chalk.gray('───────────────────────────────────────────────────────────────'));
    lines.push('');
  }

  // Result summary
  lines.push(chalk.bold('Analysis:'));
  lines.push('');
  lines.push(result.result);
  lines.push('');

  // Confidence
  const confidencePercent = Math.round(result.confidence * 100);
  const confidenceBar = '█'.repeat(Math.round(result.confidence * 20));
  const emptyBar = '░'.repeat(20 - Math.round(result.confidence * 20));
  lines.push(
    chalk.bold('Confidence:'),
    `  ${chalk.green(confidenceBar)}${chalk.gray(emptyBar)} ${confidencePercent}%`
  );
  lines.push('');

  // Recommendations
  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('Recommendations:'));
    result.recommendations.forEach((rec, i) => {
      lines.push(`  ${chalk.cyan(`${i + 1}.`)} ${rec}`);
    });
    lines.push('');
  }

  // Footer
  lines.push(chalk.gray('───────────────────────────────────────────────────────────────'));
  lines.push(chalk.gray(`Session: ${result.sessionId}`));
  lines.push(chalk.gray(`Duration: ${result.totalDurationMs}ms`));
  lines.push(chalk.gray(`Steps: ${result.steps.length}`));

  return lines.join('\n');
}

/**
 * Register the reason command with the program.
 */
export function registerReasonCommand(program: Command): void {
  program
    .command('reason')
    .description('Invoke the reasoning agent to analyze tasks and provide recommendations')
    .argument('<goal>', 'What you want the reasoning agent to analyze or decide')
    .option('-m, --max-iterations <number>', 'Maximum reasoning iterations', '10')
    .option('--show-steps', 'Show detailed reasoning steps', false)
    .option('--timeout <ms>', 'Timeout in milliseconds', '30000')
    .action(async (goal: string, options) => {
      const parentOpts = program.opts();
      const agent = getReasoningAgent();

      console.log(chalk.cyan('🤔 Thinking...'));
      console.log('');

      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: {
          goal,
          maxIterations: parseInt(options.maxIterations, 10),
          timeoutMs: parseInt(options.timeout, 10),
          includeSteps: options.showSteps || parentOpts.json,
        },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else if (response.data) {
        console.log(formatResult(response.data, options.showSteps));
      }
    });
}
