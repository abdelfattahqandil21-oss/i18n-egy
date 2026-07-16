import { TestBed } from '@angular/core/testing';
import { EnvironmentProviders } from '@angular/core';
import { provideI18n } from './provide-i18n';
import { I18N_CONFIG } from '../tokens/i18n-config.token';
import { I18nService } from '../services/i18n.service';

describe('provideI18n', () => {
  it('should return EnvironmentProviders', () => {
    const providers = provideI18n({
      defaultLanguage: 'ar',
      languages: [
        { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
      ],
    });
    expect(providers).toBeDefined();
  });

  it('should make I18nService injectable', () => {
    TestBed.configureTestingModule({
      providers: [
        provideI18n({
          defaultLanguage: 'ar',
          languages: [
            { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
          ],
          storageStrategy: 'none',
        }),
      ],
    });
    const service = TestBed.inject(I18nService);
    expect(service).toBeDefined();
    expect(service.currentLanguage()).toBe('ar');
  });

  it('should provide the config via token', () => {
    const config = {
      defaultLanguage: 'en',
      languages: [
        { id: 'en', nativeName: 'English', displayName: 'English', dir: 'ltr' as const },
      ],
      storageStrategy: 'none' as const,
    };
    TestBed.configureTestingModule({
      providers: [provideI18n(config)],
    });
    const providedConfig = TestBed.inject(I18N_CONFIG);
    expect(providedConfig.defaultLanguage).toBe('en');
    expect(providedConfig.languages.length).toBe(1);
  });
});
