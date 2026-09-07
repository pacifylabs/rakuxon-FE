import { Wordmark } from '@rakuxon/ui';
import type { ReactNode } from 'react';

/** The shell both auth screens sit in, so they cannot drift apart. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-muted px-5 py-16">
      <div className="w-full max-w-prose">
        <div className="flex justify-center">
          <Wordmark href="/" />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-surface p-8 shadow-md">
          <h1 className="font-heading text-2xl font-bold text-text">{title}</h1>
          <p className="mt-2 text-base text-text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">{footer}</p>
      </div>
    </main>
  );
}
