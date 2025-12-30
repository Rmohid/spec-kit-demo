/**
 * TaskFlow CLI - Reasoning Agent Contract Tests
 *
 * Tests the contract/interface of the Reasoning Agent.
 */

import { ReasoningAgent } from '../../src/agents/reasoning-agent/index.js';
import { TaskAgent } from '../../src/agents/task-agent/index.js';
import { Storage, resetStorage } from '../../src/lib/storage.js';
import type { ReasoningResult } from '../../src/lib/types.js';

describe('ReasoningAgent Contract', () => {
  let agent: ReasoningAgent;
  let taskAgent: TaskAgent;
  let storage: Storage;

  beforeEach(() => {
    process.env['DATABASE_PATH'] = ':memory:';
    resetStorage();
    storage = new Storage(':memory:');
    taskAgent = new TaskAgent();
    agent = new ReasoningAgent();
  });

  afterEach(() => {
    storage.close();
    resetStorage();
  });

  describe('reason action', () => {
    beforeEach(async () => {
      // Create some test tasks
      await taskAgent.execute({
        action: 'create',
        params: { title: 'Task 1', priority: 'high' },
      });
      await taskAgent.execute({
        action: 'create',
        params: { title: 'Task 2', priority: 'low' },
      });
    });

    it('should process a reasoning request', async () => {
      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: {
          goal: 'What should I work on?',
          maxIterations: 2,
        },
      });

      expect(response.success).toBe(true);
      expect(response.agent).toBe('reasoning-agent');
      expect(response.data).toMatchObject({
        goal: 'What should I work on?',
        result: expect.any(String),
        confidence: expect.any(Number),
        recommendations: expect.any(Array),
        sessionId: expect.any(String),
        totalDurationMs: expect.any(Number),
      });
    });

    it('should return recommendations', async () => {
      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: {
          goal: 'Prioritize my tasks',
          maxIterations: 2,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data?.recommendations.length).toBeGreaterThan(0);
    });

    it('should include steps when requested', async () => {
      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: {
          goal: 'Analyze my tasks',
          maxIterations: 1,
          includeSteps: true,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data?.steps.length).toBeGreaterThan(0);
      expect(response.data?.steps[0]).toMatchObject({
        id: expect.any(String),
        sessionId: expect.any(String),
        stepNumber: expect.any(Number),
        phase: expect.any(String),
        input: expect.any(String),
        output: expect.any(String),
        durationMs: expect.any(Number),
      });
    });

    it('should respect maxIterations', async () => {
      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: {
          goal: 'Deep analysis',
          maxIterations: 1,
          includeSteps: true,
        },
      });

      expect(response.success).toBe(true);
      // With 1 iteration, we should have 5 steps (observe, think, plan, act, reflect)
      expect(response.data?.steps.length).toBeLessThanOrEqual(5);
    });

    it('should reject empty goal', async () => {
      const response = await agent.execute({
        action: 'reason',
        params: { goal: '' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('required');
    });

    it('should handle no tasks gracefully', async () => {
      // Clear all tasks
      const listResponse = await taskAgent.execute<{ id: string }[]>({
        action: 'list',
        params: {},
      });

      for (const task of listResponse.data ?? []) {
        await taskAgent.execute({ action: 'delete', params: { id: task.id } });
      }

      const response = await agent.execute<ReasoningResult>({
        action: 'reason',
        params: { goal: 'What should I do?' },
      });

      expect(response.success).toBe(true);
      // Should mention no tasks
      expect(
        response.data?.result.toLowerCase().includes('no tasks') ||
          response.data?.recommendations.some((r) =>
            r.toLowerCase().includes('no tasks')
          )
      ).toBe(true);
    });
  });

  describe('getTools action', () => {
    it('should return available tools', async () => {
      const response = await agent.execute<{ tools: { name: string; description: string }[] }>({
        action: 'getTools',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data?.tools.length).toBeGreaterThan(0);
      expect(response.data?.tools[0]).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
      });
    });

    it('should include expected tools', async () => {
      const response = await agent.execute<{ tools: { name: string }[] }>({
        action: 'getTools',
        params: {},
      });

      const toolNames = response.data?.tools.map((t) => t.name) ?? [];

      expect(toolNames).toContain('query_tasks');
      expect(toolNames).toContain('analyze_priorities');
      expect(toolNames).toContain('find_overdue');
      expect(toolNames).toContain('suggest_order');
    });
  });

  describe('unsupported action', () => {
    it('should return error for unknown action', async () => {
      const response = await agent.execute({
        action: 'unknown',
        params: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('not supported');
    });
  });
});
