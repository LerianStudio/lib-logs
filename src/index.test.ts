// eslint-disable-next-line
const indexModule = require('./index');

describe('Index exports', () => {
  it('should export LoggerRepository from domain/repositories/logger-repository', () => {
    expect(indexModule.LoggerRepository).toBeDefined();
  });

  it('should export LoggerAggregator from infrastructure/aggregator/logger-aggregator', () => {
    expect(indexModule.LoggerAggregator).toBeDefined();
  });

  it('should export PinoLoggerRepository from infrastructure/aggregator/pino-logger-aggregator', () => {
    expect(indexModule.PinoLoggerRepository).toBeDefined();
  });

  it('should export NestJSLoggerModule from infrastructure/nestjs/logger-module', () => {
    expect(indexModule.NestJSLoggerModule).toBeDefined();
  });

  it('should have all expected exports available', () => {
    const exportKeys = Object.keys(indexModule);

    expect(exportKeys.length).toBeGreaterThan(0);
    expect(exportKeys).toContain('NestJSLoggerModule');
  });
});
