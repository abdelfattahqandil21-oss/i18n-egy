import { StorageStrategy } from '../types/storage-strategy';

/**
 * Returns the appropriate Storage object based on the strategy.
 *
 * @param strategy - The storage strategy to use.
 * @returns The `Storage` object, or `null` if unavailable.
 *
 * @remarks
 * This is an internal helper. In SSR environments or when strategy
 * is `'none'`, it returns `null`.
 *
 * @internal
 */
function getStorage(strategy: StorageStrategy): Storage | null {
  if (strategy === 'none') {
    return null;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return strategy === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * SSR-safe storage read operation.
 *
 * @param key - The storage key to read.
 * @param strategy - The storage strategy (`'local'`, `'session'`, or `'none'`).
 * @returns The stored value, or `null` if not found or unavailable.
 *
 * @remarks
 * This function safely handles server-side rendering environments
 * where browser storage APIs are not available. It uses `typeof window`
 * checks and wraps the operation in a try-catch to prevent runtime
 * errors in non-browser environments.
 *
 * @example
 * ```typescript
 * // Read from localStorage
 * const lang = safeGetItem('i18n-egy.language', 'local');
 *
 * // Read from sessionStorage
 * const lang = safeGetItem('i18n-egy.language', 'session');
 *
 * // No persistence (always returns null)
 * const lang = safeGetItem('i18n-egy.language', 'none');
 * ```
 */
export function safeGetItem(key: string, strategy: StorageStrategy): string | null {
  const storage = getStorage(strategy);
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * SSR-safe storage write operation.
 *
 * @param key - The storage key to write.
 * @param value - The value to store.
 * @param strategy - The storage strategy (`'local'`, `'session'`, or `'none'`).
 *
 * @remarks
 * This function safely handles server-side rendering environments
 * where browser storage APIs are not available. It uses `typeof window`
 * checks and wraps the operation in a try-catch to prevent runtime
 * errors in non-browser environments or when storage is disabled.
 *
 * @example
 * ```typescript
 * // Write to localStorage
 * safeSetItem('i18n-egy.language', 'ar', 'local');
 *
 * // Write to sessionStorage
 * safeSetItem('i18n-egy.language', 'ar', 'session');
 *
 * // No-op (no persistence)
 * safeSetItem('i18n-egy.language', 'ar', 'none');
 * ```
 */
export function safeSetItem(key: string, value: string, strategy: StorageStrategy): void {
  const storage = getStorage(strategy);
  if (!storage) {
    return;
  }
  try {
    storage.setItem(key, value);
  } catch {
    // Silently fail in environments where storage is not available
  }
}
