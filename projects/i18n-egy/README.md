# i18n-egy

Modern Angular internationalization library powered by Signals. Zero runtime dependencies, fully tree-shakable, SSR safe.

## Installation

```bash
npm install i18n-egy
```

## Quick Start

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideI18n } from 'i18n-egy';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideI18n({
      defaultLanguage: 'ar',
      languages: [
        { id: 'ar', nativeName: 'العربية', displayName: 'Arabic', dir: 'rtl' },
        { id: 'en', nativeName: 'English', displayName: 'English', dir: 'ltr' },
      ],
    }),
  ],
});
```

```typescript
// any component
import { Component, inject } from '@angular/core';
import { I18nService } from 'i18n-egy';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <p>Language: {{ i18n.currentLanguage() }}</p>
    <button (click)="i18n.toggle()">Switch</button>
  `,
})
export class AppComponent {
  i18n = inject(I18nService);
}
```

## Features

- Signals-based reactive state
- Type-safe language configuration
- Automatic RTL/LTR direction management
- localStorage persistence
- SSR safe
- Tree-shakable
- Zero runtime dependencies

## Documentation

See the [README](https://github.com/.../i18n-egy#readme) for full documentation.

## License

MIT
