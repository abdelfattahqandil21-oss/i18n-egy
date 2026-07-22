import { jsonLoader } from './json-loader';

describe('jsonLoader', () => {
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should return a LoaderDescriptor', () => {
    const descriptor = jsonLoader();
    expect(descriptor.resolve).toBeDefined();
    expect(typeof descriptor.resolve).toBe('function');
  });

  it('should resolve to a working loader via dynamic import', async () => {
    const mockData = { welcome: 'مرحباً', save: 'حفظ' };
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 })),
    );

    const descriptor = jsonLoader({ path: '/assets/i18n' });
    const loader = await descriptor.resolve();
    const result = await loader.load('ar');

    expect(window.fetch).toHaveBeenCalledWith('/assets/i18n/ar.json');
    expect(result).toEqual(mockData);
  });

  it('should use default base path when not configured', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify({}), { status: 200 })),
    );

    const descriptor = jsonLoader();
    const loader = await descriptor.resolve();
    await loader.load('en');

    expect(window.fetch).toHaveBeenCalledWith('assets/i18n/en.json');
  });

  it('should throw on failed fetch', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })),
    );

    const descriptor = jsonLoader({ path: '/assets/i18n' });
    const loader = await descriptor.resolve();

    await expectAsync(loader.load('de')).toBeRejectedWithError(
      '[i18n-egy] Failed to load translations from "/assets/i18n/de.json": Not Found',
    );
  });
});
