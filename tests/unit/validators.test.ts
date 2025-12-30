/**
 * TaskFlow CLI - Validators Unit Tests
 *
 * Tests for Zod validation schemas.
 */

import {
  validate,
  safeValidate,
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFiltersSchema,
  ReasoningGoalSchema,
  ReasoningOptionsSchema,
} from '../../src/lib/validators.js';

describe('Validators', () => {
  describe('CreateTaskSchema', () => {
    it('should validate minimal input', () => {
      const result = safeValidate(CreateTaskSchema, { title: 'Test task' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          title: 'Test task',
          priority: 'medium',
          tags: [],
        });
      }
    });

    it('should validate full input', () => {
      const input = {
        title: 'Full task',
        description: 'A description',
        priority: 'high',
        dueDate: '2025-01-01T00:00:00Z',
        tags: ['work', 'urgent'],
      };

      const result = safeValidate(CreateTaskSchema, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(input);
      }
    });

    it('should reject empty title', () => {
      const result = safeValidate(CreateTaskSchema, { title: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Title');
      }
    });

    it('should reject title over 200 chars', () => {
      const result = safeValidate(CreateTaskSchema, { title: 'x'.repeat(201) });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('200');
      }
    });

    it('should reject invalid priority', () => {
      const result = safeValidate(CreateTaskSchema, {
        title: 'Test',
        priority: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.toLowerCase()).toContain('priority');
      }
    });

    it('should reject description over 2000 chars', () => {
      const result = safeValidate(CreateTaskSchema, {
        title: 'Test',
        description: 'x'.repeat(2001),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('2000');
      }
    });
  });

  describe('UpdateTaskSchema', () => {
    it('should validate empty update (no changes)', () => {
      const result = safeValidate(UpdateTaskSchema, {});

      expect(result.success).toBe(true);
    });

    it('should validate partial update', () => {
      const result = safeValidate(UpdateTaskSchema, {
        title: 'New title',
        status: 'in_progress',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('New title');
        expect(result.data.status).toBe('in_progress');
      }
    });

    it('should reject invalid status', () => {
      const result = safeValidate(UpdateTaskSchema, { status: 'invalid' });

      expect(result.success).toBe(false);
    });

    it('should allow null description', () => {
      const result = safeValidate(UpdateTaskSchema, { description: null });

      expect(result.success).toBe(true);
    });
  });

  describe('TaskFiltersSchema', () => {
    it('should provide defaults', () => {
      const result = safeValidate(TaskFiltersSchema, {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should validate status filter', () => {
      const result = safeValidate(TaskFiltersSchema, { status: 'pending' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('pending');
      }
    });

    it('should validate limit', () => {
      const result = safeValidate(TaskFiltersSchema, { limit: 100 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(100);
      }
    });

    it('should reject limit over 1000', () => {
      const result = safeValidate(TaskFiltersSchema, { limit: 1001 });

      expect(result.success).toBe(false);
    });
  });

  describe('ReasoningGoalSchema', () => {
    it('should validate valid goal', () => {
      const result = safeValidate(ReasoningGoalSchema, 'What should I work on?');

      expect(result.success).toBe(true);
    });

    it('should reject empty goal', () => {
      const result = safeValidate(ReasoningGoalSchema, '');

      expect(result.success).toBe(false);
    });

    it('should reject goal over 1000 chars', () => {
      const result = safeValidate(ReasoningGoalSchema, 'x'.repeat(1001));

      expect(result.success).toBe(false);
    });
  });

  describe('ReasoningOptionsSchema', () => {
    it('should provide defaults', () => {
      const result = safeValidate(ReasoningOptionsSchema, {});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxIterations).toBe(10);
        expect(result.data.timeoutMs).toBe(30000);
        expect(result.data.includeSteps).toBe(false);
      }
    });

    it('should validate custom options', () => {
      const result = safeValidate(ReasoningOptionsSchema, {
        maxIterations: 5,
        timeoutMs: 10000,
        includeSteps: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.maxIterations).toBe(5);
        expect(result.data.timeoutMs).toBe(10000);
        expect(result.data.includeSteps).toBe(true);
      }
    });

    it('should reject maxIterations over 100', () => {
      const result = safeValidate(ReasoningOptionsSchema, { maxIterations: 101 });

      expect(result.success).toBe(false);
    });
  });

  describe('validate helper', () => {
    it('should return data on success', () => {
      const result = validate(CreateTaskSchema, { title: 'Test' });

      expect(result.title).toBe('Test');
    });

    it('should throw on validation failure', () => {
      expect(() => {
        validate(CreateTaskSchema, { title: '' });
      }).toThrow('Validation failed');
    });
  });
});
