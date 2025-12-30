/**
 * TaskFlow CLI - Agent Commands
 *
 * CLI commands for agent management and direct invocation.
 *
 * @module commands/agent
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getCoordinator } from '../../agents/coordinator/index.js';
// Agent registry is accessed via coordinator
import type { AgentInfo, AgentResponse } from '../../lib/types.js';

// Ensure reasoning agent is registered
import { getReasoningAgent } from '../../agents/reasoning-agent/index.js';
getReasoningAgent();

/**
 * Format agent info for display.
 */
function formatAgentInfo(agent: AgentInfo): string {
  const statusColors: Record<string, (s: string) => string> = {
    active: chalk.green,
    inactive: chalk.yellow,
    error: chalk.red,
  };

  const statusColor = statusColors[agent.status] ?? chalk.white;

  return [
    `${chalk.bold(agent.displayName)} (${chalk.cyan(agent.name)})`,
    `  Status: ${statusColor(agent.status)}`,
    `  ${agent.description}`,
    `  Capabilities: ${agent.capabilities.map((c) => chalk.cyan(c)).join(', ')}`,
  ].join('\n');
}

/**
 * Format agents as a table.
 */
function formatAgentTable(agents: AgentInfo[]): string {
  const lines: string[] = [];
  lines.push(
    chalk.bold(
      `${'NAME'.padEnd(20)} ${'STATUS'.padEnd(10)} ${'CAPABILITIES'.padEnd(40)}`
    )
  );
  lines.push(chalk.gray('─'.repeat(75)));

  for (const agent of agents) {
    const name = agent.name.padEnd(20);
    const status = agent.status.padEnd(10);
    const capabilities = agent.capabilities.slice(0, 4).join(', ').padEnd(40);

    const statusColor =
      agent.status === 'active'
        ? chalk.green
        : agent.status === 'error'
        ? chalk.red
        : chalk.yellow;

    lines.push(`${name} ${statusColor(status)} ${capabilities}`);
  }

  lines.push(chalk.gray('─'.repeat(75)));
  lines.push(chalk.gray(`Total: ${agents.length} agent(s)`));

  return lines.join('\n');
}

/**
 * Register agent commands with the program.
 */
export function registerAgentCommands(program: Command): void {
  const agent = program.command('agent').description('Agent management commands');

  // agent list
  agent
    .command('list')
    .description('List all available agents')
    .action(async () => {
      const parentOpts = program.opts();
      const coordinator = getCoordinator();

      const response = await coordinator.execute<AgentInfo[]>({
        action: 'listAgents',
        params: {},
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(formatAgentTable(response.data ?? []));
      }
    });

  // agent status
  agent
    .command('status')
    .description('Get status of a specific agent')
    .argument('<name>', 'Agent name')
    .action(async (name: string) => {
      const parentOpts = program.opts();
      const coordinator = getCoordinator();

      const response = await coordinator.execute<AgentInfo>({
        action: 'getAgentStatus',
        params: { name },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else if (response.data) {
        console.log(formatAgentInfo(response.data));
      }
    });

  // agent invoke
  agent
    .command('invoke')
    .description('Invoke an agent directly')
    .argument('<name>', 'Agent name')
    .requiredOption('-a, --action <action>', 'Action to perform')
    .option('--params <json>', 'JSON string of parameters', '{}')
    .action(async (name: string, options) => {
      const parentOpts = program.opts();
      const coordinator = getCoordinator();

      let params: Record<string, unknown>;
      try {
        params = JSON.parse(options.params);
      } catch {
        console.error(chalk.red('Error: Invalid JSON in --params'));
        process.exit(1);
      }

      const response = await coordinator.execute<AgentResponse>({
        action: 'route',
        params: {
          agent: name,
          action: options.action,
          params,
        },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      // The routed response is nested
      const routedResponse = response.data as AgentResponse;

      if (parentOpts.json) {
        console.log(JSON.stringify(routedResponse, null, 2));
      } else {
        if (routedResponse?.success) {
          console.log(chalk.green('Agent invocation successful:'));
          console.log(JSON.stringify(routedResponse.data, null, 2));
        } else {
          console.error(chalk.red(`Agent error: ${routedResponse?.error}`));
          process.exit(1);
        }
      }
    });
}
