/**
 * TaskFlow CLI - Memory Manager
 *
 * Manages context and memory for the Reasoning Agent.
 * Handles both short-term (session) and long-term (database) memory.
 *
 * @module memory-manager
 */

import { v4 as uuidv4 } from 'uuid';
import { getStorage } from '../../lib/storage.js';
import { createChildLogger } from '../../lib/logger.js';
import type { ReasoningStep, Task } from '../../lib/types.js';

const logger = createChildLogger({ component: 'memory-manager' });

/**
 * Context available to the reasoning engine.
 */
export interface ReasoningContext {
  /** Current goal being reasoned about */
  goal: string;
  /** All tasks in the system */
  tasks: Task[];
  /** Overdue tasks */
  overdueTasks: Task[];
  /** Task statistics */
  stats: TaskStats;
  /** Previous reasoning steps in this session */
  previousSteps: ReasoningStep[];
  /** Session identifier */
  sessionId: string;
}

/**
 * Task statistics for context.
 */
export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
}

/**
 * Memory Manager - Manages reasoning context and history.
 *
 * The Memory Manager provides:
 * - Session context (tasks, statistics)
 * - Reasoning step persistence
 * - Context refresh capabilities
 *
 * @example
 * const memory = new MemoryManager();
 *
 * // Initialize context for a new reasoning session
 * const context = memory.initializeContext('What should I work on?');
 *
 * // Add a reasoning step
 * memory.addStep(context.sessionId, 1, 'observe', 'input', 'output', 100);
 *
 * // Refresh context mid-session
 * memory.refreshContext(context);
 */
export class MemoryManager {
  private currentSession: string | null = null;
  private sessionSteps: ReasoningStep[] = [];

  /**
   * Initialize context for a new reasoning session.
   *
   * @param goal - The goal to reason about
   * @returns Fresh reasoning context
   */
  initializeContext(goal: string): ReasoningContext {
    this.currentSession = uuidv4();
    this.sessionSteps = [];

    logger.debug('Initializing reasoning context', {
      sessionId: this.currentSession,
      goal,
    });

    return this.buildContext(goal);
  }

  /**
   * Refresh context with latest data.
   *
   * @param context - Existing context to refresh
   * @returns Updated context
   */
  refreshContext(context: ReasoningContext): ReasoningContext {
    return {
      ...this.buildContext(context.goal),
      previousSteps: context.previousSteps,
      sessionId: context.sessionId,
    };
  }

  /**
   * Build context from current state.
   */
  private buildContext(goal: string): ReasoningContext {
    const storage = getStorage();
    const tasks = storage.listTasks({ limit: 1000 });
    const overdueTasks = storage.getOverdueTasks();

    const stats = this.calculateStats(tasks, overdueTasks);

    return {
      goal,
      tasks,
      overdueTasks,
      stats,
      previousSteps: this.sessionSteps,
      sessionId: this.currentSession ?? uuidv4(),
    };
  }

  /**
   * Calculate task statistics.
   */
  private calculateStats(tasks: Task[], overdueTasks: Task[]): TaskStats {
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;
    }

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      overdueCount: overdueTasks.length,
    };
  }

  /**
   * Add a reasoning step to the current session.
   *
   * @param sessionId - Session identifier
   * @param stepNumber - Step number (1-based)
   * @param phase - Reasoning phase
   * @param input - Phase input
   * @param output - Phase output
   * @param durationMs - Time taken in milliseconds
   * @returns The created step
   */
  addStep(
    sessionId: string,
    stepNumber: number,
    phase: ReasoningStep['phase'],
    input: string,
    output: string,
    durationMs: number
  ): ReasoningStep {
    const storage = getStorage();

    const step = storage.saveReasoningStep({
      sessionId,
      stepNumber,
      phase,
      input,
      output,
      durationMs,
    });

    this.sessionSteps.push(step);

    logger.debug('Reasoning step added', {
      sessionId,
      stepNumber,
      phase,
      durationMs,
    });

    return step;
  }

  /**
   * Get all steps for a session.
   *
   * @param sessionId - Session identifier
   * @returns Array of reasoning steps
   */
  getSessionSteps(sessionId: string): ReasoningStep[] {
    const storage = getStorage();
    return storage.getReasoningSteps(sessionId);
  }

  /**
   * Get the current session's steps.
   *
   * @returns Current session steps
   */
  getCurrentSteps(): ReasoningStep[] {
    return [...this.sessionSteps];
  }

  /**
   * Clear current session.
   */
  clearSession(): void {
    this.currentSession = null;
    this.sessionSteps = [];
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let memoryManagerInstance: MemoryManager | null = null;

/**
 * Get the MemoryManager singleton instance.
 */
export function getMemoryManager(): MemoryManager {
  if (!memoryManagerInstance) {
    memoryManagerInstance = new MemoryManager();
  }
  return memoryManagerInstance;
}

export default MemoryManager;
