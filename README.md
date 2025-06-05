# lib-logs

A sophisticated logging library for Node.js applications with built-in request aggregation and NestJS support.

## ✨ Features

- 🚀 **Request-scoped logging** - Aggregates all logs per request using AsyncLocalStorage
- 📊 **Timeline generation** - Creates a complete timeline of events for each request
- 🔧 **NestJS integration** - Ready-to-use module for NestJS applications
- 🎯 **Multiple log levels** - Support for info, error, warn, debug, and audit logs
- 📝 **Pino integration** - High-performance logging with Pino
- 🎨 **Pretty formatting** - Beautiful console output in development
- 🛡️ **TypeScript support** - Fully typed with comprehensive type definitions
- ⚡ **Performance optimized** - Minimal overhead with efficient event collection
- 🧪 **Well tested** - Comprehensive test coverage

---

## 🚀 Installation

```bash
npm install @lerian/lib-logs
```

## 📖 Usage

### Basic Usage

```typescript
import { LoggerAggregator, PinoLoggerRepository } from 'lib-logs';

// Create a logger repository
const loggerRepository = new PinoLoggerRepository({ debug: true });

// Create the aggregator
const logger = new LoggerAggregator(loggerRepository, { debug: true });

// Use within a request context
async function handleRequest() {
  return await logger.runWithContext(
    '/api/users',
    'GET',
    { userId: '123' },
    async () => {
      logger.info('Processing user request');
      logger.debug('Fetching user data');

      // Your business logic here

      logger.info('Request completed successfully');
      return { success: true };
    },
  );
}
```

### NestJS Integration

```typescript
import { Module } from '@nestjs/common';
import { NestJSLoggerModule } from 'lib-logs/nestjs';

@Module({
  imports: [
    NestJSLoggerModule.forRoot({
      debug: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class AppModule {}
```

Using in a controller:

```typescript
import { Controller, Get, Injectable } from '@nestjs/common';
import { LoggerAggregator } from 'lib-logs';

@Controller('users')
export class UsersController {
  constructor(private readonly logger: LoggerAggregator) {}

  @Get()
  async getUsers() {
    return await this.logger.runWithContext('/users', 'GET', {}, async () => {
      this.logger.info('Fetching users');

      // Your logic here

      return { users: [] };
    });
  }
}
```

### Advanced Usage with Layers

```typescript
logger.info({
  message: 'User created successfully',
  layer: 'domain',
  operation: 'create_user',
  context: { userId: '123', email: 'user@example.com' },
});

logger.error({
  message: 'Database connection failed',
  layer: 'infrastructure',
  operation: 'db_connect',
  context: { host: 'localhost', port: 5432 },
});
```

### Using the Logger Interceptor

To automatically log all HTTP requests and responses, register the `LoggerInterceptor`:

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NestJSLoggerModule, LoggerInterceptor } from 'lib-logs/nestjs';

@Module({
  imports: [
    NestJSLoggerModule.forRoot({
      debug: process.env.NODE_ENV === 'development',
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
```

This automatically wraps all route handlers with logging context, eliminating the need to manually call `runWithContext`:

## 🏗️ Architecture

The library follows a clean architecture pattern with clear separation of concerns:

### Core Components

- **[`LoggerRepository`](src/domain/repositories/logger-repository.ts)** - Abstract interface for logging implementations
- **[`PinoLoggerRepository`](src/infrastructure/pino/pino-logger-repository.ts)** - Pino-based implementation
- **[`LoggerAggregator`](src/infrastructure/aggregator/logger-aggregator.ts)** - Request-scoped log aggregation
- **[`LoggerModule`](src/infrastructure/nestjs/logger-module.ts)** - NestJS integration module

### Key Features

#### Request-Scoped Logging

Uses AsyncLocalStorage to maintain request context and collect all logs generated during a request's lifecycle:

```typescript
await logger.runWithContext('/api/endpoint', 'POST', metadata, async () => {
  // All logs here are automatically associated with this request
  logger.info('Step 1 completed');
  logger.debug('Processing data');
  logger.info('Step 2 completed');
});
// Automatically generates a timeline with duration and metadata
```

#### Log Levels and Layers

Supports multiple log levels and architectural layers:

- **Levels**: `info`, `error`, `warn`, `debug`, `audit`
- **Layers**: `api`, `application`, `infrastructure`, `domain`

#### Error Handling

Automatically captures and logs errors while preserving the original error flow:

```typescript
await logger.runWithContext('/api/users', 'POST', {}, async () => {
  throw new Error('Something went wrong');
  // Error is automatically logged and request timeline is still generated
});
```

## 📊 Log Output

The library generates structured logs with complete request timelines:

```json
{
  "level": "INFO",
  "message": "POST /api/users",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "context": {
    "events": [
      {
        "timestamp": "2024-01-01T12:00:00.100Z",
        "level": "INFO",
        "message": "Processing user creation",
        "layer": "application"
      },
      {
        "timestamp": "2024-01-01T12:00:00.200Z",
        "level": "DEBUG",
        "message": "Validating user data",
        "layer": "domain"
      }
    ]
  },
  "metadata": {
    "duration": "0.150s",
    "path": "/api/users",
    "method": "POST",
    "userId": "123"
  }
}
```

## ⚙️ Configuration

### PinoLoggerRepository Options

```typescript
const logger = new PinoLoggerRepository({
  debug: true, // Enable debug logging
});
```

### LoggerAggregator Options

```typescript
const aggregator = new LoggerAggregator(loggerRepository, {
  debug: true, // Include debug events in timeline
});
```

### Environment-Based Configuration

The library automatically adapts to different environments:

- **Development**: Pretty-formatted console output with colors
- **Production**: Structured JSON logs optimized for log aggregation systems

## 🧪 Testing

The library is thoroughly tested with Jest:

```bash
npm test
npm run test:cov  # With coverage
```

## 📝 API Reference

### LoggerAggregator

#### Methods

- `runWithContext(path, method, metadata, fn)` - Execute function within logging context
- `info(message, context?)` - Log info message
- `error(message, context?)` - Log error message
- `warn(message, context?)` - Log warning message
- `debug(message, context?)` - Log debug message (if debug enabled)
- `audit(message, context?)` - Log audit message
- `addEvent(event)` - Add custom event to current context

### LoggerRepository

Abstract base class for logging implementations with methods:

- `info(message, context?, metadata?)`
- `error(message, context?, metadata?)`
- `warn(message, context?, metadata?)`
- `debug(message, context?, metadata?)`
- `audit(message, context?, metadata?)`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🏢 About

Created by [Lerian Studio](https://lerian.studio) - Building the future of software development.
