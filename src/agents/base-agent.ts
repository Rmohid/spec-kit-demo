/**
 * TaskFlow CLI - Base Agent
 *
 * Abstract base class that all agents must extend.
 * Provides common functionality for agent registration,
 * request handling, and response formatting.
 *
 * @module base-agent
 */

import { createChildLogger } from '../lib/logger.js';
import type { AgentInfo, AgentResponse, AgentStatus } from '../lib/types.js';
import type winston from 'winston';

/**
 * Base agent request interface.
 * All agent actions receive this structure.
 */
export interface AgentActionRequest {
  /** Action to perform */
  action: string;
  /** Action parameters */
  params: Record<string, unknown>;
}

/**
 * Abstract base class for all TaskFlow agents.
 *
 * Agents are specialized components that handle specific domains:
 * - TaskAgent: Task CRUD operations
 * - CoordinatorAgent: Request routing and orchestration
 * - NotificationAgent: Event notifications
 * - ReasoningAgent: Autonomous reasoning and analysis
 *
 * @example
 * class MyAgent extends BaseAgent {
 *   constructor() {
 *     super({
 *       name: 'my-agent',
 *       displayName: 'My Agent',
 *       description: 'Does something useful',
 *       capabilities: ['action1', 'action2'],
 *     });
 *   }
 *
 *   protected async handleAction(action: string, params: Record<string, unknown>) {
 *     switch (action) {
 *       case 'action1':
 *         return this.doAction1(params);
 *       default:
 *         throw new Error(`Unknown action: ${action}`);
 *     }
 *   }
 * }
 */
export abstract class BaseAgent {
  /** Agent metadata */
  protected readonly info: AgentInfo;

  /** Agent-specific logger */
  protected readonly logger: winston.Logger;

  /** Current agent status */
  protected status: AgentStatus = 'active';

  constructor(config: Omit<AgentInfo, 'status'>) {
    this.info = {
      ...config,
      status: 'active',
    };

    this.logger = createChildLogger({ agent: config.name });
    this.logger.debug('Agent initialized', { capabilities: config.capabilities });
  }

  /**
   * Get agent information.
   */
  getInfo(): AgentInfo {
    return {
      ...this.info,
      status: this.status,
    };
  }

  /**
   * Get agent name.
   */
  getName(): string {
    return this.info.name;
  }

  /**
   * Check if agent supports a specific action.
   */
  supportsAction(action: string): boolean {
    return this.info.capabilities.includes(action);
  }

  /**
   * Execute an agent request.
   * Handles common error handling and response formatting.
   *
   * @param request - The action request
   * @returns Formatted agent response
   */
  async execute<T>(request: AgentActionRequest): Promise<AgentResponse<T>> {
    const { action, params } = request;

    this.logger.debug('Executing action', { action, params });

    try {
      // Validate action is supported
      if (!this.supportsAction(action)) {
        throw new Error(
          `Action '${action}' not supported. Available: ${this.info.capabilities.join(', ')}`
        );
      }

      // Execute the action
      const result = await this.handleAction(action, params);

      this.logger.debug('Action completed successfully', { action });

      return {
        success: true,
        agent: this.info.name,
        action,
        data: result as T,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Action failed', { action, error: errorMessage });

      return {
        success: false,
        agent: this.info.name,
        action,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle an action request.
   * Subclasses must implement this to provide action handling.
   *
   * @param action - The action to perform
   * @param params - Action parameters
   * @returns Action result
   */
  protected abstract handleAction(
    action: string,
    params: Record<string, unknown>
  ): Promise<unknown>;

  /**
   * Set agent status.
   * Used to mark agent as inactive or in error state.
   */
  protected setStatus(status: AgentStatus): void {
    this.status = status;
    this.info.status = status;
    this.logger.info('Agent status changed', { status });
  }

  /**
   * Validate required parameters are present.
   *
   * @param params - Parameters to validate
   * @param required - List of required parameter names
   * @throws Error if any required parameter is missing
   */
  protected validateParams(
    params: Record<string, unknown>,
    required: string[]
  ): void {
    const missing = required.filter((key) => params[key] === undefined);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }
  }
}

export default BaseAgent;
