import { Direction } from './direction';

/**
 * Represents a supported language in the application.
 *
 * @typeParam T - The language identifier type. Defaults to `string`.
 * Use a union literal type to restrict available language IDs.
 *
 * @remarks
 * Each language definition includes metadata used for display purposes
 * and layout direction determination. The `id` property serves as the
 * unique identifier for the language and is used throughout the library
 * to reference specific languages.
 *
 * @example
 * ```typescript
 * const arabic: Language<'ar'> = {
 *   id: 'ar',
 *   nativeName: 'العربية',
 *   displayName: 'Arabic',
 *   dir: 'rtl'
 * };
 *
 * const english: Language<'en'> = {
 *   id: 'en',
 *   nativeName: 'English',
 *   displayName: 'English',
 *   dir: 'ltr'
 * };
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
   * This is displayed to users who are familiar with the language
   * and is useful for language switcher UIs.
   *
   * @example
   * ```typescript
   * const nativeName = 'العربية'; // Arabic
   * const nativeName = 'Français'; // French
   * const nativeName = 'Deutsch'; // German
   * ```
   */
  nativeName: string;

  /**
   * Language name written in the application's primary language.
   *
   * @remarks
   * This is the localized display name of the language, useful
   * for showing language options to users who may not recognize
   * native script names.
   *
   * @example
   * ```typescript
   * const displayName = 'Arabic';
   * const displayName = 'French';
   * ```
   */
  displayName: string;

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
