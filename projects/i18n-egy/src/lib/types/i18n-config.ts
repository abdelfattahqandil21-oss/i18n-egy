import { Language } from './language';
import { StorageStrategy } from './storage-strategy';

/**
 * Configuration interface for the i18n-egy library.
 *
 * @typeParam T - The language identifier type. Defaults to `string`.
 * Use a union literal type to restrict available language IDs
 * and enable compile-time validation.
 *
 * @remarks
 * This configuration is passed to the `provideI18n()` function during
 * application bootstrap. It defines the available languages, default
 * language, and optional storage settings.
 *
 * The generic type parameter `T` enables TypeScript to infer and validate
 * language IDs at compile time, ensuring type safety throughout the application.
 *
 * @example
 * ```typescript
 * // With explicit type inference
 * provideI18n({
 *   defaultLanguage: 'ar',
 *   languages: [
 *     { id: 'ar', dir: 'rtl', nativeName: 'العربية' },
 *     { id: 'en', dir: 'ltr', nativeName: 'English' }
 *   ]
 * });
 *
 * // TypeScript infers T as 'ar' | 'en'
 * // defaultLanguage must be 'ar' or 'en'
 * ```
 */
export interface I18nConfig<T extends string = string> {
  /**
   * Array of available languages supported by the application.
   *
   * @remarks
   * Each language must have a unique `id`. The first language in the
   * array is used as the fallback when the current language is not
   * found in a translation object.
   *
   * @example
   * ```typescript
   * languages: [
   *   { id: 'ar', dir: 'rtl', nativeName: 'العربية' },
   *   { id: 'en', dir: 'ltr', nativeName: 'English' }
   * ]
   * ```
   */
  languages: readonly Language<T>[];

  /**
   * The default language ID used when no stored preference exists.
   *
   * @remarks
   * Must be one of the `id` values from the `languages` array.
   * TypeScript enforces this constraint at compile time when the
   * generic type parameter is properly inferred.
   *
   * @example
   * ```typescript
   * defaultLanguage: 'ar'
   * ```
   */
  defaultLanguage: T;

  /**
   * Custom key for persisting the selected language.
   *
   * @remarks
   * If not provided, defaults to `'i18n-egy.language'`. The library
   * uses this key to store and retrieve the user's language preference
   * in the storage mechanism determined by `storageStrategy`.
   *
   * @default 'i18n-egy.language'
   *
   * @example
   * ```typescript
   * // Use default key
   * storageKey: undefined
   *
   * // Use custom key
   * storageKey: 'my-app-lang'
   * ```
   */
  storageKey?: string;

  /**
   * Determines where the language preference is persisted.
   *
   * @remarks
   * Controls the storage mechanism for the selected language:
   *
   * - `'local'` (default): Uses `localStorage`. The language persists
   *   across browser sessions and tabs.
   * - `'session'`: Uses `sessionStorage`. The language persists within
   *   the current browser tab but resets when the tab is closed.
   * - `'none'`: No persistence. The language resets to `defaultLanguage`
   *   on every page reload. Useful for SSR-only apps or stateless setups.
   *
   * In server-side rendering (SSR) environments, all strategies
   * gracefully degrade to `'none'` behavior since browser storage
   * APIs are not available.
   *
   * @default 'local'
   *
   * @example
   * ```typescript
   * // Persist across sessions (default)
   * storageStrategy: 'local'
   *
   * // Persist only within the current tab
   * storageStrategy: 'session'
   *
   * // No persistence
   * storageStrategy: 'none'
   * ```
   */
  storageStrategy?: StorageStrategy;

  /**
   * Whether to automatically apply `dir` and `lang` attributes to the
   * document's root `<html>` element whenever the language changes.
   *
   * @remarks
   * When enabled (the default), the library keeps `document.documentElement.dir`
   * and `document.documentElement.lang` in sync with the current language on
   * every change, so RTL/LTR layout switches without any manual wiring.
   *
   * Set this to `false` if your application manages the `dir`/`lang`
   * attributes itself (for example, a custom layout shell) and you want to
   * avoid conflicting writes to the DOM.
   *
   * This setting has no effect in SSR environments, where `document` is
   * unavailable and the write is skipped automatically.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // Default: library manages dir/lang automatically
   * provideI18n({ defaultLanguage: 'ar', languages: [...] });
   *
   * // Opt out: handle dir/lang yourself
   * provideI18n({
   *   defaultLanguage: 'ar',
   *   languages: [...],
   *   autoApplyDirection: false,
   * });
   * ```
   */
  autoApplyDirection?: boolean;
}