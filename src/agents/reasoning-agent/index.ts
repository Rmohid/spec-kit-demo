/**
 * TaskFlow CLI - Reasoning Agent
 *
 * A fully autonomous agent that uses the observe-think-plan-act-reflect
 * pattern to analyze tasks and provide intelligent recommendations.
 *
 * This is the showcase agent demonstrating advanced agent capabilities
 * for the Spec Kit demo.
 *
 * @module reasoning-agent
 */

import { BaseAgent } from '../base-agent.js';
import { getAgentRegistry } from '../registry.js';
import { ReasoningEngine, getReasoningEngine } from './reasoning-engine.js';
import { validate, ReasoningOptionsSchema, ReasoningGoalSchema } from '../../lib/validators.js';
import type { ReasoningResult, ReasoningOptions } from '../../lib/types.js';

/**
 * Reasoning Agent - Autonomous task analysis and recommendations.
 *
 * The Reasoning Agent is a fully autonomous agent that can:
 * - Analyze your tasks and provide prioritization recommendations
 * - Identify overdue tasks and suggest action plans
 * - Reason through complex queries about your work
 *
 * It uses a structured reasoning loop:
 * 1. **OBSERVE**: Gather context about tasks and state
 * 2. **THINK**: Analyze and form hypotheses
 * 3. **PLAN**: Decide what tools to use
 * 4. **ACT**: Execute tools to gather information
 * 5. **REFLECT**: Evaluate results and generate recommendations
 *
 * Capabilities:
 * - reason: Process a goal and provide recommendations
 * - getTools: List available reasoning tools
 *
 * @example
 * const agent = new ReasoningAgent();
 *
 * // Ask for recommendations
 * const response = await agent.execute({
 *   action: 'reason',
 *   params: {
 *     goal: 'What should I work on next?',
 *     maxIterations: 5,
 *     includeSteps: true
 *   }
 * });
 *
 * console.log(response.data.recommendations);
 */
export class ReasoningAgent extends BaseAgent {
  private engine: ReasoningEngine;

  constructor() {
    super({
      name: 'reasoning-agent',
      displayName: 'Reasoning Agent',
      description:
        'Autonomous agent that analyzes tasks and provides intelligent recommendations using structured reasoning',
      capabilities: ['reason', 'getTools'],
    });

    this.engine = getReasoningEngine();
  }

  /**
   * Handle reasoning actions.
   */
  protected async handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case 'reason':
        return this.reason(params);
      case 'getTools':
        return this.getTools();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Process a reasoning request.
   */
  private async reason(params: Record<string, unknown>): Promise<ReasoningResult> {
    // Validate goal
    const goal = validate(ReasoningGoalSchema, params['goal']);

    // Validate options
    const options = validate(ReasoningOptionsSchema, {
      maxIterations: params['maxIterations'],
      timeoutMs: params['timeoutMs'],
      includeSteps: params['includeSteps'],
    }) as ReasoningOptions;

    this.logger.info('Starting reasoning', { goal, options });

    const result = await this.engine.reason(goal, options);

    this.logger.info('Reasoning complete', {
      sessionId: result.sessionId,
      confidence: result.confidence,
      recommendationCount: result.recommendations.length,
      durationMs: result.totalDurationMs,
    });

    return result;
  }

  /**
   * Get list of available reasoning tools.
   */
  private getTools(): { tools: { name: string; description: string }[] } {
    const { getToolExecutor } = require('./tool-executor.js');
    const executor = getToolExecutor();
    const tools = executor.getAvailableTools();

    return {
      tools: tools.map((t: { name: string; description: string }) => ({
        name: t.name,
        description: t.description,
      })),
    };
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let reasoningAgentInstance: ReasoningAgent | null = null;

/**
 * Get the ReasoningAgent singleton instance.
 */
export function getReasoningAgent(): ReasoningAgent {
  if (!reasoningAgentInstance) {
    reasoningAgentInstance = new ReasoningAgent();
    // Register with the agent registry
    getAgentRegistry().register(reasoningAgentInstance);
  }
  return reasoningAgentInstance;
}

export default ReasoningAgent;
