# Code of Conduct

## Tech Stack

TypeScript, Tailwind CSS, Vite, Vitest, ESLint, cspell, pnpm.

## TypeScript

Run in strict mode with `useUnknownInCatchVariables` and `noUncheckedIndexedAccess` enabled. Keep the code type-safe: avoid `any` and `as`; reach for `unknown` or `never` instead.

## React Components

Annotate components with `FC`, and prefer named exports over default exports.

```tsx
import { FC } from 'react';

export const Component: FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

## Imports

Use the `#src/` alias (defined in the `imports` field of `package.json`) for internal modules, and `import type` for types.

```tsx
import type { ButtonProps } from '#src/components/ui/button';
import { cn } from '#src/utils/component';
```

Use the shortest specifier — drop any `/index` or `/index.ts` suffix. This matches the VSCode setting:

```json
{
  "typescript.preferences.importModuleSpecifierEnding": "minimal"
}
```

## Tests

Run `pnpm test` for a single pass or `pnpm test:watch` while developing. Write tests for important components and functions, and place them in an `__tests__` directory next to the implementation.

For cspell warnings, add the term to `cspell.config.yaml`:

```yaml
words:
  - apple
```

## Git Commit Messages

Write commit messages in English. They should clearly describe the change. Outside of proper nouns, the first word is lowercase.

```plaintext
feat: ✨ add new feature
chore: 📦 update dependencies
fix: 🐛 something is not working
```

## File Naming

Use kebab-case, e.g. `responsive-tabs.tsx`.

## Comments

Write comments in English, and keep them sparse — prefer self-explanatory code over narration.

## Compatibility

Target current browsers (Chrome, Safari, Firefox) and platforms (Android, iOS, Windows, macOS, Linux). Follow WCAG and a11y practices. Don't go out of the way to support legacy browsers.
