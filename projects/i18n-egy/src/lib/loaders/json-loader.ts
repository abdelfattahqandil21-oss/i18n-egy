import { LoaderDescriptor } from '../types/loader';

/**
 * Creates a {@link LoaderDescriptor} that loads JSON translation files
 * from a given base path.
 *
 * @param options - Optional configuration.
 * @param options.path - Base directory for language JSON files.
 *   Defaults to `'assets/i18n'`. The final URL becomes `{path}/{language}.json`.
 * @returns A `LoaderDescriptor` that dynamically imports `JsonLoader` on
 *   first `resolve()`.
 *
 * @remarks
 * The actual `JsonLoader` class lives in `json-loader.impl.ts` and is only
 * loaded via dynamic `import()` when `resolve()` is called, enabling
 * tree-shaking if this loader is never used.
 *
 * @example
 * ```typescript
 * import { jsonLoader } from 'i18n-egy';
 *
 * const loader = jsonLoader({ path: '/my-i18n/files' });
 * const instance = await loader.resolve();
 * const messages = await instance.load('ar');
 * ```
 */
export function jsonLoader(options?: { path?: string }): LoaderDescriptor<string> {
  return {
    async resolve() {
      const { JsonLoader } = await import('./json-loader.impl');
      return new JsonLoader(options);
    },
  };
}
