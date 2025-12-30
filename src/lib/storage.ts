/**
 * TaskFlow CLI - Storage Module
 *
 * SQLite database interface using better-sqlite3.
 * Provides type-safe access to all data entities.
 *
 * @module storage
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config.js';
import { logger } from './logger.js';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  Notification,
  NotificationFilters,
} from './types.js';

/**
 * Database schema DDL.
 * Creates all required tables if they don't exist.
 */
const SCHEMA = `
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  tags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  task_id TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_task ON notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
`;

/**
 * Storage class providing database operations.
 */
export class Storage {
  private db: Database.Database;

  constructor(dbPath: string = config.database.path) {
    logger.debug('Initializing database', { path: dbPath });

    this.db = new Database(dbPath);

    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');

    // Initialize schema
    this.db.exec(SCHEMA);

    logger.info('Database initialized successfully', { path: dbPath });
  }

  // ===========================================================================
  // Task Operations
  // ===========================================================================

  /**
   * Create a new task.
   */
  createTask(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      title: input.title,
      description: input.description ?? null,
      status: 'pending',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ?? null,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, due_date, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.dueDate,
      JSON.stringify(task.tags),
      task.createdAt,
      task.updatedAt
    );

    logger.debug('Task created', { taskId: task.id, title: task.title });
    return task;
  }

  /**
   * Get a task by ID.
   */
  getTask(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as TaskRow | undefined;

    if (!row) {
      return null;
    }

    return this.rowToTask(row);
  }

  /**
   * Update an existing task.
   */
  updateTask(id: string, input: UpdateTaskInput): Task | null {
    const existing = this.getTask(id);
    if (!existing) {
      return null;
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.status !== undefined) {
      updates.push('status = ?');
      values.push(input.status);
    }
    if (input.priority !== undefined) {
      updates.push('priority = ?');
      values.push(input.priority);
    }
    if (input.dueDate !== undefined) {
      updates.push('due_date = ?');
      values.push(input.dueDate);
    }
    if (input.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(input.tags));
    }

    if (updates.length === 0) {
      return existing;
    }

    const now = new Date().toISOString();
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    stmt.run(...values);

    logger.debug('Task updated', { taskId: id });
    return this.getTask(id);
  }

  /**
   * Delete a task by ID.
   */
  deleteTask(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    const deleted = result.changes > 0;
    if (deleted) {
      logger.debug('Task deleted', { taskId: id });
    }

    return deleted;
  }

  /**
   * List tasks with optional filters.
   */
  listTasks(filters: TaskFilters = {}): Task[] {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params: unknown[] = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as TaskRow[];

    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get overdue tasks.
   */
  getOverdueTasks(): Task[] {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE due_date IS NOT NULL 
        AND due_date < ? 
        AND status NOT IN ('done', 'cancelled')
      ORDER BY due_date ASC
    `);

    const rows = stmt.all(now) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  // ===========================================================================
  // Notification Operations
  // ===========================================================================

  /**
   * Create a notification.
   */
  createNotification(
    type: Notification['type'],
    taskId: string,
    message: string
  ): Notification {
    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = this.db.prepare(`
      INSERT INTO notifications (id, type, task_id, message, read, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    stmt.run(id, type, taskId, message, now);

    return {
      id,
      type,
      taskId,
      message,
      read: false,
      createdAt: now,
    };
  }

  /**
   * List notifications with optional filters.
   */
  listNotifications(filters: NotificationFilters = {}): Notification[] {
    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params: unknown[] = [];

    if (filters.unread) {
      sql += ' AND read = 0';
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as NotificationRow[];

    return rows.map((row) => ({
      id: row.id,
      type: row.type as Notification['type'],
      taskId: row.task_id,
      message: row.message,
      read: row.read === 1,
      createdAt: row.created_at,
    }));
  }

  /**
   * Mark all notifications as read.
   */
  markAllNotificationsRead(): number {
    const stmt = this.db.prepare('UPDATE notifications SET read = 1 WHERE read = 0');
    const result = stmt.run();
    return result.changes;
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Close the database connection.
   */
  close(): void {
    this.db.close();
    logger.debug('Database connection closed');
  }

  /**
   * Convert a database row to a Task object.
   */
  private rowToTask(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      dueDate: row.due_date,
      tags: JSON.parse(row.tags) as string[],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ===========================================================================
// Row Types (database representation)
// ===========================================================================

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface NotificationRow {
  id: string;
  type: string;
  task_id: string;
  message: string;
  read: number;
  created_at: string;
}

// ===========================================================================
// Singleton Instance
// ===========================================================================

let storageInstance: Storage | null = null;

/**
 * Get the storage singleton instance.
 * Creates a new instance if one doesn't exist.
 */
export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = new Storage();
  }
  return storageInstance;
}

/**
 * Reset the storage instance (for testing).
 */
export function resetStorage(): void {
  if (storageInstance) {
    storageInstance.close();
    storageInstance = null;
  }
}

export default Storage;
