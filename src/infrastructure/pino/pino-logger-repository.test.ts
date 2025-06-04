import pino from 'pino';
import pretty from 'pino-pretty';
import { PinoLoggerRepository } from './pino-logger-repository';

jest.mock('pino');
jest.mock('pino-pretty');

describe('PinoLoggerRepository', () => {
  let mockLogger: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    (pino as jest.MockedFunction<typeof pino>).mockReturnValue(mockLogger);
    (pretty as jest.MockedFunction<typeof pretty>).mockReturnValue({} as any);
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize logger with default options', () => {
      new PinoLoggerRepository();
      expect(pino).toHaveBeenCalled();
    });

    it('should initialize logger with debug option', () => {
      new PinoLoggerRepository({ debug: true });
      expect(pino).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'debug' }),
      );
    });

    it('should use pretty formatter in development environment', () => {
      process.env.NODE_ENV = 'development';
      new PinoLoggerRepository();
      expect(pretty).toHaveBeenCalled();
      expect(pino).toHaveBeenCalledWith(expect.any(Object), {});
    });
  });

  describe('logging methods', () => {
    let repository: PinoLoggerRepository;
    const context = { events: { userId: '123', requestId: 'req-456' } };
    const metadata = { extra: 'data' };

    beforeEach(() => {
      repository = new PinoLoggerRepository();
    });

    it('should log info message', () => {
      repository.info('Test message', context, metadata);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('"level":"INFO"'),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Test message"'),
      );
    });

    it('should log error message', () => {
      repository.error('Error message', context, metadata);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"'),
      );
    });

    it('should log warn message', () => {
      repository.warn('Warning message', context, metadata);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('"level":"WARN"'),
      );
    });

    it('should log debug message', () => {
      repository.debug('Debug message', context, metadata);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('"level":"DEBUG"'),
      );
    });

    it('should log audit message', () => {
      repository.audit('Audit message', context, metadata);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('"level":"AUDIT"'),
      );
    });

    it('should handle missing metadata', () => {
      repository.info('Test message', context);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('"metadata":{}'),
      );
    });

    it('should include timestamp in log entry', () => {
      const dateSpy = jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue('2023-01-01T00:00:00.000Z');
      repository.info('Test message', context);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('"timestamp":"2023-01-01T00:00:00.000Z"'),
      );
      dateSpy.mockRestore();
    });
  });
});
