import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DEFAULT_STORAGE_KEY, DEFAULT_STORAGE_STRATEGY } from '../constants/defaults';
import { I18N_CONFIG } from '../tokens/i18n-config.token';
import { Direction } from '../types/direction';
import { Language } from '../types/language';
import { StorageStrategy } from '../types/storage-strategy';
import { Translation } from '../types/translation';
import { safeGetItem, safeSetItem } from '../utils/storage';

/**
 * Core service for internationalization (i18n) in Angular applications.
 *
 * @remarks
 * `I18nService` is the single source of truth for all i18n-related state.
 * It uses Angular Signals internally and exposes readonly signals for
 * reactive state consumption.
 *
 * The service manages:
 * - Current language selection
 * - Language list
 * - Text direction (LTR/RTL)
 * - Language persistence (configurable: localStorage, sessionStorage, or none)
 * - Inline translation resolution
 *
 * @example
 * ```typescript
 * // Inject the service
 * const i18n = inject(I18nService);
 *
 * // Read current state via signals
 * console.log(i18n.currentLanguage());     // 'ar'
 * console.log(i18n.dir());                 // 'rtl'
 * console.log(i18n.isRtl());              // true
 *
 * // Switch languages
 * i18n.setLanguage('en');
 * i18n.next();
 * i18n.toggle();
 *
 * // Translate inline
 * const label = i18n.translate({ ar: 'حفظ', en: 'Save' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class I18nService<L extends string = string> {
  private readonly _config = inject(I18N_CONFIG) as import('../types/i18n-config').I18nConfig<L>;
  private readonly _storageKey = this._config.storageKey ?? DEFAULT_STORAGE_KEY;
  private readonly _storageStrategy: StorageStrategy =
    this._config.storageStrategy ?? DEFAULT_STORAGE_STRATEGY;

  private readonly _currentLanguageId = signal<L>(this._resolveInitialLanguage());
  private readonly _languages = signal<readonly Language<L>[]>(this._config.languages);

  /**
   * Signal that emits whenever the language changes.
   *
   * @returns A `Signal` of the new language ID after each change.
   *
   * @remarks
   * This signal is useful for side effects that should run on every
   * language change, such as analytics tracking or document metadata updates.
   *
   * @example
   * ```typescript
   * const i18n = inject(I18nService);
   * effect(() => {
   *   console.log('Language changed to:', i18n.languageChanged());
   * });
   * ```
   */
  readonly languageChanged = computed<L>(() => this._currentLanguageId());

  /**
   * Reactive signal containing all configured languages.
   *
   * @returns A `Signal` of readonly language array.
   *
   * @example
   * ```typescript
   * const langs = i18n.languages();
   * // [{ id: 'ar', nativeName: 'العربية', ... }, { id: 'en', ... }]
   * ```
   */
  readonly languages = this._languages.asReadonly();

  /**
   * Reactive signal of the current language ID string.
   *
   * @returns A `Signal` of the current language identifier.
   *
   * @example
   * ```typescript
   * const currentId = i18n.currentLanguage();
   * // 'ar'
   * ```
   */
  readonly currentLanguage = this._currentLanguageId.asReadonly();

  /**
   * Reactive signal of the current language object.
   *
   * @returns A `Signal` of the full `Language` object matching the current language ID.
   *
   * @example
   * ```typescript
   * const lang = i18n.currentLanguageObject();
   * console.log(lang.nativeName); // 'العربية'
   * console.log(lang.dir);        // 'rtl'
   * ```
   */
  readonly currentLanguageObject = computed<Language<L>>(() => {
    const id = this._currentLanguageId();
    return this._languages().find((l) => l.id === id) ?? this._languages()[0];
  });

  /**
   * Reactive signal of the current text direction.
   *
   * @returns A `Signal` of the `Direction` (`'ltr'` or `'rtl'`).
   *
   * @example
   * ```typescript
   * const dir = i18n.dir();
   * // 'rtl'
   * ```
   */
  readonly dir = computed<Direction>(() => this.currentLanguageObject().dir);

  /**
   * Reactive signal indicating whether the current language is right-to-left.
   *
   * @returns A `Signal` of `boolean`. `true` if the current direction is RTL.
   *
   * @example
   * ```typescript
   * const isRtl = i18n.isRtl();
   * // true
   * ```
   */
  readonly isRtl = computed<boolean>(() => this.dir() === 'rtl');

  constructor() {
    if (this._config.languages.length === 0) {
      throw new Error('[i18n-egy] At least one language must be provided in the languages array.');
    }
    if (!this._config.languages.some((l) => l.id === this._config.defaultLanguage)) {
      throw new Error(
        `[i18n-egy] defaultLanguage "${this._config.defaultLanguage}" must be one of the configured language IDs.`,
      );
    }

    effect(() => {
      const id = this._currentLanguageId();
      safeSetItem(this._storageKey, id, this._storageStrategy);
    });
  }

  /**
   * Returns a language by its identifier.
   *
   * @param id - The language identifier to look up.
   * @returns The `Language` object if found, otherwise `undefined`.
   *
   * @example
   * ```typescript
   * const arabic = i18n.getLanguage('ar');
   * console.log(arabic?.nativeName); // 'العربية'
   * ```
   */
  getLanguage(id: L): Language<L> | undefined {
    return this._languages().find((l) => l.id === id);
  }

  /**
   * Translates a key with an optional default value.
   *
   * @param key - The translation key to look up.
   * @param defaultValue - Optional fallback value if the key is not found.
   * @returns The resolved translation string.
   *
   * @remarks
   * This overload is designed for future integration with external
   * translation files. Currently, it returns the `defaultValue` or
   * the `key` itself as a fallback.
   *
   * @example
   * ```typescript
   * const label = i18n.translate('save', 'Save');
   * // 'Save'
   * ```
   */
  translate(key: string, defaultValue?: string): string;

  /**
   * Resolves a translation from a type-safe translation object.
   *
   * @param translations - An object mapping language IDs to translated strings.
   * @returns The translated string for the current language.
   *
   * @remarks
   * The method looks up the current language ID in the provided object.
   * If the current language is not found, it falls back to the first
   * value in the object. This ensures a valid string is always returned.
   *
   * @example
   * ```typescript
   * const label = i18n.translate({
   *   ar: 'حفظ',
   *   en: 'Save'
   * });
   * // When current language is 'ar': 'حفظ'
   * // When current language is 'en': 'Save'
   * ```
   */
  translate(translations: Translation<L>): string;

  translate(
    keyOrTranslations: string | Translation<L>,
    defaultValue?: string,
  ): string {
    if (typeof keyOrTranslations === 'string') {
      return defaultValue ?? keyOrTranslations;
    }
    const currentId = this._currentLanguageId();
    return keyOrTranslations[currentId] ?? Object.values(keyOrTranslations)[0] ?? '';
  }

  /**
   * Toggles between the first two configured languages.
   *
   * @remarks
   * If the current language is the first language, it switches to the
   * second. Otherwise, it switches to the first. If fewer than two
   * languages are configured, this method has no effect.
   *
   * @example
   * ```typescript
   * // Current: 'ar', Languages: ['ar', 'en']
   * i18n.toggle();
   * // Current: 'en'
   *
   * i18n.toggle();
   * // Current: 'ar'
   * ```
   */
  toggle(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentId = this._currentLanguageId();
    const newId = currentId === langs[0].id ? langs[1].id : langs[0].id;
    this._currentLanguageId.set(newId);
  }

  /**
   * Cycles to the next language in the list.
   *
   * @remarks
   * When the current language is the last in the list, it wraps
   * around to the first language. If fewer than two languages are
   * configured, this method has no effect.
   *
   * @example
   * ```typescript
   * // Languages: ['ar', 'en', 'fr'], Current: 'ar'
   * i18n.next();
   * // Current: 'en'
   *
   * i18n.next();
   * // Current: 'fr'
   *
   * i18n.next();
   * // Current: 'ar' (wraps around)
   * ```
   */
  next(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentIdx = langs.findIndex((l) => l.id === this._currentLanguageId());
    const nextIdx = (currentIdx + 1) % langs.length;
    this._currentLanguageId.set(langs[nextIdx].id);
  }

  /**
   * Cycles to the previous language in the list.
   *
   * @remarks
   * When the current language is the first in the list, it wraps
   * around to the last language. If fewer than two languages are
   * configured, this method has no effect.
   *
   * @example
   * ```typescript
   * // Languages: ['ar', 'en', 'fr'], Current: 'ar'
   * i18n.previous();
   * // Current: 'fr' (wraps around)
   * ```
   */
  previous(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentIdx = langs.findIndex((l) => l.id === this._currentLanguageId());
    const prevIdx = (currentIdx - 1 + langs.length) % langs.length;
    this._currentLanguageId.set(langs[prevIdx].id);
  }

  /**
   * Sets the active language by its identifier.
   *
   * @param id - The language identifier to activate.
   *
   * @remarks
   * If the provided ID does not match any configured language,
   * the method has no effect. The change is automatically
   * persisted according to the configured storage strategy.
   *
   * @example
   * ```typescript
   * i18n.setLanguage('en');
   * console.log(i18n.currentLanguage()); // 'en'
   * ```
   */
  setLanguage(id: string): void {
    const lang = this._languages().find((l) => l.id === id);
    if (lang) {
      this._currentLanguageId.set(id as L);
    }
  }

  private _resolveInitialLanguage(): L {
    const stored = safeGetItem(this._storageKey, this._storageStrategy);
    if (stored && this._config.languages.some((l) => l.id === stored)) {
      return stored as L;
    }
    return this._config.defaultLanguage;
  }
}
