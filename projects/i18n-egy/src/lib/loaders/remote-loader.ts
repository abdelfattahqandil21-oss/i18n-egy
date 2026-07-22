import { LoaderDescriptor } from '../types/loader';

/**
 * Options for the remote translation loader.
 */
export interface RemoteLoaderOptions {
  /**
   * A function that receives a language identifier and returns the URL
   * to fetch translations for that language.
   */
  url: (language: string) => string;
  /** Optional headers to include in the fetch request. */
  headers?: Record<string, string>;
}

/**
 * Creates a {@link LoaderDescriptor} that fetches translations from a
 * dynamically-built URL using the native `fetch()` API.
 *
 * @param options - Configuration for the remote loader.
 * @returns A `LoaderDescriptor` that dynamically imports `RemoteLoader` on
 *   first `resolve()`.
 *
 * @remarks
 * The actual `RemoteLoader` class lives in `remote-loader.impl.ts` and is
 * only loaded via dynamic `import()`, enabling tree-shaking if this loader
 * is never used.
 *
 * Unlike {@link httpLoader}, this factory does not make any assumptions
 * about URL structure — the caller provides a full `url` builder for
 * complete control.
 *
 * @example
 * ```typescript
 * import { remoteLoader } from 'i18n-egy';
 *
 * const loader = remoteLoader({
 *   url: (lang) => `https://api.example.com/v2/i18n/${lang}`,
 *   headers: { Authorization: 'Bearer token' },
 * });
 * const instance = await loader.resolve();
 * const messages = await instance.load('ar');
 * ```
 */
export function remoteLoader(options: RemoteLoaderOptions): LoaderDescriptor<string> {
  return {
    async resolve() {
      const { RemoteLoader } = await import('./remote-loader.impl');
      return new RemoteLoader(options);
    },
  };
}
