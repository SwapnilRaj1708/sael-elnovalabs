import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

/**
 * Guardrails enforced here (see /CLAUDE.md §5, §6 and docs/architecture.md §3):
 *
 *  1. No component or page may import a concrete content repository — only the
 *     `getContentRepository()` factory from `@/lib/content`.
 *  2. Nothing outside `src/lib/config/env.ts` may read `process.env`.
 *  3. Nothing may import a retired section from
 *     `components/sections/_retired/` — see that folder's README.
 *
 * All three are asserted by `pnpm verify:guardrails`.
 */

const RESTRICTED_CONTENT_IMPORTS = {
  patterns: [
    {
      group: [
        '@/lib/content/mock',
        '@/lib/content/mock/**',
        '@/lib/content/api',
        '@/lib/content/api/**',
      ],
      message:
        'Import getContentRepository() from "@/lib/content" instead. Components and pages must not know which repository implementation is active — see /CLAUDE.md §6.',
    },
  ],
};

/**
 * Retired sections are kept so the work is recoverable, not so it can be
 * reached — the folder is inside `src/` only so it stays type-checked. Making
 * an import fail is what keeps "retired" a property of the build rather than a
 * comment someone has to notice. To bring one back, move it out of `_retired/`;
 * the rule keys on the path, so nothing else changes.
 */
const RESTRICTED_RETIRED_IMPORTS = {
  group: ['@/components/sections/_retired', '@/components/sections/_retired/**'],
  message:
    'This section is retired and is not rendered anywhere. Read src/components/sections/_retired/README.md — if you genuinely need it back, move it out of _retired/ rather than importing it from there.',
};

const RESTRICTED_PROCESS_ENV = [
  {
    object: 'process',
    property: 'env',
    message:
      'Read configuration from "@/lib/config/env" instead. process.env is validated in exactly one place — see docs/architecture.md §6.',
  },
];

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
    // Client handover staging: raw supplied files, gitignored, processed into
    // src/assets/ rather than shipped from here. It holds third-party HTML and
    // bundled JavaScript we neither own nor build. /CLAUDE.md §8.
    'assets/**',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [...RESTRICTED_CONTENT_IMPORTS.patterns, RESTRICTED_RETIRED_IMPORTS],
        },
      ],
      'no-restricted-properties': ['error', ...RESTRICTED_PROCESS_ENV],
    },
  },
  {
    // The data layer is allowed to reference its own implementations. It is
    // not allowed to reach into _retired/, so that group is restated rather
    // than the whole rule switched off.
    files: ['src/lib/content/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [RESTRICTED_RETIRED_IMPORTS] }],
    },
  },
  {
    // The single sanctioned reader of process.env.
    files: ['src/lib/config/env.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    // Unit tests, run by Node's own runner (`pnpm test`). `test()` and `it()`
    // return a promise the runner awaits itself.
    files: ['src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            { from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] },
          ],
        },
      ],
    },
  },
  {
    // Build and release tooling runs in Node, outside the app's config layer.
    files: ['scripts/**/*.mjs', '*.mjs', '*.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },
]);

export default eslintConfig;
