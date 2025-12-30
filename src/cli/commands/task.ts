/**
 * TaskFlow CLI - Task Commands
 *
 * CLI commands for task management operations.
 *
 * @module commands/task
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getTaskAgent } from '../../agents/task-agent/index.js';
import { getNotificationAgent } from '../../agents/notification-agent/index.js';
import { config } from '../../lib/config.js';
import type { Task, CreateTaskInput } from '../../lib/types.js';

/**
 * Format a task for display.
 */
function formatTask(task: Task, verbose = false): string {
  const statusColors: Record<string, (s: string) => string> = {
    pending: chalk.yellow,
    in_progress: chalk.blue,
    done: chalk.green,
    cancelled: chalk.gray,
  };

  const priorityColors: Record<string, (s: string) => string> = {
    urgent: chalk.red.bold,
    high: chalk.red,
    medium: chalk.yellow,
    low: chalk.gray,
  };

  const statusColor = statusColors[task.status] ?? chalk.white;
  const priorityColor = priorityColors[task.priority] ?? chalk.white;

  let output = `${chalk.cyan(task.id.slice(0, 8))} ${task.title}`;
  output += `  ${statusColor(task.status)} ${priorityColor(task.priority)}`;

  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const isOverdue = due < new Date() && task.status !== 'done';
    const dueStr = due.toLocaleDateString();
    output += isOverdue ? chalk.red(` (due: ${dueStr})`) : chalk.gray(` (due: ${dueStr})`);
  }

  if (verbose && task.description) {
    output += `\n  ${chalk.gray(task.description)}`;
  }

  if (verbose && task.tags.length > 0) {
    output += `\n  ${chalk.gray('tags:')} ${task.tags.map((t) => chalk.cyan(t)).join(', ')}`;
  }

  return output;
}

/**
 * Format tasks as a table.
 */
function formatTaskTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return chalk.gray('No tasks found.');
  }

  const lines: string[] = [];
  lines.push(
    chalk.bold(
      `${'ID'.padEnd(10)} ${'TITLE'.padEnd(30)} ${'STATUS'.padEnd(12)} ${'PRIORITY'.padEnd(10)} ${'DUE DATE'.padEnd(12)}`
    )
  );
  lines.push(chalk.gray('─'.repeat(80)));

  for (const task of tasks) {
    const id = task.id.slice(0, 8).padEnd(10);
    const title = task.title.slice(0, 28).padEnd(30);
    const status = task.status.padEnd(12);
    const priority = task.priority.padEnd(10);
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString().padEnd(12) : '-'.padEnd(12);

    lines.push(`${id} ${title} ${status} ${priority} ${dueDate}`);
  }

  lines.push(chalk.gray('─'.repeat(80)));
  lines.push(chalk.gray(`Total: ${tasks.length} task(s)`));

  return lines.join('\n');
}

/**
 * Output result as JSON or formatted text.
 */
function output(data: unknown, options: { json?: boolean }): void {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
  } else if (Array.isArray(data)) {
    console.log(formatTaskTable(data as Task[]));
  } else {
    console.log(formatTask(data as Task, true));
  }
}

/**
 * Register task commands with the program.
 */
export function registerTaskCommands(program: Command): void {
  const task = program.command('task').description('Task management commands');

  // task create
  task
    .command('create')
    .description('Create a new task')
    .argument('<title>', 'Task title')
    .option('-d, --description <desc>', 'Task description')
    .option('-p, --priority <level>', 'Priority (low, medium, high, urgent)', 'medium')
    .option('--due <date>', 'Due date (ISO 8601 format)')
    .option('-t, --tags <tags>', 'Comma-separated tags')
    .action(async (title: string, options) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const input: CreateTaskInput = {
        title,
        description: options.description,
        priority: options.priority,
        dueDate: options.due,
        tags: options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [],
      };

      const response = await agent.execute<Task>({
        action: 'create',
        params: input as unknown as Record<string, unknown>,
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      // Create notification if enabled
      if (config.features.enableNotifications && response.data) {
        const notificationAgent = getNotificationAgent();
        await notificationAgent.notifyTaskCreated(response.data.id, response.data.title);
      }

      if (!parentOpts.json) {
        console.log(chalk.green('Task created successfully!'));
      }
      output(response.data, parentOpts);
    });

  // task list
  task
    .command('list')
    .description('List all tasks')
    .option('-s, --status <status>', 'Filter by status')
    .option('-p, --priority <priority>', 'Filter by priority')
    .option('-n, --limit <number>', 'Maximum number of tasks', '50')
    .action(async (options) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const response = await agent.execute<Task[]>({
        action: 'list',
        params: {
          status: options.status,
          priority: options.priority,
          limit: parseInt(options.limit, 10),
        },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      output(response.data, parentOpts);
    });

  // task get
  task
    .command('get')
    .description('Get a specific task by ID')
    .argument('<id>', 'Task ID')
    .action(async (id: string) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const response = await agent.execute<Task>({
        action: 'get',
        params: { id },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      output(response.data, parentOpts);
    });

  // task update
  task
    .command('update')
    .description('Update an existing task')
    .argument('<id>', 'Task ID')
    .option('--title <title>', 'New title')
    .option('-d, --description <desc>', 'New description')
    .option('-s, --status <status>', 'New status')
    .option('-p, --priority <priority>', 'New priority')
    .option('--due <date>', 'New due date')
    .option('-t, --tags <tags>', 'New comma-separated tags')
    .action(async (id: string, options) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      const params: Record<string, unknown> = { id };

      if (options.title) params['title'] = options.title;
      if (options.description) params['description'] = options.description;
      if (options.status) params['status'] = options.status;
      if (options.priority) params['priority'] = options.priority;
      if (options.due) params['dueDate'] = options.due;
      if (options.tags) params['tags'] = options.tags.split(',').map((t: string) => t.trim());

      const response = await agent.execute<Task>({
        action: 'update',
        params,
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      // Create notification if enabled
      if (config.features.enableNotifications && response.data) {
        const notificationAgent = getNotificationAgent();
        if (options.status === 'done') {
          await notificationAgent.notifyTaskCompleted(response.data.id, response.data.title);
        } else {
          await notificationAgent.notifyTaskUpdated(response.data.id, response.data.title);
        }
      }

      if (!parentOpts.json) {
        console.log(chalk.green('Task updated successfully!'));
      }
      output(response.data, parentOpts);
    });

  // task delete
  task
    .command('delete')
    .description('Delete a task')
    .argument('<id>', 'Task ID')
    .option('-f, --force', 'Skip confirmation')
    .action(async (id: string, _options) => {
      const agent = getTaskAgent();
      const parentOpts = program.opts();

      // TODO: Add confirmation prompt if not --force

      const response = await agent.execute<{ deleted: boolean; id: string }>({
        action: 'delete',
        params: { id },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.green(`Task ${id.slice(0, 8)} deleted successfully.`));
      }
    });
}
