/**
 * Supported storage strategies for persisting the selected language.
 *
 * @remarks
 * This type determines where the language preference is stored.
 * Each strategy has different persistence behavior:
 *
 * - `'local'`: Uses `localStorage`. Persists across browser sessions.
 * - `'session'`: Uses `sessionStorage`. Clears when the tab closes.
 * - `'none'`: No persistence. Language resets to default on page reload.
 *
 * @example
 * ```typescript
 * const strategy: StorageStrategy = 'local';
 * ```
 */
export type StorageStrategy = 'local' | 'session' | 'none';
