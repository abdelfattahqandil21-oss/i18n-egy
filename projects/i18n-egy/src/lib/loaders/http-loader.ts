import { LoaderDescriptor } from '../types/loader';

/**
 * Options for the HTTP translation loader.
 */
export interface HttpLoaderOptions {
  /** Base URL endpoint for translation requests. */
  endpoint: string;
  /** HTTP method to use. Defaults to `'GET'`. */
  method?: string;
  /**
   * Custom URL builder. Receives the language identifier and should
   * return the full URL. Defaults to `language => \`${endpoint}/${language}\``.
   */
  buildUrl?: (language: string) => string;
}

/**
 * Creates a {@link LoaderDescriptor} that fetches translations from an HTTP
 * endpoint using the native `fetch()` API.
 *
 * @param options - Configuration for the HTTP loader.
 * @returns A `LoaderDescriptor` that dynamically imports `HttpLoader` on
 *   first `resolve()`.
 *
 * @remarks
 * The actual `HttpLoader` class lives in `http-loader.impl.ts` and is only
 * loaded via dynamic `import()`, enabling tree-shaking if this loader is
 * never used.
 *
 * The loader uses plain `fetch()` and does **not** depend on Angular's
 * `HttpClient` or any DI token.
 *
 * @example
 * ```typescript
 * import { httpLoader } from 'i18n-egy';
 *
 * const loader = httpLoader({
 *   endpoint: 'https://api.example.com/translations',
 * });
 * const instance = await loader.resolve();
 * const messages = await instance.load('ar');
 * ```
 */
export function httpLoader(options: HttpLoaderOptions): LoaderDescriptor<string> {
  return {
    async resolve() {
      const { HttpLoader } = await import('./http-loader.impl');
      return new HttpLoader(options);
    },
  };
}
