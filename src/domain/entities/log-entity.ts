export type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' | 'AUDIT';

export type LogMetadata = Record<string, any>;

export type LogContext = {
  events?: Record<string, any>;
};

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  traceId?: string;
  metadata?: LogMetadata;
  context?: LogContext;
};
