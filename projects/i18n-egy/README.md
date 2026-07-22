# i18n-egy

Modern Angular internationalization library powered by Signals. Zero runtime dependencies, fully tree-shakable, SSR safe.

## Installation

```bash
npm install i18n-egy
```

## Quick Start

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideI18n } from 'i18n-egy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideI18n({
      defaultLanguage: 'ar',
      languages: [
        { id: 'ar', nativeName: 'العربية', dir: 'rtl' },
        { id: 'en', nativeName: 'English', dir: 'ltr' },
      ],
    }),
  ],
};
```

```typescript
// any component
import { Component } from '@angular/core';
import { injectLanguage } from 'i18n-egy';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <p>Language: {{ i18n.currentLanguage() }}</p>
    <button (click)="i18n.toggle()">Switch</button>
  `,
})
export class AppComponent {
  i18n = injectLanguage();
}
```

## Features

- Signals-based reactive state
- Type-safe language configuration
- Automatic RTL/LTR direction management
- **Pluggable loaders** — JSON files, HTTP endpoints, custom sources
- Key-based `translate('home.title')` API (optional, requires loader)
- Inline typed `translate({ ar: 'مرحبا', en: 'Hello' })` API (always available)
- localStorage persistence
- SSR safe
- Tree-shakable
- Zero runtime dependencies

## Documentation

See the [README](https://github.com/abdelfattahqandil21-oss/i18n-egy#readme) for full documentation.

## Loaders

i18n-egy ships with built-in loader factories:

- **jsonLoader** — fetch JSON translation files via `fetch()`
- **httpLoader** — fetch from an HTTP endpoint
- **remoteLoader** — full control over URL and headers
- **customLoader** — wrap any async function as a loader

```typescript
import { jsonLoader } from 'i18n-egy';

provideI18n({
  defaultLanguage: 'ar',
  languages: [
    { id: 'ar', nativeName: 'العربية', dir: 'rtl' },
    { id: 'en', nativeName: 'English', dir: 'ltr' },
  ],
  loader: jsonLoader({ path: '/assets/i18n' }),
});
```

## Template Usage

You can use the `TranslatePipe` in templates for convenience:

```html
<!-- Key-based (requires a configured loader) -->
<p>{{ 'home.title' | translate }}</p>
<p>{{ 'home.title' | translate:'Default Title' }}</p>

<!-- Inline typed translation (always works) -->
<p>{{ { ar: 'مرحبا', en: 'Hello' } | translate }}</p>
```

The pipe is **impure** by design, so it re-evaluates on every change detection cycle and always reflects the latest language and loaded translations. For component class code, prefer the direct `injectLanguage().translate(...)` call.

```typescript
import { TranslatePipe } from 'i18n-egy';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `{{ 'greeting' | translate }}`,
})
export class MyComponent {}
```

## License

MIT
