/**
 * TaskFlow CLI - Configuration Module
 *
 * Manages application configuration from environment variables.
 * Uses dotenv for local development and provides typed access to all config values.
 *
 * @module config
 */

import { config as dotenvConfig } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

// Load environment variables from .env file
dotenvConfig();

/**
 * Application configuration interface.
 */
export interface Config {
  /** Database configuration */
  database: {
    /** Path to SQLite database file */
    path: string;
  };
  /** Logging configuration */
  logging: {
    /** Log level: error, warn, info, debug */
    level: string;
    /** Log format: json or text */
    format: 'json' | 'text';
  };
  /** Feature flags */
  features: {
    /** Enable notifications */
    enableNotifications: boolean;
  };
}

/**
 * Get a string environment variable with a default value.
 */
function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Get a boolean environment variable with a default value.
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Ensure the database directory exists.
 */
function ensureDatabaseDirectory(dbPath: string): void {
  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

/**
 * Load and validate configuration from environment variables.
 */
function loadConfig(): Config {
  const dbPath = resolve(getEnvString('DATABASE_PATH', './data/taskflow.db'));

  // Ensure database directory exists
  ensureDatabaseDirectory(dbPath);

  const logFormat = getEnvString('LOG_FORMAT', 'json');
  if (logFormat !== 'json' && logFormat !== 'text') {
    throw new Error(`Invalid LOG_FORMAT: ${logFormat}. Must be 'json' or 'text'.`);
  }

  return {
    database: {
      path: dbPath,
    },
    logging: {
      level: getEnvString('LOG_LEVEL', 'info'),
      format: logFormat,
    },
    features: {
      enableNotifications: getEnvBoolean('ENABLE_NOTIFICATIONS', true),
    },
  };
}

/**
 * Application configuration singleton.
 * Loaded once at module initialization.
 */
export const config: Config = loadConfig();

/**
 * Get the full configuration object.
 * Useful for debugging or displaying current settings.
 */
export function getConfig(): Config {
  return { ...config };
}

/**
 * Check if we're running in development mode.
 */
export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] !== 'production';
}

/**
 * Check if we're running in test mode.
 */
export function isTest(): boolean {
  return process.env['NODE_ENV'] === 'test';
}

export default config;
