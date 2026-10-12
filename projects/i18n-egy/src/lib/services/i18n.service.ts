import { Service, computed, effect, inject, signal } from '@angular/core';
import {
  DEFAULT_AUTO_APPLY_DIRECTION,
  DEFAULT_STORAGE_KEY,
  DEFAULT_STORAGE_STRATEGY,
} from '../constants/defaults';
import { I18N_CONFIG } from '../tokens/i18n-config.token';
import { Direction } from '../types/direction';
import { I18nConfig, TranslateParams } from '../types/i18n-config';
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
  private readonly _inflight = new Map<L, Promise<Record<string, unknown>>>();
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

  private readonly _loadingState = signal<'idle' | 'loading' | 'error'>('idle');
  private readonly _loadingError = signal<unknown>(null);

  /** Current loader state — useful for skeletons/spinners (BRT lesson). */
  readonly loadingState = this._loadingState.asReadonly();
  readonly loadingError = this._loadingError.asReadonly();
  readonly isLoading = computed(() => this._loadingState() === 'loading');

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

  private applyLanguage(id: L, opts?: { skipLoad?: boolean }): void {
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

    if (!opts?.skipLoad) {
      // Background load — errors are recorded on signals, never thrown here.
      void this._loadTranslations(id);
    }
  }

  getLanguage(id: L): Language<L> | undefined {
    return this._languages().find((l) => l.id === id);
  }

  translate(key: string, defaultValue?: string, params?: TranslateParams): string;
  translate(key: string, params?: TranslateParams): string;

  translate(translations: Translation<L>): string;

  translate(
    keyOrTranslations: string | Translation<L>,
    defaultValueOrParams?: string | TranslateParams,
    maybeParams?: TranslateParams,
  ): string {
    if (typeof keyOrTranslations === 'string') {
      const { defaultValue, params } = normalizeKeyArgs(defaultValueOrParams, maybeParams);
      const loaded = this._loadedTranslations();
      const resolved = this._resolveKey(loaded, keyOrTranslations);
      if (resolved !== undefined) {
        return interpolate(resolved, params);
      }
      if (!this._config.loader && !this._warnedNoLoader) {
        this._warnedNoLoader = true;
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.warn(
            '[i18n-egy] Key-based translate() requires a loader configured via I18nConfig.loader.',
          );
        }
      }
      const fallback = defaultValue ?? keyOrTranslations;
      return params ? interpolate(fallback, params) : fallback;
    }
    const currentId = this._currentLanguageId();
    return keyOrTranslations[currentId] ?? Object.values(keyOrTranslations)[0] ?? '';
  }

  loadedTranslations = this._loadedTranslations.asReadonly();

  async loadTranslations(
    languageId: L,
    opts?: { silent?: boolean },
  ): Promise<Record<string, unknown>> {
    return this._loadTranslations(languageId, opts);
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
    if (this._config.switchStrategy === 'preload-first') {
      // Fire-and-forget preload-first: never flash raw keys.
      void this.setLanguageAsync(id);
      return;
    }
    this.applyLanguage(id);
  }

  /**
   * Preload-first switch (BRT lesson): await the dictionary, then flip
   * the signal so templates never render raw keys. Ideal inside View
   * Transitions / route language-prefix switches.
   */
  async setLanguageAsync(id: L): Promise<void> {
    if (id === this._currentLanguageId()) return;
    if (!this._languages().some((l) => l.id === id)) return;
    // Silent preload: cache only, don't touch the visible signal while
    // the UI is still on the old language. applyLanguage() then flips
    // the signal and syncs the dict from cache in the same tick.
    await this._loadTranslations(id, { silent: true });
    this.applyLanguage(id);
  }

  private async _loadTranslations(
    languageId: L,
    opts?: { silent?: boolean },
  ): Promise<Record<string, unknown>> {
    if (!this._getLoader) return {};

    const cached = this._translationsCache.get(languageId);
    if (cached) {
      if (!opts?.silent) {
        this._loadedTranslations.set(cached);
      }
      return cached;
    }

    // Dedupe concurrent loads for the same language (BRT loadingLanguages map).
    const inflight = this._inflight.get(languageId);
    if (inflight) return inflight;

    const myToken = ++this._requestToken;
    this._loadingState.set('loading');

    const task = (async () => {
      try {
        if (!this._resolvedLoader) {
          this._resolvedLoader = await this._getLoader!();
        }
        const translations = await this._resolvedLoader.load(languageId);

        this._translationsCache.set(languageId, translations);

        // Last-request-wins: stale out-of-order responses stay cached
        // but never overwrite the visible signal.
        if (myToken === this._requestToken && !opts?.silent) {
          this._loadedTranslations.set(translations);
          this._loadingError.set(null);
          this._loadingState.set('idle');
        }

        return translations;
      } catch (error) {
        if (myToken === this._requestToken) {
          this._loadingError.set(error);
          this._loadingState.set('error');
        }
        this._config.onLoadError?.(languageId, error);
        return {};
      } finally {
        this._inflight.delete(languageId);
        if (this._inflight.size === 0 && this._loadingState() === 'loading') {
          this._loadingState.set('idle');
        }
      }
    })();

    this._inflight.set(languageId, task);
    return task;
  }

  private _resolveKey(obj: Record<string, unknown>, path: string): string | undefined {
    const value = path.split('.').reduce<unknown>(
      (acc, segment) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[segment]
          : undefined,
      obj,
    );
    // BRT lesson: dictionaries may hold numbers/booleans — stringify them.
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return undefined;
  }

  private _resolveInitialLanguage(): L {
    const stored = safeGetItem(this._storageKey, this._storageStrategy);
    if (stored && this._config.languages.some((l) => l.id === stored)) {
      return stored as L;
    }
    return this._config.defaultLanguage;
  }
}

function normalizeKeyArgs(
  second?: string | TranslateParams,
  third?: TranslateParams,
): { defaultValue?: string; params?: TranslateParams } {
  if (second && typeof second === 'object') {
    return { params: second };
  }
  return { defaultValue: second, params: third };
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? match : String(value);
  });
}
