import { safeGetItem, safeSetItem } from './storage';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('safeGetItem', () => {
    it('should read from localStorage with local strategy', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(safeGetItem('test-key', 'local')).toBe('test-value');
    });

    it('should read from sessionStorage with session strategy', () => {
      sessionStorage.setItem('test-key', 'test-value');
      expect(safeGetItem('test-key', 'session')).toBe('test-value');
    });

    it('should return null with none strategy', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(safeGetItem('test-key', 'none')).toBeNull();
    });

    it('should return null for non-existent key', () => {
      expect(safeGetItem('non-existent', 'local')).toBeNull();
    });
  });

  describe('safeSetItem', () => {
    it('should write to localStorage with local strategy', () => {
      safeSetItem('test-key', 'test-value', 'local');
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should write to sessionStorage with session strategy', () => {
      safeSetItem('test-key', 'test-value', 'session');
      expect(sessionStorage.getItem('test-key')).toBe('test-value');
    });

    it('should not write with none strategy', () => {
      safeSetItem('test-key', 'test-value', 'none');
      expect(localStorage.getItem('test-key')).toBeNull();
      expect(sessionStorage.getItem('test-key')).toBeNull();
    });

    it('should overwrite existing value', () => {
      safeSetItem('test-key', 'old-value', 'local');
      safeSetItem('test-key', 'new-value', 'local');
      expect(localStorage.getItem('test-key')).toBe('new-value');
    });
  });
});
