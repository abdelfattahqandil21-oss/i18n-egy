/**
 * Supported text directions for internationalized content.
 *
 * @remarks
 * This type is used throughout the library to determine the rendering
 * direction of text content. RTL (right-to-left) is used for languages
 * like Arabic, Hebrew, and Persian. LTR (left-to-right) is used for
 * languages like English, French, and German.
 *
 * @example
 * ```typescript
 * const arabicDir: Direction = 'rtl';
 * const englishDir: Direction = 'ltr';
 * ```
 */
export type Direction = 'ltr' | 'rtl';
