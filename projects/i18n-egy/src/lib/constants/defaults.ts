import { Direction } from '../types/direction';
import { StorageStrategy } from '../types/storage-strategy';

/**
 * Default localStorage key used to persist the selected language.
 *
 * @remarks
 * This constant is used when no custom `storageKey` is provided
 * in the `I18nConfig`. It ensures a consistent and predictable
 * storage key across the application.
 *
 * @example
 * ```typescript
 * // Equivalent to:
 * localStorage.getItem('i18n-egy.language');
 * ```
 */
export const DEFAULT_STORAGE_KEY = 'i18n-egy.language';

/**
 * Default storage strategy for persisting the selected language.
 *
 * @remarks
 * Used as a fallback when no `storageStrategy` is specified
 * in the `I18nConfig`. Persists the language across browser
 * sessions and tabs via `localStorage`.
 *
 * @example
 * ```typescript
 * const strategy: StorageStrategy = DEFAULT_STORAGE_STRATEGY; // 'local'
 * ```
 */
export const DEFAULT_STORAGE_STRATEGY: StorageStrategy = 'local';

/**
 * Default text direction fallback.
 *
 * @remarks
 * Used as a fallback direction when a language definition does not
 * specify a direction. Left-to-right is the most common direction
 * for world languages.
 *
 * @example
 * ```typescript
 * const dir: Direction = DEFAULT_DIRECTION; // 'ltr'
 * ```
 */
export const DEFAULT_DIRECTION: Direction = 'ltr';
