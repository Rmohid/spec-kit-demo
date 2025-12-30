/**
 * TaskFlow CLI - Coordinator Agent
 *
 * Orchestrates requests to appropriate specialized agents.
 * Acts as the central routing hub for all agent interactions.
 *
 * @module coordinator
 */

import { BaseAgent } from '../base-agent.js';
import { getAgentRegistry } from '../registry.js';
import type { AgentInfo, AgentResponse } from '../../lib/types.js';

/**
 * Coordinator Agent - Routes requests to appropriate agents.
 *
 * The Coordinator is the main entry point for agent interactions.
 * It doesn't perform business logic itself, but delegates to
 * specialized agents based on the request type.
 *
 * Capabilities:
 * - route: Route a request to the appropriate agent
 * - listAgents: List all available agents
 * - getAgentStatus: Get status of a specific agent
 *
 * @example
 * const coordinator = new CoordinatorAgent();
 *
 * // Route a request to the task agent
 * const response = await coordinator.execute({
 *   action: 'route',
 *   params: {
 *     agent: 'task-agent',
 *     action: 'create',
 *     params: { title: 'New task' }
 *   }
 * });
 */
export class CoordinatorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'coordinator',
      displayName: 'Coordinator Agent',
      description: 'Routes requests to appropriate specialized agents',
      capabilities: ['route', 'listAgents', 'getAgentStatus'],
    });
  }

  /**
   * Handle coordinator actions.
   */
  protected async handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (action) {
      case 'route':
        return this.routeRequest(params);
      case 'listAgents':
        return this.listAgents();
      case 'getAgentStatus':
        return this.getAgentStatus(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Route a request to the appropriate agent.
   */
  private async routeRequest(params: Record<string, unknown>): Promise<AgentResponse> {
    this.validateParams(params, ['agent', 'action']);

    const targetAgent = params['agent'] as string;
    const targetAction = params['action'] as string;
    const targetParams = (params['params'] as Record<string, unknown>) ?? {};

    this.logger.debug('Routing request', {
      targetAgent,
      targetAction,
    });

    const registry = getAgentRegistry();
    const agent = registry.getAgentOrThrow(targetAgent);

    const response = await agent.execute({
      action: targetAction,
      params: targetParams,
    });

    this.logger.debug('Request routed successfully', {
      targetAgent,
      targetAction,
      success: response.success,
    });

    return response;
  }

  /**
   * List all available agents.
   */
  private listAgents(): AgentInfo[] {
    const registry = getAgentRegistry();
    return registry.listAgents();
  }

  /**
   * Get status of a specific agent.
   */
  private getAgentStatus(params: Record<string, unknown>): AgentInfo {
    this.validateParams(params, ['name']);

    const name = params['name'] as string;
    const registry = getAgentRegistry();
    const agent = registry.getAgentOrThrow(name);

    return agent.getInfo();
  }

  // ===========================================================================
  // Convenience Methods
  // ===========================================================================

  /**
   * Execute an action on a target agent.
   * Convenience method that wraps the route action.
   */
  async routeTo<T>(
    agentName: string,
    action: string,
    params: Record<string, unknown> = {}
  ): Promise<AgentResponse<T>> {
    const response = await this.execute<AgentResponse<T>>({
      action: 'route',
      params: {
        agent: agentName,
        action,
        params,
      },
    });

    if (!response.success) {
      throw new Error(response.error ?? 'Unknown routing error');
    }

    return response.data as AgentResponse<T>;
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let coordinatorInstance: CoordinatorAgent | null = null;

/**
 * Get the CoordinatorAgent singleton instance.
 */
export function getCoordinator(): CoordinatorAgent {
  if (!coordinatorInstance) {
    coordinatorInstance = new CoordinatorAgent();
    // Register coordinator with the registry
    getAgentRegistry().register(coordinatorInstance);
  }
  return coordinatorInstance;
}

export default CoordinatorAgent;
