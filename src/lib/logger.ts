import pino from 'pino';

export const LOG_LEVELS = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

const level: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 
                        (process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO) || LOG_LEVELS.INFO;

// Browser-friendly Pino configuration
const logger = pino({
  level,
  // In the browser, Pino writes to the console. Output as objects for structured logs.
  browser: { asObject: true },
  formatters: {
    level: (label: string) => ({ level: label }),
  },
});

export const createLogger = (context: string) => logger.child({ context });

// Commonly used child loggers
export const authLogger = createLogger('auth');
export const apiLogger = createLogger('api');
export const uiLogger = createLogger('ui');

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({ err: error, ...context }, error.message);
};

export { logger };


