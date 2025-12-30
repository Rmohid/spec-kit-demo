/**
 * TaskFlow CLI - Logger Module
 *
 * Provides structured logging using Winston.
 * Supports JSON format for production and colorized text for development.
 *
 * @module logger
 */

import winston from 'winston';
import { config, isDevelopment } from './config.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

/**
 * Custom format for human-readable console output.
 */
const humanReadableFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
  let msg = `${ts} [${level}]: ${message}`;

  // Add metadata if present (excluding standard fields)
  const metaKeys = Object.keys(metadata).filter(
    (key) => !['service', 'level', 'message', 'timestamp'].includes(key)
  );

  if (metaKeys.length > 0) {
    const metaStr = metaKeys
      .map((key) => `${key}=${JSON.stringify(metadata[key])}`)
      .join(' ');
    msg += ` ${metaStr}`;
  }

  return msg;
});

/**
 * Create the console transport based on environment.
 */
function createConsoleTransport(): winston.transport {
  if (isDevelopment() || config.logging.format === 'text') {
    // Human-readable format for development
    return new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), humanReadableFormat),
    });
  }

  // JSON format for production
  return new winston.transports.Console({
    format: combine(timestamp(), errors({ stack: true }), json()),
  });
}

/**
 * Create the Winston logger instance.
 */
function createLogger(): winston.Logger {
  const transports: winston.transport[] = [createConsoleTransport()];

  return winston.createLogger({
    level: config.logging.level,
    defaultMeta: { service: 'taskflow' },
    format: combine(timestamp(), errors({ stack: true }), json()),
    transports,
  });
}

/**
 * Main logger instance.
 * Use this for all logging throughout the application.
 */
export const logger = createLogger();

/**
 * Create a child logger with additional default metadata.
 * Useful for adding context like agent name or request ID.
 *
 * @param metadata - Additional metadata to include in all log entries
 * @returns A child logger instance
 *
 * @example
 * const agentLogger = createChildLogger({ agent: 'task-agent' });
 * agentLogger.info('Processing request'); // Includes agent: 'task-agent'
 */
export function createChildLogger(
  metadata: Record<string, string | number | boolean>
): winston.Logger {
  return logger.child(metadata);
}

/**
 * Log levels available:
 * - error: Error conditions that require immediate attention
 * - warn: Warning conditions that should be investigated
 * - info: Informational messages about normal operation
 * - debug: Detailed debug information for troubleshooting
 */

// Convenience exports for direct level access
export const { error, warn, info, debug } = logger;

export default logger;
