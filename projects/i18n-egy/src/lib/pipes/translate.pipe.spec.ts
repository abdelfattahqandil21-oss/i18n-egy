import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { provideI18n } from '../providers/provide-i18n';
import { I18nService } from '../services/i18n.service';
import { Language } from '../types/language';
import { LoaderDescriptor } from '../types/loader';

const LANGUAGES: readonly Language<'ar' | 'en'>[] = [
  { id: 'ar', nativeName: 'العربية', dir: 'rtl' },
  { id: 'en', nativeName: 'English', dir: 'ltr' },
];

function mockLoaderDescriptor(): LoaderDescriptor<string> {
  return {
    resolve: jasmine.createSpy('resolve').and.resolveTo({
      load: jasmine.createSpy('load').and.resolveTo({ greeting: 'مرحباً' }),
    }),
  };
}

function setup() {
  TestBed.configureTestingModule({
    providers: [
      I18nService,
      provideI18n({
        defaultLanguage: 'ar',
        languages: LANGUAGES,
        storageStrategy: 'none',
      }),
    ],
  });
  const pipe = TestBed.runInInjectionContext(() => new TranslatePipe<'ar' | 'en'>());
  const service = TestBed.inject(I18nService<'ar' | 'en'>);
  return { pipe, service };
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
  const pipe = TestBed.runInInjectionContext(() => new TranslatePipe<'ar' | 'en'>());
  const service = TestBed.inject(I18nService<'ar' | 'en'>);
  return { pipe, service };
}

describe('TranslatePipe', () => {
  describe('key-based (with loader)', () => {
    it('should return loaded translation when key exists', async () => {
      const { pipe, service } = setupWithLoader();
      await service.loadTranslations('ar');
      const result = pipe.transform('greeting');
      expect(result).toBe('مرحباً');
    });

    it('should return fallback when key is missing', async () => {
      const { pipe, service } = setupWithLoader();
      await service.loadTranslations('ar');
      const result = pipe.transform('missing.key', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('inline typed', () => {
    it('should return value for current language', () => {
      const { pipe } = setup();
      const result = pipe.transform({ ar: 'مرحبا', en: 'Hello' });
      expect(result).toBe('مرحبا');
    });

    it('should update when language changes (impure pipe)', () => {
      const { pipe, service } = setup();
      const translations = { ar: 'مرحبا', en: 'Hello' };

      const resultAr = pipe.transform(translations);
      expect(resultAr).toBe('مرحبا');

      service.setLanguage('en');
      const resultEn = pipe.transform(translations);
      expect(resultEn).toBe('Hello');
    });
  });

  describe('key-based (no loader)', () => {
    it('should return the key itself when no loader and no default', () => {
      const { pipe } = setup();
      const result = pipe.transform('any.key');
      expect(result).toBe('any.key');
    });

    it('should return defaultValue when no loader and default provided', () => {
      const { pipe } = setup();
      const result = pipe.transform('any.key', 'Fallback');
      expect(result).toBe('Fallback');
    });
  });
});
