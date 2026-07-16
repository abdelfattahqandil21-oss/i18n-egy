import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { provideI18n } from '../providers/provide-i18n';
import { Language } from '../types/language';

const LANGUAGES: readonly Language<'ar' | 'en' | 'fr'>[] = [
  { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
  { id: 'en', nativeName: 'English', displayName: 'English', dir: 'ltr' },
  { id: 'fr', nativeName: 'Francais', displayName: 'French', dir: 'ltr' },
];

function setup(storageStrategy: 'local' | 'session' | 'none' = 'none') {
  TestBed.configureTestingModule({
    providers: [
      provideI18n({
        defaultLanguage: 'ar',
        languages: LANGUAGES,
        storageStrategy,
      }),
    ],
  });
  return TestBed.inject(I18nService);
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
      expect(lang.displayName).toBe('Arabic');
      expect(lang.dir).toBe('rtl');
    });
  });

  describe('validation', () => {
    it('should throw when languages array is empty', () => {
      expect(() => {
        TestBed.configureTestingModule({
          providers: [
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
  });

  describe('single language', () => {
    it('should not toggle with single language', () => {
      TestBed.configureTestingModule({
        providers: [
          provideI18n({
            defaultLanguage: 'ar',
            languages: [{ id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' }],
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
          provideI18n({
            defaultLanguage: 'ar',
            languages: [{ id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' }],
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
