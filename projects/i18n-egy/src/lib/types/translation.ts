/**
 * A translation record mapping language identifiers to their translated strings.
 *
 * @typeParam T - The language identifier type. Must extend `string`.
 *
 * @remarks
 * This type represents an inline translation object where each key
 * is a language identifier and each value is the translated string
 * for that language. It is used with the `translate()` method to
 * provide translations without external translation files.
 *
 * @example
 * ```typescript
 * const saveTranslation: Translation<'ar' | 'en'> = {
 *   ar: 'حفظ',
 *   en: 'Save'
 * };
 *
 * const cancelTranslation: Translation<'ar' | 'en' | 'fr'> = {
 *   ar: 'إلغاء',
 *   en: 'Cancel',
 *   fr: 'Annuler'
 * };
 * ```
 */
export type Translation<T extends string> = Record<T, string>;
