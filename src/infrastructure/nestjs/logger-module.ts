import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerAggregator } from '../aggregator/logger-aggregator';
import { LoggerRepository } from '../../domain/repositories/logger-repository';
import { PinoLoggerRepository } from '../pino/pino-logger-repository';

@Global()
@Module({})
export class LoggerModule {
  static forRoot({ debug = false } = {}): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LoggerRepository,
          useFactory: () => new PinoLoggerRepository({ debug }),
        },
        {
          provide: LoggerAggregator,
          useFactory: (loggerRepository: LoggerRepository) => {
            return new LoggerAggregator(loggerRepository);
          },
          inject: [LoggerRepository],
        },
      ],
      exports: [LoggerRepository, LoggerAggregator],
    };
  }
}
