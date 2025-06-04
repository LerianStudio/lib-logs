import { LoggerAggregator } from './logger-aggregator';
import { LoggerRepository } from '../../domain/repositories/logger-repository';

describe('LoggerAggregator', () => {
  let mockLoggerRepository: jest.Mocked<LoggerRepository>;
  let loggerAggregator: LoggerAggregator;

  beforeEach(() => {
    mockLoggerRepository = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      audit: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<LoggerRepository>;

    loggerAggregator = new LoggerAggregator(mockLoggerRepository);
  });

  describe('runWithContext', () => {
    it('should execute function successfully and finalize context', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const path = '/test';
      const method = 'GET';
      const metadata = { userId: '123' };

      const result = await loggerAggregator.runWithContext(
        path,
        method,
        metadata,
        mockFn,
      );

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'GET /test',
        { events: [] },
        expect.objectContaining({
          duration: expect.stringMatching(/\d+(\.\d+)?s/),
          path: '/test',
          method: 'GET',
          userId: '123',
        }),
      );
    });

    it('should handle errors and add error event', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(
        loggerAggregator.runWithContext('/test', 'POST', {}, mockFn),
      ).rejects.toThrow('Test error');

      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'POST /test',
        {
          events: [
            expect.objectContaining({
              level: 'ERROR',
              message: 'Request failed',
              layer: 'api',
              operation: 'request_error',
              error: error,
            }),
          ],
        },
        expect.any(Object),
      );
    });

    it('should handle non-Error exceptions', async () => {
      const mockFn = jest.fn().mockRejectedValue('string error');

      await expect(
        loggerAggregator.runWithContext('/test', 'POST', {}, mockFn),
      ).rejects.toBe('string error');

      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'POST /test',
        {
          events: [
            expect.objectContaining({
              error: expect.any(Error),
            }),
          ],
        },
        expect.any(Object),
      );
    });
  });

  describe('addEvent', () => {
    it('should add events within context', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.addEvent({
          level: 'info',
          message: 'Test message',
          layer: 'application',
        });
        return 'success';
      });

      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'GET /test',
        {
          events: [
            expect.objectContaining({
              level: 'INFO',
              message: 'Test message',
              layer: 'application',
              timestamp: expect.any(String),
            }),
          ],
        },
        expect.any(Object),
      );
    });

    it('should not add events outside context', () => {
      loggerAggregator.addEvent({
        level: 'info',
        message: 'Test message',
      });

      expect(mockLoggerRepository.info).not.toHaveBeenCalled();
    });
  });

  describe('debug mode', () => {
    it('should skip debug events when debug is disabled', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.addEvent({
          level: 'debug',
          message: 'Debug message',
        });
        return 'success';
      });

      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'GET /test',
        { events: [] },
        expect.any(Object),
      );
    });

    it('should include debug events when debug is enabled', async () => {
      const debugAggregator = new LoggerAggregator(mockLoggerRepository, {
        debug: true,
      });

      await debugAggregator.runWithContext('/test', 'GET', {}, async () => {
        debugAggregator.addEvent({
          level: 'debug',
          message: 'Debug message',
        });
        return 'success';
      });

      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'GET /test',
        {
          events: [
            expect.objectContaining({
              level: 'DEBUG',
              message: 'Debug message',
            }),
          ],
        },
        expect.any(Object),
      );
    });
  });

  describe('logging convenience methods', () => {
    beforeEach(() => {
      jest.spyOn(loggerAggregator, 'addEvent');
    });

    it('should call addEvent with correct parameters for info', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.info('Info message', { key: 'value' });
        return 'success';
      });

      expect(loggerAggregator.addEvent).toHaveBeenCalledWith({
        level: 'info',
        message: 'Info message',
        context: { key: 'value' },
        layer: undefined,
      });
    });

    it('should call addEvent with correct parameters for error', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.error('Error message');
        return 'success';
      });

      expect(loggerAggregator.addEvent).toHaveBeenCalledWith({
        level: 'error',
        message: 'Error message',
        context: undefined,
        layer: undefined,
      });
    });

    it('should call addEvent with correct parameters for warn', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.warn('Warning message');
        return 'success';
      });

      expect(loggerAggregator.addEvent).toHaveBeenCalledWith({
        level: 'warn',
        message: 'Warning message',
        context: undefined,
        layer: undefined,
      });
    });

    it('should call addEvent with correct parameters for audit', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.audit('Audit message');
        return 'success';
      });

      expect(loggerAggregator.addEvent).toHaveBeenCalledWith({
        level: 'audit',
        message: 'Audit message',
        context: undefined,
        layer: undefined,
      });
    });

    it('should handle debug method when debug is disabled', async () => {
      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.debug('Debug message');
        return 'success';
      });

      expect(loggerAggregator.addEvent).not.toHaveBeenCalled();
    });

    it('should handle debug method when debug is enabled', async () => {
      const debugAggregator = new LoggerAggregator(mockLoggerRepository, {
        debug: true,
      });
      jest.spyOn(debugAggregator, 'addEvent');

      await debugAggregator.runWithContext('/test', 'GET', {}, async () => {
        debugAggregator.debug('Debug message');
        return 'success';
      });

      expect(debugAggregator.addEvent).toHaveBeenCalledWith({
        level: 'debug',
        message: 'Debug message',
        context: undefined,
        layer: undefined,
      });
    });

    it('should handle object messages', async () => {
      const messageObj = {
        message: 'Object message',
        layer: 'domain' as const,
        operation: 'test_operation',
        context: { data: 'test' },
      };

      await loggerAggregator.runWithContext('/test', 'GET', {}, async () => {
        loggerAggregator.info(messageObj);
        return 'success';
      });

      expect(loggerAggregator.addEvent).toHaveBeenCalledWith({
        level: 'info',
        message: 'Object message',
        layer: 'domain',
        operation: 'test_operation',
        context: { data: 'test' },
      });
    });
  });

  describe('context isolation', () => {
    it('should isolate events between different contexts', async () => {
      const promise1 = loggerAggregator.runWithContext(
        '/test1',
        'GET',
        {},
        async () => {
          loggerAggregator.info('Message 1');
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'result1';
        },
      );

      const promise2 = loggerAggregator.runWithContext(
        '/test2',
        'POST',
        {},
        async () => {
          loggerAggregator.info('Message 2');
          return 'result2';
        },
      );

      await Promise.all([promise1, promise2]);

      expect(mockLoggerRepository.info).toHaveBeenCalledTimes(2);
      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'GET /test1',
        {
          events: [expect.objectContaining({ message: 'Message 1' })],
        },
        expect.any(Object),
      );
      expect(mockLoggerRepository.info).toHaveBeenCalledWith(
        'POST /test2',
        {
          events: [expect.objectContaining({ message: 'Message 2' })],
        },
        expect.any(Object),
      );
    });
  });
});
