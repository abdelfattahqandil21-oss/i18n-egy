import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { provideI18n } from '../providers/provide-i18n';
import { Language } from '../types/language';
import { LoaderDescriptor } from '../types/loader';

const LANGUAGES: readonly Language<'ar' | 'en' | 'fr'>[] = [
  { id: 'ar', nativeName: 'العربية', dir: 'rtl' },
  { id: 'en', nativeName: 'English', dir: 'ltr' },
  { id: 'fr', nativeName: 'Francais', dir: 'ltr' },
];

const MOCK_TRANSLATIONS: Record<string, unknown> = {
  welcome: 'مرحباً',
  save: 'حفظ',
};

const NESTED_TRANSLATIONS: Record<string, unknown> = {
  home: {
    title: 'الرئيسية',
    subtitle: 'مرحباً بك',
  },
  about: {
    team: {
      member: 'فريقنا',
    },
  },
  onlyString: 'نص مباشر',
};

function mockLoaderDescriptor(): LoaderDescriptor<string> {
  return {
    resolve: jasmine.createSpy('resolve').and.resolveTo({
      load: jasmine.createSpy('load').and.resolveTo({ ...MOCK_TRANSLATIONS }),
    }),
  };
}

function setup(storageStrategy: 'local' | 'session' | 'none' = 'none') {
  TestBed.configureTestingModule({
    providers: [
      I18nService,
      provideI18n({
        defaultLanguage: 'ar',
        languages: LANGUAGES,
        storageStrategy,
      }),
    ],
  });
  return TestBed.inject(I18nService);
}

function setupWithLoader() {
  TestBed.configureTestingModule({
    providers: [
      I18nService,
      provideI18n({
        defaultLanguage: 'ar',
        languages: LANGUAGES,
        storageStrategy: 'none',
        loader: mockLoaderDescriptor(),
      }),
    ],
  });
  return TestBed.inject(I18nService);
}

function setupWithLoaderAndSpy() {
  const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...MOCK_TRANSLATIONS });
  TestBed.configureTestingModule({
    providers: [
      I18nService,
      provideI18n({
        defaultLanguage: 'ar',
        languages: LANGUAGES,
        storageStrategy: 'none',
        loader: {
          resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
        },
      }),
    ],
  });
  return { service: TestBed.inject(I18nService), spy: loadSpy };
}

describe('I18nService', () => {
  beforeEach(() => localStorage.clear());

  describe('initialization', () => {
    it('should initialize with the default language', () => {
      const service = setup();
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should initialize the languages signal', () => {
      const service = setup();
      expect(service.languages().length).toBe(3);
      expect(service.languages()[0].id).toBe('ar');
    });

    it('should set dir to rtl for Arabic', () => {
      const service = setup();
      expect(service.dir()).toBe('rtl');
    });

    it('should set isRtl to true for Arabic', () => {
      const service = setup();
      expect(service.isRtl()).toBe(true);
    });

    it('should return the full language object', () => {
      const service = setup();
      const lang = service.currentLanguageObject();
      expect(lang.id).toBe('ar');
      expect(lang.nativeName).toBe('العربية');
      expect(lang.dir).toBe('rtl');
    });
  });

  describe('validation', () => {
    it('should throw when languages array is empty', () => {
      expect(() => {
        TestBed.configureTestingModule({
          providers: [
            I18nService,
            provideI18n({
              defaultLanguage: 'ar',
              languages: [],
              storageStrategy: 'none',
            }),
          ],
        });
        TestBed.inject(I18nService);
      }).toThrowError('[i18n-egy] At least one language must be provided in the languages array.');
    });

    it('should throw when defaultLanguage is not in languages array', () => {
      expect(() => {
        TestBed.configureTestingModule({
          providers: [
            I18nService,
            provideI18n({
              defaultLanguage: 'de',
              languages: LANGUAGES,
              storageStrategy: 'none',
            }),
          ],
        });
        TestBed.inject(I18nService);
      }).toThrowError(
        '[i18n-egy] defaultLanguage "de" must be one of the configured language IDs.',
      );
    });
  });

  describe('setLanguage', () => {
    it('should switch to the specified language', () => {
      const service = setup();
      service.setLanguage('en');
      expect(service.currentLanguage()).toBe('en');
      expect(service.dir()).toBe('ltr');
      expect(service.isRtl()).toBe(false);
    });

    it('should not change if language ID is invalid', () => {
      const service = setup();
      service.setLanguage('de');
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should update currentLanguageObject', () => {
      const service = setup();
      service.setLanguage('fr');
      expect(service.currentLanguageObject().nativeName).toBe('Francais');
    });

    it('should ignore duplicate language changes', () => {
      const service = setup();
      service.setLanguage('ar');
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should ignore duplicate after actual change', () => {
      const service = setup();
      service.setLanguage('en');
      service.setLanguage('en');
      expect(service.currentLanguage()).toBe('en');
    });
  });

  describe('toggle', () => {
    it('should toggle between first two languages', () => {
      const service = setup();
      service.toggle();
      expect(service.currentLanguage()).toBe('en');
      service.toggle();
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should toggle to first language when current is not first', () => {
      const service = setup();
      service.setLanguage('fr');
      service.toggle();
      expect(service.currentLanguage()).toBe('ar');
    });
  });

  describe('next', () => {
    it('should cycle to the next language', () => {
      const service = setup();
      service.next();
      expect(service.currentLanguage()).toBe('en');
    });

    it('should wrap around to the first language', () => {
      const service = setup();
      service.setLanguage('fr');
      service.next();
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should cycle through all languages', () => {
      const service = setup();
      service.next();
      expect(service.currentLanguage()).toBe('en');
      service.next();
      expect(service.currentLanguage()).toBe('fr');
      service.next();
      expect(service.currentLanguage()).toBe('ar');
    });
  });

  describe('previous', () => {
    it('should cycle to the previous language', () => {
      const service = setup();
      service.previous();
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should wrap around to the last language', () => {
      const service = setup();
      service.previous();
      expect(service.currentLanguage()).toBe('fr');
    });

    it('should cycle backwards through all languages', () => {
      const service = setup();
      service.previous();
      expect(service.currentLanguage()).toBe('fr');
      service.previous();
      expect(service.currentLanguage()).toBe('en');
      service.previous();
      expect(service.currentLanguage()).toBe('ar');
    });
  });

  describe('getLanguage', () => {
    it('should return the language object for a valid id', () => {
      const service = setup();
      const lang = service.getLanguage('en');
      expect(lang).toBeDefined();
      expect(lang!.id).toBe('en');
      expect(lang!.nativeName).toBe('English');
    });

    it('should return undefined for an invalid id', () => {
      const service = setup();
      const lang = service.getLanguage('de' as any);
      expect(lang).toBeUndefined();
    });
  });

  describe('languageChanged', () => {
    it('should emit current language on creation', () => {
      const service = setup();
      expect(service.languageChanged()).toBe('ar');
    });

    it('should emit new language after setLanguage', () => {
      const service = setup();
      service.setLanguage('en');
      expect(service.languageChanged()).toBe('en');
    });
  });

  describe('translate', () => {
    it('should translate from inline object', () => {
      const service = setup();
      const result = service.translate({ ar: 'حفظ', en: 'Save', fr: 'Enregistrer' });
      expect(result).toBe('حفظ');
    });

    it('should translate from inline object after language switch', () => {
      const service = setup();
      service.setLanguage('en');
      const result = service.translate({ ar: 'حفظ', en: 'Save', fr: 'Enregistrer' });
      expect(result).toBe('Save');
    });

    it('should fallback to first value if current language not in object', () => {
      const service = setup();
      const result = service.translate({ en: 'Save', fr: 'Enregistrer' });
      expect(result).toBe('Save');
    });

    it('should return key when translate with key and no default', () => {
      const service = setup();
      const result = service.translate('save');
      expect(result).toBe('save');
    });

    it('should return defaultValue when translate with key and default', () => {
      const service = setup();
      const result = service.translate('save', 'Save');
      expect(result).toBe('Save');
    });

    it('should return empty string for empty translations object', () => {
      const service = setup();
      const result = service.translate({});
      expect(result).toBe('');
    });

    it('should return key when no loader is configured', () => {
      const service = setup();
      expect(service.translate('welcome')).toBe('welcome');
    });

    it('should return defaultValue when no loader is configured', () => {
      const service = setup();
      expect(service.translate('welcome', 'Welcome')).toBe('Welcome');
    });

    it('should return loaded value when loader is configured and data loaded', async () => {
      const service = setupWithLoader();
      await service.loadTranslations('ar');
      const result = service.translate('welcome');
      expect(result).toBe('مرحباً');
    });

    it('should return defaultValue for missing key even with loader', async () => {
      const service = setupWithLoader();
      await service.loadTranslations('ar');
      const result = service.translate('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return key for missing key and no default even with loader', async () => {
      const service = setupWithLoader();
      await service.loadTranslations('ar');
      const result = service.translate('nonexistent');
      expect(result).toBe('nonexistent');
    });

    it('should resolve nested dot-path from loaded translations', async () => {
      const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...NESTED_TRANSLATIONS });
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      await service.loadTranslations('ar');
      expect(service.translate('home.title')).toBe('الرئيسية');
      expect(service.translate('home.subtitle')).toBe('مرحباً بك');
    });

    it('should resolve deep nested dot-path', async () => {
      const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...NESTED_TRANSLATIONS });
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      await service.loadTranslations('ar');
      expect(service.translate('about.team.member')).toBe('فريقنا');
    });

    it('should return key for partial path that resolves to non-string', async () => {
      const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...NESTED_TRANSLATIONS });
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      await service.loadTranslations('ar');
      expect(service.translate('home')).toBe('home');
    });

    it('should return defaultValue for partial path that resolves to non-string', async () => {
      const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...NESTED_TRANSLATIONS });
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      await service.loadTranslations('ar');
      expect(service.translate('home', 'Homepage')).toBe('Homepage');
    });

    it('should resolve flat keys from nested object too', async () => {
      const loadSpy = jasmine.createSpy('load').and.resolveTo({ ...NESTED_TRANSLATIONS });
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      await service.loadTranslations('ar');
      expect(service.translate('onlyString')).toBe('نص مباشر');
    });
  });

  describe('loadedTranslations', () => {
    it('should be empty by default', () => {
      const service = setup();
      expect(service.loadedTranslations()).toEqual({});
    });

    it('should contain loaded data after loadTranslations with loader', async () => {
      const service = setupWithLoader();
      await service.loadTranslations('ar');
      expect(service.loadedTranslations()).toEqual(MOCK_TRANSLATIONS);
    });
  });

  describe('loadTranslations', () => {
    it('should return empty when no loader configured', async () => {
      const service = setup();
      const result = await service.loadTranslations('ar');
      expect(result).toEqual({});
    });

    it('should cache translations and not call loader again for same language', async () => {
      const { service, spy } = setupWithLoaderAndSpy();
      await service.loadTranslations('ar');
      await service.loadTranslations('ar');
      await service.loadTranslations('ar');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('race condition guard', () => {
    function setupControlled() {
      const resolvers = new Map<string, (value: Record<string, unknown>) => void>();
      const loadSpy = jasmine.createSpy('load').and.callFake((lang: string) =>
        new Promise<Record<string, unknown>>((resolve) => resolvers.set(lang, resolve)),
      );
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'none',
            loader: {
              resolve: jasmine.createSpy('resolve').and.resolveTo({ load: loadSpy }),
            },
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      return { service, loadSpy, resolve: (lang: string, data: Record<string, unknown>) => resolvers.get(lang)?.(data) };
    }

    it('should discard stale out-of-order responses and keep last-requested data', async () => {
      const { service, resolve } = setupControlled();

      // Request 'en' (token 1) then 'ar' (token 2) before 'en' resolves.
      // Both calls need a microtick to get past the await this._getLoader()
      // guard before load() is invoked.
      const enPromise = service.loadTranslations('en');
      const arPromise = service.loadTranslations('ar');
      await Promise.resolve();

      // Resolve 'ar' (last requested) first
      resolve('ar', { greeting: 'مرحبا' });
      await arPromise;

      // Resolve 'en' later — its response is stale and must not overwrite
      resolve('en', { greeting: 'Hello' });
      await enPromise;

      // Signal must show data from the LAST requested language, not the
      // slower one that resolved out of order
      expect(service.loadedTranslations()).toEqual({ greeting: 'مرحبا' });
    });

    it('should still cache stale responses for future use', async () => {
      const { service, loadSpy, resolve } = setupControlled();

      // Trigger two concurrent loads — 'en' will lose the race
      const enPromise = service.loadTranslations('en');
      const arPromise = service.loadTranslations('ar');
      await Promise.resolve();

      resolve('ar', { greeting: 'مرحبا' });
      resolve('en', { greeting: 'Hello' });
      await Promise.all([arPromise, enPromise]);

      // Signal shows 'ar' (the winner)
      expect(service.loadedTranslations()).toEqual({ greeting: 'مرحبا' });

      // Request 'en' again — should come from cache, not re-fetch
      const cached = await service.loadTranslations('en');
      expect(cached).toEqual({ greeting: 'Hello' });
      // load() called once for 'en' (first call) + once for 'ar' = 2
      expect(loadSpy).toHaveBeenCalledTimes(2);
    });

    it('should update signal normally when there is no race', async () => {
      const service = setupWithLoader();
      await service.loadTranslations('ar');
      expect(service.loadedTranslations()).toEqual(MOCK_TRANSLATIONS);
    });
  });

  describe('single language', () => {
    it('should not toggle with single language', () => {
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: [{ id: 'ar', nativeName: 'العربية', dir: 'rtl' }],
            storageStrategy: 'none',
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      service.toggle();
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should not cycle with single language', () => {
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: [{ id: 'ar', nativeName: 'العربية', dir: 'rtl' }],
            storageStrategy: 'none',
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      service.next();
      expect(service.currentLanguage()).toBe('ar');
      service.previous();
      expect(service.currentLanguage()).toBe('ar');
    });
  });

  describe('storage persistence', () => {
    it('should persist to localStorage with local strategy', () => {
      const service = setup('local');
      service.setLanguage('en');
      TestBed.flushEffects();
      expect(localStorage.getItem('i18n-egy.language')).toBe('en');
    });

    it('should persist to sessionStorage with session strategy', () => {
      const service = setup('session');
      service.setLanguage('fr');
      TestBed.flushEffects();
      expect(sessionStorage.getItem('i18n-egy.language')).toBe('fr');
    });

    it('should not persist with none strategy', () => {
      const service = setup('none');
      service.setLanguage('en');
      expect(localStorage.getItem('i18n-egy.language')).toBeNull();
    });

    it('should restore language from localStorage', () => {
      localStorage.setItem('i18n-egy.language', 'en');
      const service = setup('local');
      expect(service.currentLanguage()).toBe('en');
    });

    it('should fallback to default if stored language is invalid', () => {
      localStorage.setItem('i18n-egy.language', 'de');
      const service = setup('local');
      expect(service.currentLanguage()).toBe('ar');
    });

    it('should use custom storageKey', () => {
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'local',
            storageKey: 'my-app-lang',
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      service.setLanguage('en');
      TestBed.flushEffects();
      expect(localStorage.getItem('my-app-lang')).toBe('en');
    });

    it('should restore language from custom storageKey', () => {
      localStorage.setItem('my-custom-key', 'fr');
      TestBed.configureTestingModule({
        providers: [
          I18nService,
          provideI18n({
            defaultLanguage: 'ar',
            languages: LANGUAGES,
            storageStrategy: 'local',
            storageKey: 'my-custom-key',
          }),
        ],
      });
      const service = TestBed.inject(I18nService);
      expect(service.currentLanguage()).toBe('fr');
    });
  });

  describe('readonly signals', () => {
    it('should not allow external writes to languages', () => {
      const service = setup();
      expect(() => {
        (service.languages as any).set([]);
      }).toThrow();
    });

    it('should not allow external writes to currentLanguage', () => {
      const service = setup();
      expect(() => {
        (service.currentLanguage as any).set('en');
      }).toThrow();
    });
  });
});
