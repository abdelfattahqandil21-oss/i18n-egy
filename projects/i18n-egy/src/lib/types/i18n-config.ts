import { Direction } from './direction';
import { Language } from './language';
import { LoaderDescriptor } from './loader';
import { StorageStrategy } from './storage-strategy';

export interface ViewTransitionInfo {
  language: string;
  direction: Direction;
}

export interface ViewTransitionConfig {
  enabled?: boolean;
  skipInitialTransition?: boolean;
  onViewTransitionCreated?: (info: ViewTransitionInfo) => void;
}

export type SwitchStrategy = 'instant' | 'preload-first';

export type TranslateParams = Record<string, string | number | boolean>;

export interface I18nConfig<T extends string = string> {
  languages: readonly Language<T>[];

  defaultLanguage: T;

  storageKey?: string;

  storageStrategy?: StorageStrategy;

  autoApplyDirection?: boolean;

  viewTransition?: ViewTransitionConfig;

  loader?: LoaderDescriptor<T>;

  /**
   * Language switch behavior (learned from real BRT usage).
   * - `instant` (default): set the signal immediately, load in background.
   * - `preload-first`: `setLanguage()` awaits the dictionary first so the
   *   UI never flashes untranslated keys. Use for route-level switches
   *   wrapped in View Transitions.
   */
  switchStrategy?: SwitchStrategy;

  /** Called when a dictionary load fails. The service still falls back to key/default. */
  onLoadError?: (language: T, error: unknown) => void;
}
