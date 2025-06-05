import { RequestIdRepository } from './request-id-repository';

describe('RequestIdRepository', () => {
  let repository: RequestIdRepository;

  beforeEach(() => {
    repository = new RequestIdRepository();
  });

  describe('generate', () => {
    it('should generate a valid UUID v4', () => {
      const id = repository.generate();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate different UUIDs on consecutive calls', () => {
      const id1 = repository.generate();
      const id2 = repository.generate();

      expect(id1).not.toBe(id2);
    });
  });

  describe('get', () => {
    it('should return undefined when no id is set', () => {
      const result = repository.get();

      expect(result).toBeUndefined();
    });

    it('should return the previously set id', () => {
      const testId = 'test-id-123';
      repository.set(testId);

      const result = repository.get();

      expect(result).toBe(testId);
    });
  });

  describe('set', () => {
    it('should store the provided id', () => {
      const testId = 'test-id-456';

      repository.set(testId);

      expect(repository.get()).toBe(testId);
    });

    it('should overwrite previously set id', () => {
      const firstId = 'first-id';
      const secondId = 'second-id';

      repository.set(firstId);
      repository.set(secondId);

      expect(repository.get()).toBe(secondId);
    });
  });
});
