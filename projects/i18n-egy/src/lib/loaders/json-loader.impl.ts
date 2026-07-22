import { TranslationLoader } from '../types/loader';

const DEFAULT_BASE_PATH = 'assets/i18n';

export class JsonLoader<L extends string = string> implements TranslationLoader<L> {
  constructor(private readonly _options?: { path?: string }) {}

  async load(language: L): Promise<Record<string, unknown>> {
    const basePath = this._options?.path ?? DEFAULT_BASE_PATH;
    const url = `${basePath}/${language}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `[i18n-egy] Failed to load translations from "${url}": ${response.statusText}`,
      );
    }
    return response.json();
  }
}
