import pino, { BaseLogger, LoggerOptions } from 'pino';
import {
  LogContext,
  LogMetadata,
  LogEntry,
} from '../../domain/entities/log-entity';
import { LoggerRepository } from '../../domain/repositories/logger-repository';
import pretty from 'pino-pretty';

export class PinoLoggerRepository implements LoggerRepository {
  private logger: BaseLogger;

  constructor(private readonly options: { debug?: boolean } = {}) {
    this.logger = this.initializeLogger();
  }

  private initializeLogger(): BaseLogger {
    const loggerOptions: LoggerOptions = {
      level: this.options.debug ? 'debug' : 'info',
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        env: process.env.NODE_ENV || 'production',
      },
    };

    if (process.env.NODE_ENV === 'development') {
      return pino(
        loggerOptions,
        pretty({
          colorize: true,
          ignore: 'pid,hostname,level',
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
        }),
      );
    }

    return pino(loggerOptions);
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    metadata: LogMetadata | undefined,
    context: LogContext,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
      context,
    };
  }

  info(message: string, context: LogContext, metadata?: LogMetadata): void {
    const logEntry = this.createLogEntry('INFO', message, metadata, context);
    this.logger.info(JSON.stringify(logEntry));
  }

  error(message: string, context: LogContext, metadata?: LogMetadata): void {
    const logEntry = this.createLogEntry('ERROR', message, metadata, context);
    this.logger.error(JSON.stringify(logEntry));
  }

  warn(message: string, context: LogContext, metadata?: LogMetadata): void {
    const logEntry = this.createLogEntry('WARN', message, metadata, context);
    this.logger.warn(JSON.stringify(logEntry));
  }

  debug(message: string, context: LogContext, metadata?: LogMetadata): void {
    const logEntry = this.createLogEntry('DEBUG', message, metadata, context);
    this.logger.debug(JSON.stringify(logEntry));
  }

  audit(message: string, context: LogContext, metadata?: LogMetadata): void {
    const logEntry = this.createLogEntry('AUDIT', message, metadata, context);
    this.logger.info(JSON.stringify(logEntry));
  }
}
