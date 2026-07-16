# i18n-egy

[![npm version](https://img.shields.io/npm/v/i18n-egy.svg)](https://www.npmjs.com/package/i18n-egy)
[![license](https://img.shields.io/npm/l/i18n-egy.svg)](https://github.com/abdelfattahqandil21-oss/i18n-egy/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/abdelfattahqandil21-oss/i18n-egy/ci.yml)](https://github.com/abdelfattahqandil21-oss/i18n-egy/actions)
[![bundle size](https://img.shields.io/bundlephobia/minzip/i18n-egy)](https://bundlephobia.com/package/i18n-egy)

Modern Angular internationalization library powered by Signals. Lightweight, fully tree-shakable, SSR safe.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

**i18n-egy** is a lightweight, production-ready Angular library for managing multilingual applications. Built from the ground up with Angular 20+ Signals, it provides reactive language management, automatic RTL/LTR support, and a type-safe translation API.

Unlike heavier i18n solutions, i18n-egy focuses on the foundation: language state, direction, and inline translations. No HTTP loading, no pipes, no directives -- just a clean, composable API that works with Angular's modern primitives.

---

## Features

| Feature | Description |
|---|---|
| **Signals-based** | Built on Angular Signals. Reactive, composable, performant. |
| **Type-safe** | Language IDs are inferred from configuration. Compile-time validation. |
| **Tree-shakable** | Only the code you use is included in your bundle. |
| **SSR safe** | Works in server-side rendering without errors. |
| **Lightweight** | Only `@angular/core` as a peer dependency. Minimal footprint. |
| **RTL/LTR** | Automatic text direction management. |
| **Unlimited languages** | Support for any number of languages. |
| **Configurable storage** | `localStorage`, `sessionStorage`, or no persistence. |
| **Standalone** | Works with standalone components and modern Angular APIs. |

---

## Requirements

| Requirement | Version |
|---|---|
| Angular | `>= 20.0.0` |
| TypeScript | `>= 5.9.0` |
| Node.js | `>= 18.0.0` |

---

## Installation

```bash
npm install i18n-egy
```

or with pnpm:

```bash
pnpm add i18n-egy
```

---

## Quick Start

### 1. Configure the library

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideI18n } from 'i18n-egy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideI18n({
      defaultLanguage: 'ar',
      languages: [
        { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
        { id: 'en', nativeName: 'English', displayName: 'English', dir: 'ltr' },
      ],
    }),
  ],
};
```

### 2. Inject and use the service

```typescript
import { Component } from '@angular/core';
import { injectLanguage } from 'i18n-egy';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <p>Current language: {{ i18n.currentLanguage() }}</p>
    <p>Direction: {{ i18n.dir() }}</p>
    <p>Is RTL: {{ i18n.isRtl() }}</p>
    <button (click)="i18n.toggle()">Switch Language</button>
  `,
})
export class AppComponent {
  i18n = injectLanguage();
}
```

---

## Configuration

### `I18nConfig`

| Property | Type | Required | Default | Description |
|---|---|---|---|---|
| `languages` | `readonly Language[]` | Yes | -- | Array of supported languages |
| `defaultLanguage` | `string` | Yes | -- | Default language ID (must match a language in the array) |
| `storageKey` | `string` | No | `'i18n-egy.language'` | Key used for persistence |
| `storageStrategy` | `'local' \| 'session' \| 'none'` | No | `'local'` | Where to persist the language |

### `Language`

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique language identifier (e.g., `'ar'`, `'en'`) |
| `nativeName` | `string` | Language name in its native script |
| `displayName` | `string` | Language name in the app's primary language |
| `dir` | `'ltr' \| 'rtl'` | Text rendering direction |

### Storage Strategies

| Strategy | Storage | Behavior |
|---|---|---|
| `'local'` | `localStorage` | Persists across browser sessions and tabs. **(default)** |
| `'session'` | `sessionStorage` | Persists within the current tab only. Resets when tab closes. |
| `'none'` | Nothing | No persistence. Resets to `defaultLanguage` on every page reload. |

In SSR environments, all strategies gracefully degrade to no-op.

### Full configuration example

```typescript
provideI18n({
  defaultLanguage: 'ar',
  storageKey: 'my-app-language',
  storageStrategy: 'session',
  languages: [
    {
      id: 'ar',
      nativeName: 'العربية',
      displayName: 'Arabic',
      dir: 'rtl',
    },
    {
      id: 'en',
      nativeName: 'English',
      displayName: 'English',
      dir: 'ltr',
    },
    {
      id: 'fr',
      nativeName: 'Francais',
      displayName: 'French',
      dir: 'ltr',
    },
  ],
});
```

---

## API Reference

### `provideI18n(config)`

Configures the i18n system. Call this during application bootstrap.

```typescript
function provideI18n<L extends string>(config: I18nConfig<L>): EnvironmentProviders;
```

### `injectLanguage()`

Convenience function to inject the `I18nService`. Use this instead of `inject(I18nService)` for cleaner imports.

```typescript
function injectLanguage(): I18nService;
```

```typescript
import { injectLanguage } from 'i18n-egy';

@Component({ ... })
export class MyComponent {
  i18n = injectLanguage();
}
```

### `I18nService`

The core service providing all i18n state and operations. Inject via `injectLanguage()` or `inject(I18nService)`.

#### Signals (readonly)

| Signal | Type | Description |
|---|---|---|
| `currentLanguage()` | `string` | Current language ID |
| `currentLanguageObject()` | `Language` | Full language object for the current language |
| `languages()` | `readonly Language[]` | All configured languages |
| `dir()` | `'ltr' \| 'rtl'` | Current text direction |
| `isRtl()` | `boolean` | Whether current language is RTL |
| `languageChanged()` | `string` | Current language ID (emits on every change) |

#### Methods

| Method | Signature | Description |
|---|---|---|
| `translate(key, defaultValue?)` | `(key: string, defaultValue?: string) => string` | Translate a key with fallback |
| `translate(translations)` | `(translations: Translation<L>) => string` | Translate from type-safe inline object |
| `setLanguage(id)` | `(id: string) => void` | Switch to a specific language |
| `toggle()` | `() => void` | Toggle between first two languages |
| `next()` | `() => void` | Cycle to the next language |
| `previous()` | `() => void` | Cycle to the previous language |
| `getLanguage(id)` | `(id: L) => Language<L> \| undefined` | Look up a language by ID |

### `Translation<T>`

A type-safe record mapping language identifiers to translated strings.

```typescript
type Translation<T extends string> = Record<T, string>;
```

| Example | Description |
|---|---|
| `Translation<'ar' \| 'en'>` | `{ ar: string; en: string }` |
| `Translation<'ar' \| 'en' \| 'fr'>` | `{ ar: string; en: string; fr: string }` |

---

## Examples

### Multiple languages

```typescript
provideI18n({
  defaultLanguage: 'en',
  languages: [
    { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
    { id: 'en', nativeName: 'English', displayName: 'English', dir: 'ltr' },
    { id: 'fr', nativeName: 'Francais', displayName: 'French', dir: 'ltr' },
    { id: 'de', nativeName: 'Deutsch', displayName: 'German', dir: 'ltr' },
  ],
});
```

### RTL support

```typescript
@Component({
  template: `
    <div [attr.dir]="i18n.dir()">
      <h1>{{ i18n.translate({ ar: 'مرحبا', en: 'Hello' }) }}</h1>
    </div>
  `,
})
export class MyComponent {
  i18n = injectLanguage();
}
```

### Using signals in templates

```typescript
@Component({
  template: `
    <header [class.rtl]="i18n.isRtl()">
      <span>{{ i18n.currentLanguageObject().nativeName }}</span>
      <button (click)="i18n.toggle()">Switch</button>
    </header>

    <nav [attr.dir]="i18n.dir()">
      @for (lang of i18n.languages(); track lang.id) {
        <button (click)="i18n.setLanguage(lang.id)">
          {{ lang.displayName }}
        </button>
      }
    </nav>
  `,
})
export class HeaderComponent {
  i18n = injectLanguage();
}
```

### Language dropdown selector

```typescript
@Component({
  template: `
    <select [value]="i18n.currentLanguage()" (change)="onSelectChange($event)">
      @for (lang of i18n.languages(); track lang.id) {
        <option [value]="lang.id">{{ lang.nativeName }}</option>
      }
    </select>
  `,
})
export class LangDropdownComponent {
  i18n = injectLanguage();

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.i18n.setLanguage(value);
  }
}
```

### Inline translations

```typescript
const saveLabel = i18n.translate({
  ar: 'حفظ',
  en: 'Save',
  fr: 'Enregistrer',
});

const cancelLabel = i18n.translate('cancel', 'Cancel');
```

### Language cycling

```typescript
@Component({
  template: `
    <button (click)="i18n.previous()">Previous Language</button>
    <span>{{ i18n.currentLanguageObject().displayName }}</span>
    <button (click)="i18n.next()">Next Language</button>
  `,
})
export class LangSwitcherComponent {
  i18n = injectLanguage();
}
```

---

## FAQ

### Does this load translation files?

No. i18n-egy focuses on language management, direction, and inline translations. External translation file loading (JSON, etc.) is planned for a future release.

### Does it work with SSR?

Yes. All storage operations are SSR-safe and will silently no-op in non-browser environments.

### Can I use it with NgModules?

Yes. `provideI18n()` returns `EnvironmentProviders` which works with both standalone and module-based applications.

### How is language persistence handled?

The selected language is persisted based on the configured `storageStrategy`:
- `'local'` (default): Uses `localStorage`. Persists across sessions.
- `'session'`: Uses `sessionStorage`. Persists within the tab.
- `'none'`: No persistence. Resets on reload.

### Can I add more languages later?

Yes. The configuration accepts any number of languages. Adding a new language only requires updating the `languages` array in the configuration.

---

## Roadmap

- [ ] Translation JSON file loading
- [ ] HTTP-based translation fetching
- [ ] Pluralization support
- [ ] Interpolation with parameters
- [ ] Browser language detection
- [ ] Cookie-based storage strategy
- [ ] Locale formatting (dates, numbers, currencies)
- [ ] Angular Forms integration
- [ ] Translation validation utilities

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository from [GitHub](https://github.com/abdelfattahqandil21-oss/i18n-egy)
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- All tests pass
- New features include documentation
- Commit messages are clear and descriptive

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
