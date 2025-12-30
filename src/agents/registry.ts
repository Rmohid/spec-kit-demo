/**
 * TaskFlow CLI - Agent Registry
 *
 * Central registry for all available agents.
 * Handles agent registration, discovery, and lookup.
 *
 * @module registry
 */

import { BaseAgent } from './base-agent.js';
import { getTaskAgent } from './task-agent/index.js';
import { getNotificationAgent } from './notification-agent/index.js';
import { logger } from '../lib/logger.js';
import type { AgentInfo } from '../lib/types.js';

/**
 * Agent Registry - Manages all available agents.
 *
 * The registry is the central point for:
 * - Registering new agents
 * - Discovering available agents
 * - Looking up agents by name
 *
 * @example
 * const registry = getAgentRegistry();
 *
 * // List all agents
 * const agents = registry.listAgents();
 *
 * // Get a specific agent
 * const taskAgent = registry.getAgent('task-agent');
 */
export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    // Register built-in agents
    this.registerBuiltInAgents();
  }

  /**
   * Register the built-in agents.
   */
  private registerBuiltInAgents(): void {
    // Task Agent
    this.register(getTaskAgent());

    // Notification Agent
    this.register(getNotificationAgent());

    // Note: Coordinator and Reasoning agents are registered separately
    // to avoid circular dependencies

    logger.debug('Built-in agents registered', {
      count: this.agents.size,
      agents: Array.from(this.agents.keys()),
    });
  }

  /**
   * Register an agent.
   *
   * @param agent - The agent to register
   * @throws Error if agent with same name already exists
   */
  register(agent: BaseAgent): void {
    const name = agent.getName();

    if (this.agents.has(name)) {
      throw new Error(`Agent already registered: ${name}`);
    }

    this.agents.set(name, agent);
    logger.debug('Agent registered', { name });
  }

  /**
   * Get an agent by name.
   *
   * @param name - Agent name
   * @returns The agent or null if not found
   */
  getAgent(name: string): BaseAgent | null {
    return this.agents.get(name) ?? null;
  }

  /**
   * Get an agent by name, throwing if not found.
   *
   * @param name - Agent name
   * @returns The agent
   * @throws Error if agent not found
   */
  getAgentOrThrow(name: string): BaseAgent {
    const agent = this.getAgent(name);
    if (!agent) {
      const available = Array.from(this.agents.keys()).join(', ');
      throw new Error(`Agent not found: ${name}. Available agents: ${available}`);
    }
    return agent;
  }

  /**
   * List all registered agents.
   *
   * @returns Array of agent information
   */
  listAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).map((agent) => agent.getInfo());
  }

  /**
   * Check if an agent exists.
   *
   * @param name - Agent name
   * @returns True if agent exists
   */
  hasAgent(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * Get all agent names.
   *
   * @returns Array of agent names
   */
  getAgentNames(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Find agents that support a specific capability.
   *
   * @param capability - The capability to search for
   * @returns Array of agents that support the capability
   */
  findAgentsByCapability(capability: string): BaseAgent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.supportsAction(capability)
    );
  }
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let registryInstance: AgentRegistry | null = null;

/**
 * Get the AgentRegistry singleton instance.
 */
export function getAgentRegistry(): AgentRegistry {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
  }
  return registryInstance;
}

/**
 * Reset the registry (for testing).
 */
export function resetAgentRegistry(): void {
  registryInstance = null;
}

export default AgentRegistry;
