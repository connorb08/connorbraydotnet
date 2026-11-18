## Import Conventions

- **No `.ts` or `.tsx` extensions:** Do not include `.ts` or `.tsx` file extensions in relative or alias import paths (e.g., use `import { foo } from './bar'` instead of `import { foo } from './bar.ts'`).
- **Keep other extensions:** Preserve explicit extensions only for non-TypeScript assets (such as `.json`, `.css`, or `.svg`) or if explicitly required by NodeNext/ESM `.js` resolution rules.
