import { GROUP_VAR_PREFIX, OVERRIDABLE_TOKENS } from './tokens.types';
import type { TenantTokenOverrides, ThemeTokens } from './tokens.types';

/** `primaryHover` -> `primary-hover`; leaves `2xl` and `sm` untouched. */
export function camelToKebab(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** `('color', 'primaryHover')` -> `--color-primary-hover`. */
export function cssVarName(group: keyof ThemeTokens, key: string): string {
  const prefix = GROUP_VAR_PREFIX[group];
  return `--${prefix ? `${prefix}-` : ''}${camelToKebab(key)}`;
}

/**
 * Groups whose values are human text rather than CSS keywords. They are quoted
 * so that `content: var(--brand-name)` works in a stylesheet. The unquoted value
 * stays available in JS via the token object, which is what <Wordmark/> reads —
 * a pseudo-element would be invisible to search engines and screen readers.
 */
const CSS_STRING_GROUPS: ReadonlySet<keyof ThemeTokens> = new Set(['brand']);

function cssValue(group: keyof ThemeTokens, value: string): string {
  if (!CSS_STRING_GROUPS.has(group)) return value;
  return `"${value.replace(/["\\]/g, '\\$&')}"`;
}

/** Flattens a token set into the CSS custom properties components read. */
export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const group of Object.keys(tokens) as (keyof ThemeTokens)[]) {
    const groupTokens: Record<string, string> = tokens[group];
    for (const [key, value] of Object.entries(groupTokens)) {
      vars[cssVarName(group, key)] = cssValue(group, value);
    }
  }
  return vars;
}

/**
 * Merges tenant overrides over the base theme, discarding any key not declared
 * overridable in `OVERRIDABLE_TOKENS`. State and neutral tokens therefore stay
 * consistent across every tenant, which is the point (docs/04-design-system.md § 2).
 */
export function mergeTokens(
  base: ThemeTokens,
  overrides?: TenantTokenOverrides | null,
): ThemeTokens {
  if (!overrides) return base;

  const merged: ThemeTokens = {
    ...base,
    brand: { ...base.brand },
    color: { ...base.color },
    font: { ...base.font },
    text: { ...base.text },
    weight: { ...base.weight },
    space: { ...base.space },
    radius: { ...base.radius },
    shadow: { ...base.shadow },
    motion: { ...base.motion },
  };

  for (const [group, allowedKeys] of Object.entries(OVERRIDABLE_TOKENS) as [
    keyof typeof OVERRIDABLE_TOKENS,
    readonly string[],
  ][]) {
    const groupOverrides = overrides[group] as Record<string, string> | undefined;
    if (!groupOverrides) continue;

    const target: Record<string, string> = merged[group];
    for (const key of allowedKeys) {
      const value = groupOverrides[key];
      if (typeof value === 'string' && value.trim() !== '') {
        target[key] = value;
      }
    }
  }

  return merged;
}

/** Serialises a token set into a `:root { ... }` rule for server-rendered output. */
export function serializeCssVars(tokens: ThemeTokens, selector = ':root'): string {
  const declarations = Object.entries(tokensToCssVars(tokens))
    .map(([name, value]) => `${name}:${value};`)
    .join('');
  return `${selector}{${declarations}}`;
}

/**
 * Both schemes in one stylesheet.
 *
 * Dark applies when the visitor has explicitly chosen it, or when the OS asks
 * for it and they have not explicitly chosen light. The explicit choice wins in
 * both directions, which is what people with light sensitivity need.
 */
export function serializeScheme(light: ThemeTokens, dark: ThemeTokens, selector = ':root'): string {
  const darkVars = Object.entries(tokensToCssVars(dark))
    .map(([name, value]) => `${name}:${value};`)
    .join('');

  return [
    serializeCssVars(light, selector),
    `${selector}[data-theme="dark"]{${darkVars}}`,
    `@media (prefers-color-scheme:dark){${selector}:not([data-theme="light"]){${darkVars}}}`,
    LOGO_SWAP_RULES(selector),
  ].join('');
}

/**
 * Which logo file shows, in the same three states as the colours.
 *
 * A brand image cannot be recoloured by a CSS variable, so the light and dark
 * artwork are both rendered and one is hidden. The rules live here, beside the
 * token rules, because they encode the *same* explicit-choice-wins logic — kept
 * apart they would drift, and the failure mode is an invisible logo.
 */
const LOGO_SWAP_RULES = (selector: string): string =>
  [
    `[data-rk-logo="dark"]{display:none}`,
    `${selector}[data-theme="dark"] [data-rk-logo="light"]{display:none}`,
    `${selector}[data-theme="dark"] [data-rk-logo="dark"]{display:block}`,
    `@media (prefers-color-scheme:dark){`,
    `${selector}:not([data-theme="light"]) [data-rk-logo="light"]{display:none}`,
    `${selector}:not([data-theme="light"]) [data-rk-logo="dark"]{display:block}}`,
  ].join('');
