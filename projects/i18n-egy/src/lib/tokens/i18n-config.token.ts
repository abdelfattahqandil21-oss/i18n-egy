import { InjectionToken } from '@angular/core';
import { I18nConfig } from '../types/i18n-config';

/**
 * Internal InjectionToken for the i18n configuration.
 *
 * @remarks
 * This token is used internally by the library to provide the
 * configuration to the `I18nService`. Library consumers should
 * NOT use this token directly. Instead, use the `provideI18n()`
 * function to configure the library.
 *
 * @internal
 */
export const I18N_CONFIG = new InjectionToken<I18nConfig>('I18N_CONFIG');
