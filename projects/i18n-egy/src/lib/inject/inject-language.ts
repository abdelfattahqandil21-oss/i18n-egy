import { inject } from "@angular/core";
import { I18nService } from "../services/i18n.service";

/**
 * @example
 * const language = injectLanguage().language;
 * 
 * effect(() => console.log(language()))
 */
export function injectLanguage(){
    return inject(I18nService);
}