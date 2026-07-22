import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { I18N_CONFIG } from '../tokens/i18n-config.token';
import { I18nConfig } from '../types/i18n-config';

/**
 * Configures the i18n-egy library for the entire application.
 *
 * @typeParam T - The language identifier type. Inferred from the configuration.
 * @param config - The i18n configuration object.
 * @returns An `EnvironmentProviders` instance to be provided in the application.
 *
 * @remarks
 * This function must be called during application bootstrap to initialize
 * the i18n system. It registers the configuration token and makes the
 * `I18nService` available throughout the application.
 *
 * The generic type parameter `T` is automatically inferred from the
 * `languages` array and `defaultLanguage` property, providing compile-time
 * validation that the default language is one of the configured languages.
 *
 * @example
 * ```typescript
 * // Basic setup
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideI18n({
 *       defaultLanguage: 'ar',
 *       languages: [
 *         {
 *           id: 'ar',
 *           dir: 'rtl',
 *           nativeName: 'العربية'
 *         },
 *         {
 *           id: 'en',
 *           dir: 'ltr',
 *           nativeName: 'English'
 *         }
 *       ]
 *     })
 *   ]
 * });
 * ```
 */
export function provideI18n<L extends string>(config: I18nConfig<L>): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: I18N_CONFIG, useValue: config }]);
}
