import { Pipe, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { Translation } from '../types/translation';

/**
 * Template pipe for translating keys or inline translation objects.
 *
 * @typeParam L - The language identifier type. Defaults to `string`.
 * Inferred from the `I18nService` generic type.
 *
 * @remarks
 * This pipe is **impure** (`pure: false`). This is intentional and required.
 * `I18nService.translate()` reads internal Angular signals
 * (`currentLanguage`, `loadedTranslations`) on every invocation.
 * A pure pipe only re-evaluates when its input reference changes, which
 * would NOT trigger re-translation when the user switches languages.
 * Making the pipe impure ensures Angular calls `transform()` on every
 * change detection cycle, so the latest signal values are always used.
 *
 * The pipe does nothing but delegate to `I18nService.translate()` — no
 * caching, memoization, or additional logic lives here.
 *
 * For class-level usage, prefer injecting `I18nService` directly via
 * `injectLanguage()` and calling `.translate()` in component code.
 * This pipe is a thin convenience for templates only.
 *
 * @example
 * ```html
 * <!-- Key-based (requires a configured loader) -->
 * <p>{{ 'home.title' | translate }}</p>
 * <p>{{ 'home.title' | translate:'Default Title' }}</p>
 *
 * <!-- Inline typed translation (always works) -->
 * <p>{{ { ar: 'مرحبا', en: 'Hello' } | translate }}</p>
 * ```
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe<L extends string = string> {
  private readonly _i18n = inject(I18nService<L>);

  /**
   * Translate a string key using the configured {@link TranslationLoader}.
   *
   * @param key - The translation key to look up in the loaded dictionary.
   * @param defaultValue - Optional fallback string if the key is not found.
   * @returns The translated string, or `defaultValue ?? key` if not found.
   */
  transform(key: string, defaultValue?: string): string;

  /**
   * Translate an inline typed object for the current language.
   *
   * @param translations - A `Translation<L>` record mapping each language
   *   ID to its translated string.
   * @returns The value for the current language, or the first value if the
   *   current language key is missing, or an empty string as last resort.
   */
  transform(translations: Translation<L>): string;

  transform(
    keyOrTranslations: string | Translation<L>,
    defaultValue?: string,
  ): string {
    return this._i18n.translate(keyOrTranslations as any, defaultValue);
  }
}
