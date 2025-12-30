/**
 * TaskFlow CLI - Notification Commands
 *
 * CLI commands for notification management.
 *
 * @module commands/notifications
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getNotificationAgent } from '../../agents/notification-agent/index.js';
import type { Notification } from '../../lib/types.js';

/**
 * Format a notification for display.
 */
function formatNotification(notification: Notification): string {
  const typeIcons: Record<string, string> = {
    task_created: '✨',
    task_updated: '📝',
    task_completed: '✅',
    task_overdue: '⚠️',
  };

  const icon = typeIcons[notification.type] ?? '📢';
  const readStatus = notification.read ? chalk.gray('(read)') : chalk.yellow('(unread)');
  const date = new Date(notification.createdAt).toLocaleString();

  return `${icon} ${notification.message} ${readStatus}\n   ${chalk.gray(date)}`;
}

/**
 * Format notifications as a list.
 */
function formatNotificationList(notifications: Notification[]): string {
  if (notifications.length === 0) {
    return chalk.gray('No notifications found.');
  }

  const lines: string[] = [];
  lines.push(chalk.bold('Notifications'));
  lines.push(chalk.gray('─'.repeat(60)));

  for (const notification of notifications) {
    lines.push(formatNotification(notification));
    lines.push('');
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  if (unreadCount > 0) {
    lines.push(chalk.yellow(`${unreadCount} unread notification(s)`));
  }

  return lines.join('\n');
}

/**
 * Register notification commands with the program.
 */
export function registerNotificationCommands(program: Command): void {
  const notifications = program
    .command('notifications')
    .description('Notification management commands');

  // notifications list
  notifications
    .command('list')
    .description('List notifications')
    .option('-u, --unread', 'Show only unread notifications')
    .option('-n, --limit <number>', 'Maximum number of notifications', '20')
    .action(async (options) => {
      const parentOpts = program.opts();
      const agent = getNotificationAgent();

      const response = await agent.execute<Notification[]>({
        action: 'list',
        params: {
          unread: options.unread,
          limit: parseInt(options.limit, 10),
        },
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(formatNotificationList(response.data ?? []));
      }
    });

  // notifications clear
  notifications
    .command('clear')
    .description('Mark all notifications as read')
    .action(async () => {
      const parentOpts = program.opts();
      const agent = getNotificationAgent();

      const response = await agent.execute<{ cleared: number }>({
        action: 'clear',
        params: {},
      });

      if (!response.success) {
        console.error(chalk.red(`Error: ${response.error}`));
        process.exit(1);
      }

      if (parentOpts.json) {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        const cleared = response.data?.cleared ?? 0;
        if (cleared > 0) {
          console.log(chalk.green(`✓ Cleared ${cleared} notification(s)`));
        } else {
          console.log(chalk.gray('No notifications to clear.'));
        }
      }
    });
}
