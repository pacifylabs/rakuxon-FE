import clsx from 'clsx';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary-hover',
  ghost: 'bg-transparent text-primary border border-border hover:bg-accent-soft',
  accent: 'bg-accent-soft text-primary hover:bg-accent hover:text-on-primary',
  danger: 'bg-danger text-on-primary shadow-sm hover:opacity-90',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};

const BASE_CLASSES = clsx(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold',
  'transition-colors duration-fast ease-standard',
  'focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'motion-reduce:transition-none',
);

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

export type ButtonLinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & {
    href: string;
  };

/**
 * Primary / ghost / accent action. Renders an <a> when given `href` and a
 * <button> otherwise, so a navigation CTA stays a real link for keyboard,
 * middle-click and screen-reader users.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;
  const classes = clsx(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
