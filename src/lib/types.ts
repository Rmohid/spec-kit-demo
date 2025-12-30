/**
 * TaskFlow CLI - Shared TypeScript Types
 *
 * This module defines all shared types used across the application.
 * Types are organized by domain: Tasks, Agents, Reasoning, Notifications.
 *
 * @module types
 */

// =============================================================================
// Task Types
// =============================================================================

/**
 * Valid task status values.
 * Status transitions are enforced by the Task Agent.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';

/**
 * Valid task priority levels.
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * A task entity representing a unit of work.
 */
export interface Task {
  /** Unique identifier (UUID) */
  id: string;
  /** Short description of the task (max 200 chars) */
  title: string;
  /** Detailed description (max 2000 chars) */
  description: string | null;
  /** Current state of the task */
  status: TaskStatus;
  /** Priority level */
  priority: TaskPriority;
  /** Due date in ISO 8601 format */
  dueDate: string | null;
  /** Categorization tags */
  tags: string[];
  /** Creation timestamp (ISO 8601) */
  createdAt: string;
  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}

/**
 * Input for creating a new task.
 * Only title is required; other fields have defaults.
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

/**
 * Input for updating an existing task.
 * All fields are optional; only provided fields are updated.
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
}

/**
 * Filters for listing tasks.
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  limit?: number;
}

// =============================================================================
// Agent Types
// =============================================================================

/**
 * Agent operational status.
 */
export type AgentStatus = 'active' | 'inactive' | 'error';

/**
 * Metadata about an available agent.
 */
export interface AgentInfo {
  /** Unique agent identifier (e.g., 'task-agent') */
  name: string;
  /** Human-readable name */
  displayName: string;
  /** What this agent does */
  description: string;
  /** List of actions this agent can perform */
  capabilities: string[];
  /** Current operational status */
  status: AgentStatus;
}

/**
 * Request to invoke an agent.
 */
export interface AgentRequest {
  /** Name of the agent to invoke */
  agent: string;
  /** Action to perform */
  action: string;
  /** Action parameters */
  params: Record<string, unknown>;
}

/**
 * Response from an agent invocation.
 */
export interface AgentResponse<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Name of the agent that handled the request */
  agent: string;
  /** Action that was performed */
  action: string;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
}

// =============================================================================
// Notification Types
// =============================================================================

/**
 * Types of notifications.
 */
export type NotificationType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_overdue';

/**
 * A notification event.
 */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Type of notification */
  type: NotificationType;
  /** Related task ID */
  taskId: string;
  /** Human-readable message */
  message: string;
  /** Whether notification has been viewed */
  read: boolean;
  /** When notification was created */
  createdAt: string;
}

/**
 * Filters for listing notifications.
 */
export interface NotificationFilters {
  /** Show only unread notifications */
  unread?: boolean;
  /** Maximum number to return */
  limit?: number;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error codes used throughout the application.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'AGENT_ERROR'
  | 'STORAGE_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Structured error information.
 */
export interface TaskFlowErrorInfo {
  /** Error code for programmatic handling */
  code: ErrorCode;
  /** Technical error message */
  message: string;
  /** User-friendly error message */
  userMessage: string;
  /** Additional context */
  details?: Record<string, unknown>;
}

// =============================================================================
// CLI Types
// =============================================================================

/**
 * Global CLI options available on all commands.
 */
export interface GlobalOptions {
  /** Output as JSON instead of human-readable format */
  json?: boolean;
  /** Enable verbose output */
  verbose?: boolean;
}

/**
 * Output format for CLI commands.
 */
export type OutputFormat = 'json' | 'table' | 'text';
