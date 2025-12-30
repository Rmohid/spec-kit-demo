/**
 * TaskFlow CLI - Task Agent Contract Tests
 *
 * Tests the contract/interface of the Task Agent.
 * Verifies all CRUD operations work as specified.
 */

import { TaskAgent } from '../../src/agents/task-agent/index.js';
import { Storage, resetStorage, getStorage } from '../../src/lib/storage.js';
import type { Task } from '../../src/lib/types.js';

describe('TaskAgent Contract', () => {
  let agent: TaskAgent;
  let storage: Storage;

  beforeEach(() => {
    // Use in-memory database for tests
    process.env['DATABASE_PATH'] = ':memory:';
    resetStorage();
    // Get the singleton storage (will be created with :memory: path)
    storage = getStorage();
    agent = new TaskAgent();
  });

  afterEach(() => {
    storage.close();
    resetStorage();
  });

  describe('create action', () => {
    it('should create a task with only title', async () => {
      const response = await agent.execute<Task>({
        action: 'create',
        params: { title: 'Test task' },
      });

      expect(response.success).toBe(true);
      expect(response.agent).toBe('task-agent');
      expect(response.action).toBe('create');
      expect(response.data).toMatchObject({
        id: expect.any(String),
        title: 'Test task',
        status: 'pending',
        priority: 'medium',
        description: null,
        tags: [],
      });
    });

    it('should create a task with all options', async () => {
      const dueDate = new Date().toISOString();

      const response = await agent.execute<Task>({
        action: 'create',
        params: {
          title: 'Full task',
          description: 'A complete task',
          priority: 'high',
          dueDate,
          tags: ['work', 'urgent'],
        },
      });

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        title: 'Full task',
        description: 'A complete task',
        priority: 'high',
        dueDate,
        tags: ['work', 'urgent'],
      });
    });

    it('should reject empty title', async () => {
      const response = await agent.execute({
        action: 'create',
        params: { title: '' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Title');
    });

    it('should reject title over 200 characters', async () => {
      const response = await agent.execute({
        action: 'create',
        params: { title: 'x'.repeat(201) },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('200');
    });

    it('should reject invalid priority', async () => {
      const response = await agent.execute({
        action: 'create',
        params: { title: 'Test', priority: 'invalid' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Priority');
    });
  });

  describe('get action', () => {
    it('should get a task by ID', async () => {
      // First create a task
      const createResponse = await agent.execute<Task>({
        action: 'create',
        params: { title: 'Get me' },
      });

      const taskId = createResponse.data?.id;

      const response = await agent.execute<Task>({
        action: 'get',
        params: { id: taskId },
      });

      expect(response.success).toBe(true);
      expect(response.data?.id).toBe(taskId);
      expect(response.data?.title).toBe('Get me');
    });

    it('should return error for non-existent task', async () => {
      const response = await agent.execute({
        action: 'get',
        params: { id: 'non-existent-id' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });

    it('should require id parameter', async () => {
      const response = await agent.execute({
        action: 'get',
        params: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('id');
    });
  });

  describe('update action', () => {
    let taskId: string;

    beforeEach(async () => {
      const createResponse = await agent.execute<Task>({
        action: 'create',
        params: { title: 'Original title' },
      });
      taskId = createResponse.data?.id ?? '';
    });

    it('should update task title', async () => {
      const response = await agent.execute<Task>({
        action: 'update',
        params: { id: taskId, title: 'Updated title' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.title).toBe('Updated title');
    });

    it('should update task status', async () => {
      const response = await agent.execute<Task>({
        action: 'update',
        params: { id: taskId, status: 'in_progress' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.status).toBe('in_progress');
    });

    it('should update multiple fields', async () => {
      const response = await agent.execute<Task>({
        action: 'update',
        params: {
          id: taskId,
          title: 'New title',
          priority: 'urgent',
          status: 'done',
        },
      });

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject({
        title: 'New title',
        priority: 'urgent',
        status: 'done',
      });
    });

    it('should return error for non-existent task', async () => {
      const response = await agent.execute({
        action: 'update',
        params: { id: 'non-existent', title: 'New' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('delete action', () => {
    it('should delete a task', async () => {
      const createResponse = await agent.execute<Task>({
        action: 'create',
        params: { title: 'Delete me' },
      });
      const taskId = createResponse.data?.id ?? '';

      const response = await agent.execute<{ deleted: boolean; id: string }>({
        action: 'delete',
        params: { id: taskId },
      });

      expect(response.success).toBe(true);
      expect(response.data?.deleted).toBe(true);
      expect(response.data?.id).toBe(taskId);

      // Verify task is gone
      const getResponse = await agent.execute({
        action: 'get',
        params: { id: taskId },
      });
      expect(getResponse.success).toBe(false);
    });

    it('should return error for non-existent task', async () => {
      const response = await agent.execute({
        action: 'delete',
        params: { id: 'non-existent' },
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('list action', () => {
    beforeEach(async () => {
      // Clean up any existing tasks
      const existingTasks = await agent.execute<Task[]>({ action: 'list', params: {} });
      for (const task of existingTasks.data || []) {
        await agent.execute({ action: 'delete', params: { id: task.id } });
      }
      
      // Create test tasks
      await agent.execute({ action: 'create', params: { title: 'Task 1', priority: 'low' } });
      await agent.execute({ action: 'create', params: { title: 'Task 2', priority: 'high' } });
      const task3 = await agent.execute<Task>({ 
        action: 'create', 
        params: { title: 'Task 3', priority: 'high' } 
      });
      // Update Task 3 to done status
      await agent.execute({ 
        action: 'update', 
        params: { id: task3.data?.id, status: 'done' } 
      });
    });

    it('should list all tasks', async () => {
      const response = await agent.execute<Task[]>({
        action: 'list',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(3);
    });

    it('should filter by status', async () => {
      const response = await agent.execute<Task[]>({
        action: 'list',
        params: { status: 'pending' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
      expect(response.data?.every((t) => t.status === 'pending')).toBe(true);
    });

    it('should filter by priority', async () => {
      const response = await agent.execute<Task[]>({
        action: 'list',
        params: { priority: 'high' },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
      expect(response.data?.every((t) => t.priority === 'high')).toBe(true);
    });

    it('should respect limit', async () => {
      const response = await agent.execute<Task[]>({
        action: 'list',
        params: { limit: 2 },
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
    });
  });

  describe('getOverdue action', () => {
    it('should return overdue tasks', async () => {
      // Clean up any existing tasks
      const existingTasks = await agent.execute<Task[]>({ action: 'list', params: {} });
      for (const task of existingTasks.data || []) {
        await agent.execute({ action: 'delete', params: { id: task.id } });
      }
      
      // Create an overdue task
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      await agent.execute({
        action: 'create',
        params: { title: 'Overdue task', dueDate: pastDate },
      });

      // Create a future task
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      await agent.execute({
        action: 'create',
        params: { title: 'Future task', dueDate: futureDate },
      });

      const response = await agent.execute<Task[]>({
        action: 'getOverdue',
        params: {},
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0]?.title).toBe('Overdue task');
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
