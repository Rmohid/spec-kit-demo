/**
 * TaskFlow CLI - Task Agent
 *
 * Handles all task CRUD operations.
 * This is the primary agent for task management functionality.
 *
 * @module task-agent
 */

import { BaseAgent } from '../base-agent.js';
import { getStorage } from '../../lib/storage.js';
import {
  validate,
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFiltersSchema,
} from '../../lib/validators.js';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../../lib/types.js';

/**
 * Task Agent - Manages task CRUD operations.
 *
 * Capabilities:
 * - create: Create a new task
 * - get: Get a task by ID
 * - update: Update an existing task
 * - delete: Delete a task
 * - list: List tasks with optional filters
 * - getOverdue: Get all overdue tasks
 *
 * @example
 * const agent = new TaskAgent();
 *
 * // Create a task
 * const response = await agent.execute({
 *   action: 'create',
 *   params: { title: 'Buy groceries', priority: 'high' }
 * });
 *
 * // List tasks
 * const tasks = await agent.execute({
 *   action: 'list',
 *   params: { status: 'pending' }
 * });
 */
export class TaskAgent extends BaseAgent {
  constructor() {
    super({
      name: 'task-agent',
      displayName: 'Task Agent',
      description: 'Manages task creation, retrieval, updates, and deletion',
      capabilities: ['create', 'get', 'update', 'delete', 'list', 'getOverdue'],
    });
  }

  /**
   * Handle task-related actions.
   */
  protected async handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case 'create':
        return this.createTask(params);
      case 'get':
        return this.getTask(params);
      case 'update':
        return this.updateTask(params);
      case 'delete':
        return this.deleteTask(params);
      case 'list':
        return this.listTasks(params);
      case 'getOverdue':
        return this.getOverdueTasks();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Create a new task.
   */
  private createTask(params: Record<string, unknown>): Task {
    const input = validate(CreateTaskSchema, params) as CreateTaskInput;
    const storage = getStorage();
    const task = storage.createTask(input);

    this.logger.info('Task created', { taskId: task.id, title: task.title });
    return task;
  }

  /**
   * Get a task by ID.
   */
  private getTask(params: Record<string, unknown>): Task {
    this.validateParams(params, ['id']);
    const id = params['id'] as string;

    const storage = getStorage();
    const task = storage.getTask(id);

    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    return task;
  }

  /**
   * Update an existing task.
   */
  private updateTask(params: Record<string, unknown>): Task {
    this.validateParams(params, ['id']);
    const id = params['id'] as string;

    // Extract update fields (everything except id)
    const { id: _id, ...updateFields } = params;
    const input = validate(UpdateTaskSchema, updateFields) as UpdateTaskInput;

    const storage = getStorage();
    const task = storage.updateTask(id, input);

    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    this.logger.info('Task updated', { taskId: task.id });
    return task;
  }

  /**
   * Delete a task.
   */
  private deleteTask(params: Record<string, unknown>): { deleted: boolean; id: string } {
    this.validateParams(params, ['id']);
    const id = params['id'] as string;

    const storage = getStorage();
    const deleted = storage.deleteTask(id);

    if (!deleted) {
      throw new Error(`Task not found: ${id}`);
    }

    this.logger.info('Task deleted', { taskId: id });
    return { deleted: true, id };
  }

  /**
   * List tasks with optional filters.
   */
  private listTasks(params: Record<string, unknown>): Task[] {
    const filters = validate(TaskFiltersSchema, params) as TaskFilters;

    const storage = getStorage();
    const tasks = storage.listTasks(filters);

    this.logger.debug('Tasks listed', { count: tasks.length, filters });
    return tasks;
  }

  /**
   * Get all overdue tasks.
   */
  private getOverdueTasks(): Task[] {
    const storage = getStorage();
    const tasks = storage.getOverdueTasks();

    this.logger.debug('Overdue tasks retrieved', { count: tasks.length });
    return tasks;
  }
}

// Export singleton instance
let taskAgentInstance: TaskAgent | null = null;

/**
 * Get the TaskAgent singleton instance.
 */
export function getTaskAgent(): TaskAgent {
  if (!taskAgentInstance) {
    taskAgentInstance = new TaskAgent();
  }
  return taskAgentInstance;
}

export default TaskAgent;
