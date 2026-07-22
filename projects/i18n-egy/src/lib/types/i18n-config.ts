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

export interface I18nConfig<T extends string = string> {
  languages: readonly Language<T>[];

  defaultLanguage: T;

  storageKey?: string;

  storageStrategy?: StorageStrategy;

  autoApplyDirection?: boolean;

  viewTransition?: ViewTransitionConfig;

  loader?: LoaderDescriptor<T>;
}
