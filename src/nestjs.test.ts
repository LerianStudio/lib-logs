// eslint-disable-next-line
const nestjsModule = require('./nestjs');

describe('Index exports', () => {
  it('should have all expected exports available', () => {
    const exportKeys = Object.keys(nestjsModule);

    expect(exportKeys.length).toBeGreaterThan(0);
    expect(exportKeys).toContain('LoggerInterceptor');
    expect(exportKeys).toContain('NestJSLoggerModule');
  });
});
