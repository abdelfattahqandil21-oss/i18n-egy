import { LoaderDescriptor, TranslationLoader } from '../types/loader';

/**
 * Wraps a plain `load` function into a {@link LoaderDescriptor} without
 * any dynamic import.
 *
 * @param load - A function that takes a language identifier and returns
 *   a promise of key-value translation pairs.
 * @returns A `LoaderDescriptor` whose `resolve()` immediately returns an
 *   object calling the given function.
 *
 * @remarks
 * Unlike the other factory functions (`jsonLoader`, `httpLoader`,
 * `remoteLoader`), `customLoader` does **not** use a separate `.impl.ts`
 * file — the provided function IS the loader. This is ideal for test
 * mocks, in-memory translations, or any scenario where you want to
 * bypass remote fetching entirely.
 *
 * @example
 * ```typescript
 * import { customLoader } from 'i18n-egy';
 *
 * const loader = customLoader(async (lang) => ({
 *   greeting: lang === 'ar' ? 'مرحبا' : 'Hello',
 * }));
 * const instance = await loader.resolve();
 * const data = await instance.load('ar');
 * // data → { greeting: 'مرحبا' }
 * ```
 */
export function customLoader<L extends string = string>(
  load: (language: L) => Promise<Record<string, unknown>>,
): LoaderDescriptor<L> {
  return {
    async resolve(): Promise<TranslationLoader<L>> {
      return { load };
    },
  };
}
