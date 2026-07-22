import { TranslationLoader } from '../types/loader';
import { RemoteLoaderOptions } from './remote-loader';

export class RemoteLoader<L extends string = string> implements TranslationLoader<L> {
  constructor(private readonly _options: RemoteLoaderOptions) {}

  async load(language: L): Promise<Record<string, unknown>> {
    const url = this._options.url(language);

    const response = await fetch(url, { headers: this._options.headers });
    if (!response.ok) {
      throw new Error(
        `[i18n-egy] Remote loader failed for "${url}": ${response.statusText}`,
      );
    }
    return response.json();
  }
}
