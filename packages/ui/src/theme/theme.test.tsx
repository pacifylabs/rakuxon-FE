import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from './ThemeProvider';
import {
  cssVarName,
  mergeTokens,
  serializeCssVars,
  serializeScheme,
  tokensToCssVars,
} from './cssVars';
import { baseTokens } from './tokens.base';
import { darkTokens } from './tokens.dark';
import { OVERRIDABLE_TOKENS } from './tokens.types';
import { useTheme } from './useTheme';

function ThemeProbe() {
  const theme = useTheme();
  return (
    <dl>
      <dt>primary</dt>
      <dd data-testid="primary">{theme.color.primary}</dd>
      <dt>danger</dt>
      <dd data-testid="danger">{theme.color.danger}</dd>
      <dt>brand</dt>
      <dd data-testid="brand">{theme.brand.name}</dd>
      <dt>heading</dt>
      <dd data-testid="heading">{theme.font.heading}</dd>
    </dl>
  );
}

/** WCAG relative luminance. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const TINT_FOREGROUNDS = ['tone1', 'tone2', 'tone3', 'tone4', 'urgent'] as const;

describe('cssVarName', () => {
  it.each([
    ['color', 'primaryHover', '--color-primary-hover'],
    ['color', 'onPrimary', '--color-on-primary'],
    ['color', 'surfaceMuted', '--color-surface-muted'],
    ['color', 'focusRing', '--color-focus-ring'],
    ['text', '2xl', '--text-2xl'],
    ['space', '16', '--space-16'],
    ['radius', 'full', '--radius-full'],
    ['tint', 'tone1Soft', '--tint-tone1-soft'],
    ['motion', 'easeStandard', '--ease-standard'],
    ['motion', 'durationBase', '--duration-base'],
    ['brand', 'name', '--brand-name'],
  ] as const)('maps %s.%s to %s', (group, key, expected) => {
    expect(cssVarName(group, key)).toBe(expected);
  });
});

describe('tokensToCssVars', () => {
  it('emits every declared token as a CSS variable', () => {
    const vars = tokensToCssVars(baseTokens);
    const declaredCount = Object.values(baseTokens).reduce(
      (total, group) => total + Object.keys(group).length,
      0,
    );
    expect(Object.keys(vars)).toHaveLength(declaredCount);
  });

  it('emits the exact Modern Campus palette from the design system spec', () => {
    const vars = tokensToCssVars(baseTokens);
    expect(vars['--color-primary']).toBe('#143D28');
    expect(vars['--color-primary-hover']).toBe('#1C5537');
    expect(vars['--color-accent']).toBe('#1572FE');
    expect(vars['--color-accent-soft']).toBe('#E7F0FE');
    expect(vars['--color-surface-muted']).toBe('#E2E6EE');
    expect(vars['--color-text']).toBe('#0E1F16');
    expect(vars['--color-border']).toBe('#CFD6E0');
    expect(vars['--radius-lg']).toBe('20px');
    expect(vars['--space-16']).toBe('64px');
  });

  it('emits the decorative tints under slot names', () => {
    const vars = tokensToCssVars(baseTokens);
    expect(vars['--tint-tone1']).toBe('#175C3A');
    expect(vars['--tint-tone2']).toBe('#1258C4');
    expect(vars['--tint-tone3']).toBe('#0E6E62');
    expect(vars['--tint-tone4']).toBe('#3F4C7A');
    expect(vars['--tint-urgent']).toBe('#A8480B');
    expect(vars['--tint-urgent-soft']).toBe('#FDF0E6');
  });

  it('keeps decorative tints distinct from the state palette', () => {
    // A tinted capability square must not be --color-success: state colours
    // have to keep meaning what they say (docs/04-design-system § 5).
    const stateColours = [
      baseTokens.color.success,
      baseTokens.color.warning,
      baseTokens.color.danger,
      baseTokens.color.info,
    ];
    for (const key of TINT_FOREGROUNDS) {
      expect(stateColours, `tint.${key}`).not.toContain(baseTokens.tint[key]);
    }
  });

  it('keeps the accent visually distinct from the info state', () => {
    // The two were the same blue before the Modern Campus retune; an accent
    // that reads as an info badge makes both meaningless.
    expect(
      Math.abs(luminance(baseTokens.color.accent) - luminance(baseTokens.color.info)),
    ).toBeGreaterThan(0.03);
  });

  it('gives every tint foreground AA contrast on white and on the sage band', () => {
    for (const key of TINT_FOREGROUNDS) {
      expect(
        contrast(baseTokens.tint[key], '#FFFFFF'),
        `tint.${key} on white`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(baseTokens.tint[key], baseTokens.color.surfaceMuted),
        `tint.${key} on surface-muted`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('gives body and muted text AA contrast on both surfaces', () => {
    for (const key of ['text', 'textMuted', 'primary'] as const) {
      expect(
        contrast(baseTokens.color[key], baseTokens.color.surface),
        `${key} on surface`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(baseTokens.color[key], baseTokens.color.surfaceMuted),
        `${key} on muted`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('gives on-primary text AA contrast against the primary block', () => {
    expect(contrast(baseTokens.color.onPrimary, baseTokens.color.primary)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('quotes the brand name so it is usable from CSS', () => {
    expect(tokensToCssVars(baseTokens)['--brand-name']).toBe('"Rakuxon"');
    expect(tokensToCssVars(baseTokens)['--brand-tagline']).toBe('"Where Minds Meet Maps."');
  });
});

describe('mergeTokens', () => {
  it('returns the base theme when there are no overrides', () => {
    expect(mergeTokens(baseTokens, null)).toEqual(baseTokens);
  });

  it('lets a tenant override brand colours', () => {
    const merged = mergeTokens(baseTokens, { color: { primary: '#7A1F3D' } });
    expect(merged.color.primary).toBe('#7A1F3D');
  });

  it('lets a tenant override the brand name and the heading font', () => {
    const merged = mergeTokens(baseTokens, {
      brand: { name: 'Acme Study' },
      font: { heading: 'Georgia, serif' },
    });
    expect(merged.brand.name).toBe('Acme Study');
    expect(merged.font.heading).toBe('Georgia, serif');
  });

  it('ignores an attempt to override a state colour, so danger always reads as danger', () => {
    const merged = mergeTokens(baseTokens, {
      // @ts-expect-error state tokens are deliberately outside TenantTokenOverrides
      color: { danger: '#00FF00', success: '#00FF00' },
    });
    expect(merged.color.danger).toBe(baseTokens.color.danger);
    expect(merged.color.success).toBe(baseTokens.color.success);
  });

  it('ignores an attempt to override a neutral colour', () => {
    const merged = mergeTokens(baseTokens, {
      // @ts-expect-error neutral tokens are fixed
      color: { bg: '#000000', text: '#FF0000' },
    });
    expect(merged.color.bg).toBe(baseTokens.color.bg);
    expect(merged.color.text).toBe(baseTokens.color.text);
  });

  it('ignores the body font, which is not tenant-overridable', () => {
    const merged = mergeTokens(baseTokens, {
      // @ts-expect-error only font.heading is overridable
      font: { sans: 'Comic Sans MS' },
    });
    expect(merged.font.sans).toBe(baseTokens.font.sans);
  });

  it('ignores a blank override rather than blanking the brand', () => {
    const merged = mergeTokens(baseTokens, { color: { primary: '   ' } });
    expect(merged.color.primary).toBe(baseTokens.color.primary);
  });

  it('does not mutate the base theme', () => {
    const before = baseTokens.color.primary;
    mergeTokens(baseTokens, { color: { primary: '#123456' } });
    expect(baseTokens.color.primary).toBe(before);
  });

  it('declares only brand tokens as overridable', () => {
    expect(OVERRIDABLE_TOKENS.color).not.toContain('danger');
    expect(OVERRIDABLE_TOKENS.color).not.toContain('bg');
    expect(OVERRIDABLE_TOKENS.color).toContain('primary');
  });
});

describe('serializeCssVars', () => {
  it('produces a :root rule by default', () => {
    expect(serializeCssVars(baseTokens)).toMatch(/^:root\{--brand-name:/);
  });

  it('honours a custom selector', () => {
    expect(serializeCssVars(baseTokens, '.tenant')).toMatch(/^\.tenant\{/);
  });
});

describe('<ThemeProvider/>', () => {
  it('renders the resolved variables so first paint is already themed', () => {
    const { container } = render(
      <ThemeProvider>
        <p>hello</p>
      </ThemeProvider>,
    );
    const style = container.querySelector('style[data-rakuxon-theme]');
    expect(style?.textContent).toContain('--color-primary:#143D28');
  });

  it('supplies the base theme to consumers', () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('primary')).toHaveTextContent('#143D28');
    expect(screen.getByTestId('brand')).toHaveTextContent('Rakuxon');
  });

  it('applies a tenant brand override to consumers and to the emitted CSS', () => {
    const { container } = render(
      <ThemeProvider tokens={{ color: { primary: '#7A1F3D' }, brand: { name: 'Acme Study' } }}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('primary')).toHaveTextContent('#7A1F3D');
    expect(screen.getByTestId('brand')).toHaveTextContent('Acme Study');
    expect(container.querySelector('style[data-rakuxon-theme]')?.textContent).toContain(
      '--color-primary:#7A1F3D',
    );
  });

  it('keeps state colours fixed even when a tenant tries to change them', () => {
    render(
      // @ts-expect-error state tokens are deliberately outside TenantTokenOverrides
      <ThemeProvider tokens={{ color: { danger: '#00FF00' } }}>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('danger')).toHaveTextContent('#E5484D');
  });

  it('falls back to the base theme outside a provider', () => {
    render(<ThemeProbe />);
    expect(screen.getByTestId('primary')).toHaveTextContent('#143D28');
  });
});

describe('dark scheme', () => {
  const DARK_SURFACES = ['bg', 'surface', 'surfaceMuted'] as const;

  it('defines every token the light scheme does', () => {
    expect(Object.keys(darkTokens.color).sort()).toEqual(Object.keys(baseTokens.color).sort());
    expect(Object.keys(darkTokens.tint).sort()).toEqual(Object.keys(baseTokens.tint).sort());
  });

  it('shares type, space, radius and motion with the light scheme', () => {
    // One system, two palettes: only colour, tint and shadow may differ.
    expect(darkTokens.text).toEqual(baseTokens.text);
    expect(darkTokens.space).toEqual(baseTokens.space);
    expect(darkTokens.radius).toEqual(baseTokens.radius);
    expect(darkTokens.motion).toEqual(baseTokens.motion);
  });

  it('actually inverts: dark ground is darker than light ground', () => {
    expect(luminance(darkTokens.color.bg)).toBeLessThan(luminance(baseTokens.color.bg));
    expect(luminance(darkTokens.color.text)).toBeGreaterThan(luminance(baseTokens.color.text));
  });

  it('gives body and muted text AA contrast on all three dark surfaces', () => {
    for (const surface of DARK_SURFACES) {
      for (const key of ['text', 'textMuted', 'primary', 'accent'] as const) {
        expect(
          contrast(darkTokens.color[key], darkTokens.color[surface]),
          `${key} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('gives every dark tint AA contrast on all three dark surfaces', () => {
    for (const surface of DARK_SURFACES) {
      for (const key of TINT_FOREGROUNDS) {
        expect(
          contrast(darkTokens.tint[key], darkTokens.color[surface]),
          `tint.${key} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps the photo scrim identical in both schemes', () => {
    // A scrim over a photograph must stay dark whichever scheme is active.
    // It was --color-text, which turned the fade white in dark mode.
    expect(darkTokens.color.scrim).toBe(baseTokens.color.scrim);
    expect(darkTokens.color.onScrim).toBe(baseTokens.color.onScrim);
  });

  it('gives scrim text AA contrast against the scrim in both schemes', () => {
    expect(contrast(baseTokens.color.onScrim, baseTokens.color.scrim)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(darkTokens.color.onScrim, darkTokens.color.scrim)).toBeGreaterThanOrEqual(4.5);
  });

  it('inverts on-primary, because white on the dark primary would fail', () => {
    expect(contrast('#FFFFFF', darkTokens.color.primary)).toBeLessThan(4.5);
    expect(contrast(darkTokens.color.onPrimary, darkTokens.color.primary)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('gives every dark state colour AA contrast on the dark surface', () => {
    for (const key of ['success', 'warning', 'danger', 'info'] as const) {
      expect(
        contrast(darkTokens.color[key], darkTokens.color.surface),
        `${key} on surface`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('serializeScheme', () => {
  const css = serializeScheme(baseTokens, darkTokens);

  it('emits the light scheme on bare :root', () => {
    expect(css).toContain(`:root{--brand-name:`);
    expect(css).toContain(`--color-bg:${baseTokens.color.bg}`);
  });

  it('lets an explicit dark choice win', () => {
    expect(css).toContain(`:root[data-theme="dark"]{`);
    expect(css).toContain(`--color-bg:${darkTokens.color.bg}`);
  });

  it('follows the OS only when no explicit choice was made', () => {
    // Without the :not([data-theme="light"]) guard, choosing light on a dark
    // OS would be silently overridden.
    expect(css).toContain('@media (prefers-color-scheme:dark)');
    expect(css).toContain(':root:not([data-theme="light"])');
  });
});

describe('<ThemeProvider/> scheme output', () => {
  it('publishes both schemes so the toggle needs no re-render', () => {
    const { container } = render(
      <ThemeProvider>
        <p>hello</p>
      </ThemeProvider>,
    );
    const css = container.querySelector('style[data-rakuxon-theme]')?.textContent ?? '';
    expect(css).toContain(`--color-primary:${baseTokens.color.primary}`);
    expect(css).toContain(`--color-primary:${darkTokens.color.primary}`);
  });

  it('applies a tenant brand override to every scheme block', () => {
    const { container } = render(
      <ThemeProvider tokens={{ color: { primary: '#7A1F3D' } }}>
        <p>hello</p>
      </ThemeProvider>,
    );
    const css = container.querySelector('style[data-rakuxon-theme]')?.textContent ?? '';
    // Three blocks carry it: light on :root, explicit dark, and OS dark.
    expect(css.match(/--color-primary:#7A1F3D/g)).toHaveLength(3);
  });
});
