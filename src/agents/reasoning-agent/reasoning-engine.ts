/**
 * TaskFlow CLI - Reasoning Engine
 *
 * The core reasoning loop implementing the observe-think-plan-act-reflect pattern.
 * This is the heart of the autonomous Reasoning Agent.
 *
 * @module reasoning-engine
 */

import { v4 as uuidv4 } from 'uuid';
import { MemoryManager, getMemoryManager, type ReasoningContext } from './memory-manager.js';
import { ToolExecutor, getToolExecutor, type ToolResult } from './tool-executor.js';
import { createChildLogger } from '../../lib/logger.js';
import { config } from '../../lib/config.js';
import type { ReasoningResult } from '../../lib/types.js';

const logger = createChildLogger({ component: 'reasoning-engine' });

/**
 * Options for a reasoning session.
 */
export interface ReasoningEngineOptions {
  /** Maximum iterations before stopping */
  maxIterations: number;
  /** Timeout in milliseconds */
  timeoutMs: number;
  /** Whether to include detailed steps in result */
  includeSteps: boolean;
}

/**
 * Internal state during reasoning.
 */
interface ReasoningState {
  observation: string;
  thought: string;
  plan: PlannedAction[];
  actionResult: string;
  reflection: ReflectionResult;
}

/**
 * A planned action to execute.
 */
interface PlannedAction {
  tool: string;
  params: Record<string, unknown>;
  reason: string;
}

/**
 * Result of reflection phase.
 */
interface ReflectionResult {
  goalAchieved: boolean;
  confidence: number;
  recommendations: string[];
  summary: string;
  shouldContinue: boolean;
}

/**
 * Reasoning Engine - Implements the observe-think-plan-act-reflect loop.
 *
 * The reasoning process follows this pattern:
 *
 * 1. **OBSERVE**: Gather context about tasks and current state
 * 2. **THINK**: Analyze observations and form hypotheses
 * 3. **PLAN**: Decide what actions to take
 * 4. **ACT**: Execute tools to gather more info or take action
 * 5. **REFLECT**: Evaluate results and decide if goal is met
 *
 * The loop continues until:
 * - Goal is achieved (confidence > 0.8)
 * - Max iterations reached
 * - Timeout exceeded
 *
 * @example
 * const engine = new ReasoningEngine();
 *
 * const result = await engine.reason(
 *   'What should I work on next?',
 *   { maxIterations: 5, timeoutMs: 10000, includeSteps: true }
 * );
 *
 * console.log(result.recommendations);
 */
export class ReasoningEngine {
  private memory: MemoryManager;
  private tools: ToolExecutor;

  constructor(memory?: MemoryManager, tools?: ToolExecutor) {
    this.memory = memory ?? getMemoryManager();
    this.tools = tools ?? getToolExecutor();
  }

  /**
   * Run the reasoning process for a given goal.
   *
   * @param goal - What to reason about
   * @param options - Reasoning options
   * @returns Reasoning result with recommendations
   */
  async reason(
    goal: string,
    options: Partial<ReasoningEngineOptions> = {}
  ): Promise<ReasoningResult> {
    const opts: ReasoningEngineOptions = {
      maxIterations: options.maxIterations ?? config.reasoning.maxIterations,
      timeoutMs: options.timeoutMs ?? config.reasoning.timeoutMs,
      includeSteps: options.includeSteps ?? false,
    };

    const startTime = Date.now();
    const sessionId = uuidv4();
    let context = this.memory.initializeContext(goal);
    let stepNumber = 0;
    let finalResult: ReflectionResult | null = null;

    logger.info('Starting reasoning session', {
      sessionId,
      goal,
      maxIterations: opts.maxIterations,
    });

    try {
      for (let iteration = 0; iteration < opts.maxIterations; iteration++) {
        // Check timeout
        if (Date.now() - startTime > opts.timeoutMs) {
          logger.warn('Reasoning timeout reached', { sessionId, iteration });
          break;
        }

        logger.debug('Starting iteration', { sessionId, iteration });

        // Execute reasoning loop
        const state = await this.executeReasoningIteration(
          context,
          sessionId,
          stepNumber
        );

        stepNumber += 5; // 5 phases per iteration
        context = this.memory.refreshContext(context);
        finalResult = state.reflection;

        // Check if goal achieved
        if (state.reflection.goalAchieved || !state.reflection.shouldContinue) {
          logger.info('Goal achieved or reasoning complete', {
            sessionId,
            iteration,
            confidence: state.reflection.confidence,
          });
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Reasoning failed', { sessionId, error: message });

      return {
        goal,
        result: `Reasoning failed: ${message}`,
        confidence: 0,
        steps: opts.includeSteps ? this.memory.getCurrentSteps() : [],
        recommendations: ['Please try again or rephrase your goal'],
        sessionId,
        totalDurationMs: Date.now() - startTime,
      };
    }

    const totalDuration = Date.now() - startTime;

    return {
      goal,
      result: finalResult?.summary ?? 'Reasoning completed',
      confidence: finalResult?.confidence ?? 0.5,
      steps: opts.includeSteps ? this.memory.getCurrentSteps() : [],
      recommendations: finalResult?.recommendations ?? [],
      sessionId,
      totalDurationMs: totalDuration,
    };
  }

  /**
   * Execute one full iteration of the reasoning loop.
   */
  private async executeReasoningIteration(
    context: ReasoningContext,
    sessionId: string,
    baseStepNumber: number
  ): Promise<ReasoningState> {
    // Phase 1: OBSERVE
    const observation = await this.observe(context, sessionId, baseStepNumber + 1);

    // Phase 2: THINK
    const thought = await this.think(
      observation,
      context,
      sessionId,
      baseStepNumber + 2
    );

    // Phase 3: PLAN
    const plan = await this.plan(thought, context, sessionId, baseStepNumber + 3);

    // Phase 4: ACT
    const actionResult = await this.act(plan, sessionId, baseStepNumber + 4);

    // Phase 5: REFLECT
    const reflection = await this.reflect(
      actionResult,
      context,
      sessionId,
      baseStepNumber + 5
    );

    return {
      observation,
      thought,
      plan,
      actionResult,
      reflection,
    };
  }

  /**
   * OBSERVE phase: Gather context about current state.
   */
  private async observe(
    context: ReasoningContext,
    sessionId: string,
    stepNumber: number
  ): Promise<string> {
    const startTime = Date.now();

    const observation = [
      `Goal: ${context.goal}`,
      ``,
      `Current State:`,
      `- Total tasks: ${context.stats.total}`,
      `- By status: ${JSON.stringify(context.stats.byStatus)}`,
      `- By priority: ${JSON.stringify(context.stats.byPriority)}`,
      `- Overdue tasks: ${context.stats.overdueCount}`,
      ``,
      `Available tools: ${this.tools.getToolNames().join(', ')}`,
    ].join('\n');

    this.memory.addStep(
      sessionId,
      stepNumber,
      'observe',
      `Gathering context for goal: ${context.goal}`,
      observation,
      Date.now() - startTime
    );

    logger.debug('Observe phase complete', { sessionId, stepNumber });
    return observation;
  }

  /**
   * THINK phase: Analyze observations and form hypotheses.
   */
  private async think(
    observation: string,
    context: ReasoningContext,
    sessionId: string,
    stepNumber: number
  ): Promise<string> {
    const startTime = Date.now();

    // Analyze the goal and determine what information we need
    const goalLower = context.goal.toLowerCase();
    const thoughts: string[] = [];

    if (goalLower.includes('next') || goalLower.includes('work on')) {
      thoughts.push('User wants task prioritization recommendations.');
      thoughts.push('Need to analyze tasks by priority and due date.');
    }

    if (goalLower.includes('overdue') || goalLower.includes('late')) {
      thoughts.push('User is concerned about overdue tasks.');
      thoughts.push('Need to identify and analyze overdue items.');
    }

    if (goalLower.includes('organize') || goalLower.includes('sort')) {
      thoughts.push('User wants to organize or restructure tasks.');
      thoughts.push('Need to suggest an execution order.');
    }

    if (goalLower.includes('analyze') || goalLower.includes('review')) {
      thoughts.push('User wants a general analysis of their tasks.');
      thoughts.push('Need to provide statistics and insights.');
    }

    if (thoughts.length === 0) {
      thoughts.push('General task inquiry detected.');
      thoughts.push('Will provide overview and recommendations.');
    }

    const thought = [
      'Analysis of goal and current state:',
      '',
      ...thoughts,
      '',
      `Key observations:`,
      `- ${context.stats.total} tasks in system`,
      `- ${context.stats.overdueCount} overdue tasks need attention`,
      `- Priority distribution shows workload balance`,
    ].join('\n');

    this.memory.addStep(
      sessionId,
      stepNumber,
      'think',
      observation,
      thought,
      Date.now() - startTime
    );

    logger.debug('Think phase complete', { sessionId, stepNumber });
    return thought;
  }

  /**
   * PLAN phase: Decide what actions to take.
   */
  private async plan(
    thought: string,
    context: ReasoningContext,
    sessionId: string,
    stepNumber: number
  ): Promise<PlannedAction[]> {
    const startTime = Date.now();

    const goalLower = context.goal.toLowerCase();
    const actions: PlannedAction[] = [];

    // Always start with priority analysis
    actions.push({
      tool: 'analyze_priorities',
      params: {},
      reason: 'Understand current task priorities',
    });

    // Add specific tools based on goal
    if (goalLower.includes('overdue') || context.stats.overdueCount > 0) {
      actions.push({
        tool: 'find_overdue',
        params: {},
        reason: 'Identify overdue tasks',
      });
    }

    if (goalLower.includes('next') || goalLower.includes('order')) {
      actions.push({
        tool: 'suggest_order',
        params: {},
        reason: 'Determine optimal task execution order',
      });
    }

    const planOutput = actions
      .map((a, i) => `${i + 1}. ${a.tool}: ${a.reason}`)
      .join('\n');

    this.memory.addStep(
      sessionId,
      stepNumber,
      'plan',
      thought,
      `Planned actions:\n${planOutput}`,
      Date.now() - startTime
    );

    logger.debug('Plan phase complete', { sessionId, stepNumber, actionCount: actions.length });
    return actions;
  }

  /**
   * ACT phase: Execute planned tools.
   */
  private async act(
    plan: PlannedAction[],
    sessionId: string,
    stepNumber: number
  ): Promise<string> {
    const startTime = Date.now();
    const results: string[] = [];

    for (const action of plan) {
      const result = await this.tools.execute(action.tool, action.params);

      if (result.success) {
        results.push(`✓ ${action.tool}: ${this.summarizeResult(result)}`);
      } else {
        results.push(`✗ ${action.tool}: ${result.error}`);
      }
    }

    const output = results.join('\n');

    this.memory.addStep(
      sessionId,
      stepNumber,
      'act',
      `Executing ${plan.length} actions`,
      output,
      Date.now() - startTime
    );

    logger.debug('Act phase complete', { sessionId, stepNumber });
    return output;
  }

  /**
   * REFLECT phase: Evaluate results and determine if goal is met.
   */
  private async reflect(
    actionResult: string,
    context: ReasoningContext,
    sessionId: string,
    stepNumber: number
  ): Promise<ReflectionResult> {
    const startTime = Date.now();

    // Generate recommendations based on context
    const recommendations: string[] = [];
    let confidence = 0.7;

    // Check for overdue tasks
    if (context.stats.overdueCount > 0) {
      recommendations.push(
        `Address ${context.stats.overdueCount} overdue task(s) immediately`
      );
      confidence = Math.max(0.5, confidence - 0.1);
    }

    // Check for urgent tasks
    const urgentCount = context.stats.byPriority['urgent'] ?? 0;
    if (urgentCount > 0) {
      recommendations.push(`Focus on ${urgentCount} urgent task(s) first`);
    }

    // Add general recommendations
    if (context.stats.total > 0) {
      const pendingCount = context.stats.byStatus['pending'] ?? 0;
      if (pendingCount > 5) {
        recommendations.push(
          'Consider breaking down large tasks or delegating'
        );
      }

      recommendations.push('Review and update task priorities regularly');
    } else {
      recommendations.push('No tasks found. Create some tasks to get started!');
    }

    const summary = this.generateSummary(context, actionResult, recommendations);

    const reflection: ReflectionResult = {
      goalAchieved: true, // For simple queries, one iteration is usually enough
      confidence,
      recommendations,
      summary,
      shouldContinue: false, // Stop after first iteration for basic goals
    };

    this.memory.addStep(
      sessionId,
      stepNumber,
      'reflect',
      actionResult,
      JSON.stringify(reflection, null, 2),
      Date.now() - startTime
    );

    logger.debug('Reflect phase complete', {
      sessionId,
      stepNumber,
      goalAchieved: reflection.goalAchieved,
    });

    return reflection;
  }

  /**
   * Summarize a tool result for logging.
   */
  private summarizeResult(result: ToolResult): string {
    if (!result.data) {
      return 'No data';
    }

    const data = result.data as Record<string, unknown>;

    if ('summary' in data) {
      return data['summary'] as string;
    }

    if ('count' in data) {
      return `Found ${data['count']} items`;
    }

    return 'Completed successfully';
  }

  /**
   * Generate a human-readable summary.
   */
  private generateSummary(
    context: ReasoningContext,
    _actionResult: string,
    recommendations: string[]
  ): string {
    const parts: string[] = [];

    parts.push(`Based on analysis of your ${context.stats.total} tasks:`);
    parts.push('');

    if (context.stats.overdueCount > 0) {
      parts.push(`⚠️  ${context.stats.overdueCount} task(s) are overdue`);
    }

    const urgentCount = context.stats.byPriority['urgent'] ?? 0;
    const highCount = context.stats.byPriority['high'] ?? 0;
    if (urgentCount > 0 || highCount > 0) {
      parts.push(`🔴 ${urgentCount} urgent, ${highCount} high priority`);
    }

    parts.push('');
    parts.push('Recommendations:');
    recommendations.forEach((r, i) => {
      parts.push(`${i + 1}. ${r}`);
    });

    return parts.join('\n');
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let engineInstance: ReasoningEngine | null = null;

/**
 * Get the ReasoningEngine singleton instance.
 */
export function getReasoningEngine(): ReasoningEngine {
  if (!engineInstance) {
    engineInstance = new ReasoningEngine();
  }
  return engineInstance;
}

export default ReasoningEngine;
