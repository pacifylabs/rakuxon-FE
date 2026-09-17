import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The Tailwind preset *replaces* Tailwind's spacing scale with the design
 * tokens, so a utility like `w-56` or `bottom-32` does not exist — it compiles
 * to nothing and the element silently loses the style. That failure is invisible
 * in tests and easy to miss in review, so this guards the whole source tree.
 */

/* Vitest runs from the workspace root, where vitest.config.ts lives. */
const REPO_ROOT = process.cwd();

/** Keys defined in packages/ui/tailwind-preset.cjs `theme.spacing`. */
const SPACING_KEYS = new Set([
  '0',
  'px',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '16',
  '20',
]);

/** Keywords the width/height/inset scales keep from Tailwind's defaults. */
const KEYWORDS = new Set([
  'auto',
  'full',
  'screen',
  'min',
  'max',
  'fit',
  'content',
  'prose',
  'card-float',
  'media',
]);

const SPACING_PREFIXES = new Set([
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'w',
  'h',
  'size',
  'gap',
  'gap-x',
  'gap-y',
  'top',
  'bottom',
  'left',
  'right',
  'inset',
  'inset-x',
  'inset-y',
  'space-x',
  'space-y',
]);

const FRACTION = /^\d+\/\d+$/;

/**
 * Shipped components only. Test files are skipped because their prose trips the
 * scanner — "top-level route" parses as a `top-level` utility — and no CSS is
 * generated from them anyway.
 */
function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) sourceFiles(full, found);
    else if (full.endsWith('.tsx') && !full.endsWith('.test.tsx')) found.push(full);
  }
  return found;
}

function offScaleUtilities(file: string): string[] {
  const offenders: string[] = [];
  const contents = readFileSync(file, 'utf8');

  contents.split('\n').forEach((line, index) => {
    for (const token of line.match(/[\w:/[\]-]+/g) ?? []) {
      const core = token.split(':').at(-1)?.replace(/^-/, '') ?? '';
      const match = /^([a-z]+(?:-[xy])?)-([\w./[\]-]+)$/.exec(core);
      if (!match) continue;

      const [, prefix, value] = match as unknown as [string, string, string];
      if (!SPACING_PREFIXES.has(prefix)) continue;
      if (SPACING_KEYS.has(value) || KEYWORDS.has(value) || FRACTION.test(value)) continue;
      if (value.startsWith('[')) continue;

      offenders.push(`${file}:${index + 1} → ${token}`);
    }
  });

  return offenders;
}

describe('tailwind spacing scale', () => {
  it('uses no spacing utility that the token preset does not define', () => {
    const offenders = [
      ...sourceFiles(join(REPO_ROOT, 'packages/ui/src')),
      ...sourceFiles(join(REPO_ROOT, 'apps/base-site/src')),
    ].flatMap(offScaleUtilities);

    expect(offenders).toEqual([]);
  });
});
