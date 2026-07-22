/**
 * A pluggable translation loader that fetches key-based translations
 * for a given language.
 *
 * @typeParam L - The language identifier type. Defaults to `string`.
 *
 * @remarks
 * Implementations of this interface are responsible for retrieving
 * a flat key-value dictionary of translations (e.g. from a JSON file,
 * a remote API, or an in-memory cache). The returned map is merged
 * into the service's `loadedTranslations` signal and made available
 * to the key-based `translate(key)` overload.
 *
 * @example
 * ```typescript
 * const myLoader: TranslationLoader = {
 *   async load(language) {
 *     const res = await fetch(`/i18n/${language}.json`);
 *     return res.json();
 *   },
 * };
 * ```
 */
export interface TranslationLoader<L extends string = string> {
  load(language: L): Promise<Record<string, unknown>>;
}

/**
 * A lazy-evaluated descriptor that produces a {@link TranslationLoader}.
 *
 * @typeParam L - The language identifier type. Defaults to `string`.
 *
 * @remarks
 * Each built-in factory function (`jsonLoader`, `httpLoader`, `remoteLoader`)
 * returns a `LoaderDescriptor`. The descriptor's `resolve()` method performs
 * a dynamic `import()` of the corresponding `.impl.ts` module, keeping the
 * actual loader implementation out of the main bundle until it is first
 * needed.
 *
 * The `I18nService` calls `resolve()` at most once and caches the resulting
 * loader instance for subsequent language changes.
 *
 * @example
 * ```typescript
 * const descriptor = jsonLoader({ path: '/my-i18n' });
 * const loader = await descriptor.resolve();
 * const data = await loader.load('ar');
 * ```
 */
export interface LoaderDescriptor<L extends string = string> {
  resolve(): Promise<TranslationLoader<L>>;
}
