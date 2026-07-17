import { inject } from "@angular/core";
import { I18nService } from "../services/i18n.service";

/**
 * Convenience shorthand for `inject(I18nService)`.
 *
 * @returns The application-wide {@link I18nService} instance.
 *
 * @example
 * ```typescript
 * const i18n = injectLanguage();
 *
 * effect(() => console.log(i18n.currentLanguage()));
 * ```
 */
export function injectLanguage(){
    return inject(I18nService);
}