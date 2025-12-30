/**
 * TaskFlow CLI - Notification Agent
 *
 * Handles task event notifications.
 * Creates and manages notifications for task lifecycle events.
 *
 * @module notification-agent
 */

import { BaseAgent } from '../base-agent.js';
import { getStorage } from '../../lib/storage.js';
import { validate, NotificationFiltersSchema } from '../../lib/validators.js';
import type { Notification, NotificationFilters, NotificationType } from '../../lib/types.js';

/**
 * Notification Agent - Manages task notifications.
 *
 * Capabilities:
 * - notify: Create a notification for a task event
 * - list: List notifications with optional filters
 * - clear: Mark all notifications as read
 *
 * @example
 * const agent = new NotificationAgent();
 *
 * // Create a notification
 * await agent.execute({
 *   action: 'notify',
 *   params: { type: 'task_created', taskId: 'abc123', message: 'Task created' }
 * });
 *
 * // List unread notifications
 * const response = await agent.execute({
 *   action: 'list',
 *   params: { unread: true }
 * });
 */
export class NotificationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'notification-agent',
      displayName: 'Notification Agent',
      description: 'Manages task event notifications',
      capabilities: ['notify', 'list', 'clear'],
    });
  }

  /**
   * Handle notification-related actions.
   */
  protected async handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case 'notify':
        return this.createNotification(params);
      case 'list':
        return this.listNotifications(params);
      case 'clear':
        return this.clearNotifications();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Create a notification for a task event.
   */
  private createNotification(params: Record<string, unknown>): Notification {
    this.validateParams(params, ['type', 'taskId', 'message']);

    const type = params['type'] as NotificationType;
    const taskId = params['taskId'] as string;
    const message = params['message'] as string;

    const storage = getStorage();
    const notification = storage.createNotification(type, taskId, message);

    this.logger.debug('Notification created', { type, taskId });
    return notification;
  }

  /**
   * List notifications with optional filters.
   */
  private listNotifications(params: Record<string, unknown>): Notification[] {
    const filters = validate(NotificationFiltersSchema, params) as NotificationFilters;

    const storage = getStorage();
    const notifications = storage.listNotifications(filters);

    this.logger.debug('Notifications listed', { count: notifications.length });
    return notifications;
  }

  /**
   * Mark all notifications as read.
   */
  private clearNotifications(): { cleared: number } {
    const storage = getStorage();
    const cleared = storage.markAllNotificationsRead();

    this.logger.info('Notifications cleared', { count: cleared });
    return { cleared };
  }

  // ===========================================================================
  // Helper Methods for Other Agents
  // ===========================================================================

  /**
   * Notify about task creation.
   * Called by TaskAgent after creating a task.
   */
  async notifyTaskCreated(taskId: string, title: string): Promise<void> {
    await this.execute({
      action: 'notify',
      params: {
        type: 'task_created',
        taskId,
        message: `Task created: ${title}`,
      },
    });
  }

  /**
   * Notify about task update.
   */
  async notifyTaskUpdated(taskId: string, title: string): Promise<void> {
    await this.execute({
      action: 'notify',
      params: {
        type: 'task_updated',
        taskId,
        message: `Task updated: ${title}`,
      },
    });
  }

  /**
   * Notify about task completion.
   */
  async notifyTaskCompleted(taskId: string, title: string): Promise<void> {
    await this.execute({
      action: 'notify',
      params: {
        type: 'task_completed',
        taskId,
        message: `Task completed: ${title}`,
      },
    });
  }

  /**
   * Notify about overdue task.
   */
  async notifyTaskOverdue(taskId: string, title: string): Promise<void> {
    await this.execute({
      action: 'notify',
      params: {
        type: 'task_overdue',
        taskId,
        message: `Task overdue: ${title}`,
      },
    });
  }
}

// Export singleton instance
let notificationAgentInstance: NotificationAgent | null = null;

/**
 * Get the NotificationAgent singleton instance.
 */
export function getNotificationAgent(): NotificationAgent {
  if (!notificationAgentInstance) {
    notificationAgentInstance = new NotificationAgent();
  }
  return notificationAgentInstance;
}

export default NotificationAgent;
