/**
 * TaskFlow CLI - Tool Executor
 *
 * Executes tools available to the Reasoning Agent.
 * Tools are functions that the reasoning engine can invoke to gather
 * information or take actions.
 *
 * @module tool-executor
 */

import { getStorage } from '../../lib/storage.js';
import { createChildLogger } from '../../lib/logger.js';
import type { Task } from '../../lib/types.js';

const logger = createChildLogger({ component: 'tool-executor' });

/**
 * Tool definition.
 */
export interface Tool {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Parameter descriptions */
  parameters: Record<string, string>;
  /** Execute the tool */
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

/**
 * Result from executing a tool.
 */
export interface ToolResult {
  /** Whether execution succeeded */
  success: boolean;
  /** Result data */
  data?: unknown;
  /** Error message if failed */
  error?: string;
}

/**
 * Tool Executor - Executes reasoning tools.
 *
 * Available tools:
 * - query_tasks: Get tasks matching criteria
 * - analyze_priorities: Analyze and rank task priorities
 * - find_overdue: Find overdue tasks
 * - find_dependencies: Identify task dependencies (by tags)
 * - suggest_order: Suggest task execution order
 * - calculate_urgency: Calculate urgency scores
 *
 * @example
 * const executor = new ToolExecutor();
 *
 * // Execute a tool
 * const result = await executor.execute('query_tasks', { status: 'pending' });
 */
export class ToolExecutor {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerBuiltInTools();
  }

  /**
   * Register built-in tools.
   */
  private registerBuiltInTools(): void {
    // Query tasks tool
    this.register({
      name: 'query_tasks',
      description: 'Get tasks matching specified criteria',
      parameters: {
        status: 'Filter by status (pending, in_progress, done, cancelled)',
        priority: 'Filter by priority (low, medium, high, urgent)',
        limit: 'Maximum number of tasks to return',
      },
      execute: async (params) => this.queryTasks(params),
    });

    // Analyze priorities tool
    this.register({
      name: 'analyze_priorities',
      description: 'Analyze tasks and rank by priority and urgency',
      parameters: {
        tasks: 'Array of tasks to analyze (optional, uses all if not provided)',
      },
      execute: async (params) => this.analyzePriorities(params),
    });

    // Find overdue tool
    this.register({
      name: 'find_overdue',
      description: 'Find all overdue tasks',
      parameters: {},
      execute: async () => this.findOverdue(),
    });

    // Find dependencies tool
    this.register({
      name: 'find_dependencies',
      description: 'Find tasks with shared tags (potential dependencies)',
      parameters: {
        taskId: 'Task ID to find dependencies for',
      },
      execute: async (params) => this.findDependencies(params),
    });

    // Suggest order tool
    this.register({
      name: 'suggest_order',
      description: 'Suggest optimal execution order for tasks',
      parameters: {
        tasks: 'Array of tasks to order (optional, uses pending if not provided)',
      },
      execute: async (params) => this.suggestOrder(params),
    });

    // Calculate urgency tool
    this.register({
      name: 'calculate_urgency',
      description: 'Calculate urgency scores for tasks',
      parameters: {
        tasks: 'Array of tasks to score (optional)',
      },
      execute: async (params) => this.calculateUrgency(params),
    });

    logger.debug('Built-in tools registered', { count: this.tools.size });
  }

  /**
   * Register a tool.
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get all available tools.
   */
  getAvailableTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool names.
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Execute a tool by name.
   */
  async execute(toolName: string, params: Record<string, unknown> = {}): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      const available = this.getToolNames().join(', ');
      return {
        success: false,
        error: `Tool not found: ${toolName}. Available: ${available}`,
      };
    }

    logger.debug('Executing tool', { tool: toolName, params });

    try {
      const result = await tool.execute(params);
      logger.debug('Tool executed successfully', { tool: toolName });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Tool execution failed', { tool: toolName, error: message });
      return {
        success: false,
        error: message,
      };
    }
  }

  // ===========================================================================
  // Tool Implementations
  // ===========================================================================

  /**
   * Query tasks tool implementation.
   */
  private async queryTasks(params: Record<string, unknown>): Promise<ToolResult> {
    const storage = getStorage();
    
    const filters: { status?: Task['status']; priority?: Task['priority']; limit?: number } = {
      limit: (params['limit'] as number) ?? 100,
    };
    
    if (params['status']) {
      filters.status = params['status'] as Task['status'];
    }
    if (params['priority']) {
      filters.priority = params['priority'] as Task['priority'];
    }
    
    const tasks = storage.listTasks(filters);

    return {
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    };
  }

  /**
   * Analyze priorities tool implementation.
   */
  private async analyzePriorities(params: Record<string, unknown>): Promise<ToolResult> {
    let tasks = params['tasks'] as Task[] | undefined;

    if (!tasks) {
      const storage = getStorage();
      tasks = storage.listTasks({ limit: 100 });
    }

    // Score and rank tasks
    const priorityWeights: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const scored = tasks.map((task) => {
      let score = priorityWeights[task.priority] ?? 2;

      // Boost score for overdue tasks
      if (task.dueDate && new Date(task.dueDate) < new Date()) {
        score += 2;
      }

      // Boost score for tasks due soon (within 24 hours)
      if (task.dueDate) {
        const hoursUntilDue =
          (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursUntilDue > 0 && hoursUntilDue < 24) {
          score += 1;
        }
      }

      return { task, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return {
      success: true,
      data: {
        rankedTasks: scored.map(({ task, score }) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          urgencyScore: score,
        })),
        summary: `Analyzed ${tasks.length} tasks. Top priority: ${scored[0]?.task.title ?? 'none'}`,
      },
    };
  }

  /**
   * Find overdue tasks tool implementation.
   */
  private async findOverdue(): Promise<ToolResult> {
    const storage = getStorage();
    const overdue = storage.getOverdueTasks();

    return {
      success: true,
      data: {
        tasks: overdue,
        count: overdue.length,
        summary:
          overdue.length > 0
            ? `Found ${overdue.length} overdue task(s): ${overdue.map((t) => t.title).join(', ')}`
            : 'No overdue tasks found',
      },
    };
  }

  /**
   * Find dependencies tool implementation.
   * Uses shared tags to identify related tasks.
   */
  private async findDependencies(params: Record<string, unknown>): Promise<ToolResult> {
    const taskId = params['taskId'] as string;

    const storage = getStorage();
    const task = storage.getTask(taskId);

    if (!task) {
      return {
        success: false,
        error: `Task not found: ${taskId}`,
      };
    }

    const allTasks = storage.listTasks({ limit: 100 });
    const related = allTasks.filter(
      (t) =>
        t.id !== taskId && t.tags.some((tag) => task.tags.includes(tag))
    );

    return {
      success: true,
      data: {
        task: { id: task.id, title: task.title, tags: task.tags },
        relatedTasks: related.map((t) => ({
          id: t.id,
          title: t.title,
          tags: t.tags,
          sharedTags: t.tags.filter((tag) => task.tags.includes(tag)),
        })),
        summary: `Found ${related.length} related task(s) for "${task.title}"`,
      },
    };
  }

  /**
   * Suggest order tool implementation.
   */
  private async suggestOrder(params: Record<string, unknown>): Promise<ToolResult> {
    let tasks = params['tasks'] as Task[] | undefined;

    if (!tasks) {
      const storage = getStorage();
      tasks = storage.listTasks({ status: 'pending', limit: 100 });
    }

    // Use the priority analysis to suggest order
    const priorityResult = await this.analyzePriorities({ tasks });
    const ranked = (priorityResult.data as { rankedTasks: { id: string; title: string; urgencyScore: number }[] }).rankedTasks;

    return {
      success: true,
      data: {
        suggestedOrder: ranked.map((t, i) => ({
          order: i + 1,
          id: t.id,
          title: t.title,
          reason: `Urgency score: ${t.urgencyScore}`,
        })),
        summary: `Suggested order for ${tasks.length} tasks based on priority and urgency`,
      },
    };
  }

  /**
   * Calculate urgency scores tool implementation.
   */
  private async calculateUrgency(params: Record<string, unknown>): Promise<ToolResult> {
    // Reuse analyzePriorities which already calculates urgency
    return this.analyzePriorities(params);
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let toolExecutorInstance: ToolExecutor | null = null;

/**
 * Get the ToolExecutor singleton instance.
 */
export function getToolExecutor(): ToolExecutor {
  if (!toolExecutorInstance) {
    toolExecutorInstance = new ToolExecutor();
  }
  return toolExecutorInstance;
}

export default ToolExecutor;
