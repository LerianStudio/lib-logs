// eslint-disable-next-line
const indexModule = require('./index');

describe('Index exports', () => {
  it('should have all expected exports available', () => {
    const exportKeys = Object.keys(indexModule);

    expect(exportKeys.length).toBeGreaterThan(0);
    expect(exportKeys).toContain('LoggerRepository');
    expect(exportKeys).toContain('LoggerAggregator');
    expect(exportKeys).toContain('PinoLoggerRepository');
    expect(exportKeys).toContain('RequestIdRepository');
  });
});
