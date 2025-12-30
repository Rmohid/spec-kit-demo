/**
 * TaskFlow CLI - Validation Schemas
 *
 * Zod schemas for runtime validation of all inputs.
 * These schemas provide both validation and TypeScript type inference.
 *
 * @module validators
 */

import { z } from 'zod';

// =============================================================================
// Common Schemas
// =============================================================================

/**
 * UUID validation schema.
 */
export const UUIDSchema = z.string().uuid('Invalid UUID format');

/**
 * ISO 8601 datetime string schema.
 */
export const DateTimeSchema = z.string().datetime('Invalid datetime format (use ISO 8601)');

/**
 * Optional ISO 8601 datetime that can be null.
 */
export const OptionalDateTimeSchema = DateTimeSchema.nullable().optional();

// =============================================================================
// Task Schemas
// =============================================================================

/**
 * Valid task status values.
 */
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'done', 'cancelled'], {
  errorMap: () => ({ message: 'Status must be: pending, in_progress, done, or cancelled' }),
});

/**
 * Valid task priority values.
 */
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'], {
  errorMap: () => ({ message: 'Priority must be: low, medium, high, or urgent' }),
});

/**
 * Task title validation.
 */
export const TaskTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be 200 characters or less');

/**
 * Task description validation.
 */
export const TaskDescriptionSchema = z
  .string()
  .max(2000, 'Description must be 2000 characters or less')
  .nullable()
  .optional();

/**
 * Task tag validation (single tag).
 */
export const TaskTagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(50, 'Tag must be 50 characters or less');

/**
 * Task tags array validation.
 */
export const TaskTagsSchema = z.array(TaskTagSchema).default([]);

/**
 * Schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: TaskTitleSchema,
  description: TaskDescriptionSchema,
  priority: TaskPrioritySchema.default('medium'),
  dueDate: OptionalDateTimeSchema,
  tags: TaskTagsSchema,
});

/**
 * Schema for updating an existing task.
 */
export const UpdateTaskSchema = z.object({
  title: TaskTitleSchema.optional(),
  description: TaskDescriptionSchema,
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  dueDate: OptionalDateTimeSchema,
  tags: TaskTagsSchema.optional(),
});

/**
 * Schema for task filters when listing.
 */
export const TaskFiltersSchema = z.object({
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  limit: z.number().int().min(1).max(1000).default(50),
});

/**
 * Full task schema (for database records).
 */
export const TaskSchema = z.object({
  id: UUIDSchema,
  title: TaskTitleSchema,
  description: z.string().nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// =============================================================================
// Agent Schemas
// =============================================================================

/**
 * Agent name validation.
 */
export const AgentNameSchema = z
  .string()
  .min(1, 'Agent name is required')
  .regex(/^[a-z][a-z0-9-]*$/, 'Agent name must be lowercase alphanumeric with hyphens');

/**
 * Agent status validation.
 */
export const AgentStatusSchema = z.enum(['active', 'inactive', 'error']);

/**
 * Schema for agent invocation request.
 */
export const AgentRequestSchema = z.object({
  agent: AgentNameSchema,
  action: z.string().min(1, 'Action is required'),
  params: z.record(z.unknown()).default({}),
});

// =============================================================================
// Reasoning Schemas
// =============================================================================

/**
 * Reasoning phase validation.
 */
export const ReasoningPhaseSchema = z.enum(['observe', 'think', 'plan', 'act', 'reflect']);

/**
 * Schema for reasoning options.
 */
export const ReasoningOptionsSchema = z.object({
  maxIterations: z.number().int().min(1).max(100).default(10),
  timeoutMs: z.number().int().min(1000).max(300000).default(30000),
  includeSteps: z.boolean().default(false),
});

/**
 * Schema for reasoning goal input.
 */
export const ReasoningGoalSchema = z
  .string()
  .min(1, 'Goal is required')
  .max(1000, 'Goal must be 1000 characters or less');

// =============================================================================
// Notification Schemas
// =============================================================================

/**
 * Notification type validation.
 */
export const NotificationTypeSchema = z.enum([
  'task_created',
  'task_updated',
  'task_completed',
  'task_overdue',
]);

/**
 * Schema for notification filters.
 */
export const NotificationFiltersSchema = z.object({
  unread: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFilters = z.infer<typeof TaskFiltersSchema>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type ReasoningOptions = z.infer<typeof ReasoningOptionsSchema>;
export type NotificationFilters = z.infer<typeof NotificationFiltersSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate and parse input using a schema.
 * Throws a formatted error if validation fails.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws Error with formatted validation message
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => {
        const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
        return `${path}${e.message}`;
      })
      .join('; ');

    throw new Error(`Validation failed: ${errors}`);
  }

  return result.data;
}

/**
 * Safe validation that returns a result object instead of throwing.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and either data or error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => {
        const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
        return `${path}${e.message}`;
      })
      .join('; ');

    return { success: false, error: errors };
  }

  return { success: true, data: result.data };
}
