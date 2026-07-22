import { Service, computed, effect, inject, signal } from '@angular/core';
import {
  DEFAULT_AUTO_APPLY_DIRECTION,
  DEFAULT_STORAGE_KEY,
  DEFAULT_STORAGE_STRATEGY,
} from '../constants/defaults';
import { I18N_CONFIG } from '../tokens/i18n-config.token';
import { Direction } from '../types/direction';
import { I18nConfig } from '../types/i18n-config';
import { Language } from '../types/language';
import { StorageStrategy } from '../types/storage-strategy';
import { Translation } from '../types/translation';
import { TranslationLoader } from '../types/loader';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { ViewTransitionService } from './view-transition.service';

@Service()
export class I18nService<L extends string = string> {
  private readonly _config = inject<I18nConfig<L>>(I18N_CONFIG);
  private readonly _viewTransition = inject(ViewTransitionService, { optional: true });
  private readonly _storageKey = this._config.storageKey ?? DEFAULT_STORAGE_KEY;
  private readonly _storageStrategy: StorageStrategy =
    this._config.storageStrategy ?? DEFAULT_STORAGE_STRATEGY;
  private readonly _autoApplyDirection: boolean =
    this._config.autoApplyDirection ?? DEFAULT_AUTO_APPLY_DIRECTION;

  private readonly _currentLanguageId = signal<L>(this._resolveInitialLanguage());
  private readonly _languages = signal<readonly Language<L>[]>(this._config.languages);
  private readonly _loadedTranslations = signal<Record<string, unknown>>({});
  private readonly _getLoader: (() => Promise<TranslationLoader<L>>) | null =
    this._config.loader?.resolve ?? null;
  private _resolvedLoader: TranslationLoader<L> | null = null;
  private readonly _translationsCache = new Map<L, Record<string, unknown>>();
  /**
   * Monotonically increasing counter used as a "last request wins" guard.
   * When the user switches languages rapidly, in-flight requests can resolve
   * out of order. Each call to `_loadTranslations` captures the current
   * token value at the start; before applying data to `_loadedTranslations`,
   * it checks whether a newer call has already started. If so, the stale
   * response is silently discarded — the cached data is still stored for
   * future use, but the signal is not overwritten.
   */
  private _requestToken = 0;
  private _warnedNoLoader = false;
  private _applyCount = 0;

  readonly languageChanged = computed<L>(() => this._currentLanguageId());

  readonly languages = this._languages.asReadonly();

  readonly currentLanguage = this._currentLanguageId.asReadonly();

  readonly currentLanguageObject = computed<Language<L>>(() => {
    const id = this._currentLanguageId();
    return this._languages().find((l) => l.id === id) ?? this._languages()[0];
  });

  readonly dir = computed<Direction>(() => this.currentLanguageObject().dir);

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

    if (this._autoApplyDirection) {
      effect(() => {
        if (typeof document === 'undefined') {
          return;
        }
        const lang = this.currentLanguageObject();
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.id;
      });
    }
  }

  private applyLanguage(id: L): void {
    if (id === this._currentLanguageId()) return;

    const lang = this._languages().find((l) => l.id === id);
    if (!lang) return;

    this._applyCount++;

    const apply = () => this._currentLanguageId.set(id);
    const vt = this._config.viewTransition;
    const useTransition =
      vt?.enabled &&
      (!vt.skipInitialTransition || this._applyCount > 1) &&
      this._viewTransition != null;

    if (useTransition) {
      vt!.onViewTransitionCreated?.({ language: id, direction: lang.dir });
      this._viewTransition!.run(apply);
    } else {
      apply();
    }

    this._loadTranslations(id);
  }

  getLanguage(id: L): Language<L> | undefined {
    return this._languages().find((l) => l.id === id);
  }

  translate(key: string, defaultValue?: string): string;

  translate(translations: Translation<L>): string;

  translate(
    keyOrTranslations: string | Translation<L>,
    defaultValue?: string,
  ): string {
    if (typeof keyOrTranslations === 'string') {
      const loaded = this._loadedTranslations();
      const resolved = this._resolveKey(loaded, keyOrTranslations);
      if (resolved !== undefined) {
        return resolved;
      }
      if (!this._config.loader && !this._warnedNoLoader) {
        this._warnedNoLoader = true;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.warn(
            '[i18n-egy] Key-based translate() requires a loader configured via I18nConfig.loader.',
          );
        }
      }
      return defaultValue ?? keyOrTranslations;
    }
    const currentId = this._currentLanguageId();
    return keyOrTranslations[currentId] ?? Object.values(keyOrTranslations)[0] ?? '';
  }

  loadedTranslations = this._loadedTranslations.asReadonly();

  async loadTranslations(languageId: L): Promise<Record<string, unknown>> {
    return this._loadTranslations(languageId);
  }

  toggle(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentId = this._currentLanguageId();
    const newId = currentId === langs[0].id ? langs[1].id : langs[0].id;
    this.applyLanguage(newId);
  }

  next(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentIdx = langs.findIndex((l) => l.id === this._currentLanguageId());
    const nextIdx = (currentIdx + 1) % langs.length;
    this.applyLanguage(langs[nextIdx].id);
  }

  previous(): void {
    const langs = this._languages();
    if (langs.length < 2) return;
    const currentIdx = langs.findIndex((l) => l.id === this._currentLanguageId());
    const prevIdx = (currentIdx - 1 + langs.length) % langs.length;
    this.applyLanguage(langs[prevIdx].id);
  }

  setLanguage(id: L): void {
    this.applyLanguage(id);
  }

  private async _loadTranslations(languageId: L): Promise<Record<string, unknown>> {
    if (!this._getLoader) return {};

    // Capture this request's token. If a newer call increments
    // _requestToken before this one finishes, we must not overwrite
    // _loadedTranslations with stale data (out-of-order resolution
    // from rapid language switching).
    const myToken = ++this._requestToken;

    const cached = this._translationsCache.get(languageId);
    if (cached) {
      // Cache-hit path: only update the signal if this call
      // is still the most recent one.
      if (myToken === this._requestToken) {
        this._loadedTranslations.set(cached);
      }
      return cached;
    }

    try {
      if (!this._resolvedLoader) {
        this._resolvedLoader = await this._getLoader();
      }
      const translations = await this._resolvedLoader.load(languageId);

      // Always cache the result — even if this call lost the race,
      // the data is correct and useful for future lookups.
      this._translationsCache.set(languageId, translations);

      // Network path: only update the signal if still the most recent call.
      if (myToken === this._requestToken) {
        this._loadedTranslations.set(translations);
      }

      return translations;
    } catch {
      return {};
    }
  }

  private _resolveKey(obj: Record<string, unknown>, path: string): string | undefined {
    const value = path.split('.').reduce<unknown>(
      (acc, segment) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[segment]
          : undefined,
      obj,
    );
    return typeof value === 'string' ? value : undefined;
  }

  private _resolveInitialLanguage(): L {
    const stored = safeGetItem(this._storageKey, this._storageStrategy);
    if (stored && this._config.languages.some((l) => l.id === stored)) {
      return stored as L;
    }
    return this._config.defaultLanguage;
  }
}
