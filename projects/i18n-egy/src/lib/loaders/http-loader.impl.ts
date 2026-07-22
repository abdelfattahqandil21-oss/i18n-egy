import { TranslationLoader } from '../types/loader';
import { HttpLoaderOptions } from './http-loader';

export class HttpLoader<L extends string = string> implements TranslationLoader<L> {
  constructor(private readonly _options: HttpLoaderOptions) {}

  async load(language: L): Promise<Record<string, unknown>> {
    const url = this._options.buildUrl
      ? this._options.buildUrl(language)
      : `${this._options.endpoint}/${language}`;

    const response = await fetch(url, { method: this._options.method ?? 'GET' });
    if (!response.ok) {
      throw new Error(
        `[i18n-egy] HTTP loader failed for "${url}": ${response.statusText}`,
      );
    }
    return response.json();
  }
}
