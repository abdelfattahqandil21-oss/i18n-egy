import { Direction } from './direction';

/**
 * Represents a supported language in the application.
 *
 * @typeParam T - The language identifier type. Defaults to `string`.
 * Use a union literal type to restrict available language IDs.
 *
 * @remarks
 * Each language definition includes metadata used for display purposes
 * and layout direction determination. The `id` and `dir` properties are
 * required and used internally by the library (language switching,
 * lookups, and automatic `dir`/`lang` application). `nativeName` is
 * optional, presentation-only metadata for consumers building a
 * language switcher UI — the library itself never reads it.
 *
 * @example
 * ```typescript
 * const arabic: Language<'ar'> = {
 *   id: 'ar',
 *   dir: 'rtl',
 *   nativeName: 'العربية',
 * };
 *
 * const english: Language<'en'> = {
 *   id: 'en',
 *   dir: 'ltr',
 *   nativeName: 'English',
 * };
 *
 * // nativeName can be omitted entirely if you don't need it
 * const french: Language<'fr'> = { id: 'fr', dir: 'ltr' };
 * ```
 */
export interface Language<T extends string = string> {
  /**
   * Unique ISO language identifier.
   *
   * @remarks
   * This identifier is used as the key for language operations
   * such as switching languages and looking up translations.
   *
   * @example
   * ```typescript
   * // Common ISO 639-1 codes
   * const id = 'ar'; // Arabic
   * const id = 'en'; // English
   * const id = 'fr'; // French
   * ```
   */
  id: T;

  /**
   * Language name written in its native script.
   *
   * @remarks
   * Optional, presentation-only metadata — the library never reads
   * this value internally. Useful when building a language switcher
   * UI where each language should be displayed in its own script
   * (e.g. so an Arabic speaker recognizes "العربية" regardless of
   * which language the UI currently renders in).
   *
   * @example
   * ```typescript
   * const nativeName = 'العربية'; // Arabic
   * const nativeName = 'Français'; // French
   * const nativeName = 'Deutsch'; // German
   * ```
   */
  nativeName?: string;

  /**
   * Text rendering direction for this language.
   *
   * @remarks
   * Determines whether content should be rendered left-to-right
   * or right-to-left. This affects text alignment, layout, and
   * CSS direction properties.
   *
   * @example
   * ```typescript
   * // RTL languages
   * const dir: Direction = 'rtl'; // Arabic, Hebrew, Persian
   *
   * // LTR languages
   * const dir: Direction = 'ltr'; // English, French, German
   * ```
   */
  dir: Direction;
}