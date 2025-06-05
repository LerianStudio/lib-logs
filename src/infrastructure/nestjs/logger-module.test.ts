import pino from 'pino';
import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { LoggerModule } from './logger-module';
import { LoggerAggregator } from '../aggregator/logger-aggregator';

jest.mock('pino');

const path = '/test';
const method = 'GET';
const metadata = { userId: '12345' };
const message = 'Test log entry';

@Controller('test')
class TestController {
  constructor(private readonly logger: LoggerAggregator) {}

  @Get('/')
  async test() {
    return await this.logger.runWithContext(
      path,
      method,
      metadata,
      async () => {
        this.logger.info(message, metadata);
        return 'Hello, World!';
      },
    );
  }
}

describe('LoggerModule in NestJS', () => {
  let app: INestApplication;
  let testModule: TestingModule;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    (pino as jest.MockedFunction<typeof pino>).mockReturnValue(mockLogger);

    testModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          debug: true,
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = testModule.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should bootstrap application with LoggerModule', () => {
    expect(app).toBeDefined();
  });

  it('should log a message in the test controller', async () => {
    const testController = app.get(TestController);
    const response = await testController.test();

    expect(response).toBe('Hello, World!');
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(path));
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(method),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(message),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining(metadata.userId),
    );
  });
});
