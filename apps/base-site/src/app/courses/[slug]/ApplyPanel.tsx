import { Clock3, Info } from 'lucide-react';

export interface ApplyPanelProps {
  applyHref: string;
  tuition: string;
  tuitionPer: string;
  deadline?: string;
  urgent?: boolean;
  facts: readonly { label: string; value: string }[];
  offerResponseWeeks?: number;
}

/**
 * The decision panel: fee, deadline, the facts, and the action.
 *
 * Sticky from `lg`, because the requirements list is long and the apply button
 * scrolling away is how a page loses someone who had already decided. Below
 * `lg` it sits inline — a sticky block on a short viewport eats the content.
 *
 * The fee disclaimer is not boilerplate. Fees vary by study option and the
 * currency is converted, so a number presented as final would be one somebody
 * budgets against.
 */
export function ApplyPanel({
  applyHref,
  tuition,
  tuitionPer,
  deadline,
  urgent = false,
  facts,
  offerResponseWeeks,
}: ApplyPanelProps) {
  return (
    <aside aria-label="Apply" className="lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <a
          href={applyHref}
          className="flex min-h-12 w-full items-center justify-center bg-primary px-6 text-base font-semibold text-on-primary transition-colors duration-fast ease-standard hover:bg-primary-hover focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Proceed to apply
        </a>

        <div className="border-b border-border bg-surface-muted px-5 py-4">
          <p className="text-xl font-bold text-text">{tuition}</p>
          <p className="mt-0.5 text-sm text-text-muted">Tuition fee, {tuitionPer}</p>
        </div>

        {deadline && (
          <p
            className={`flex items-center gap-2 border-b border-border px-5 py-3 text-sm font-semibold ${
              urgent ? 'text-tint-urgent' : 'text-text'
            }`}
          >
            <Clock3 size={15} aria-hidden="true" focusable="false" />
            Apply by {deadline}
          </p>
        )}

        <dl className="divide-y divide-border">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-text-muted">{fact.label}</dt>
              <dd className="text-sm font-semibold text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {offerResponseWeeks !== undefined && (
          <p className="border-t border-border px-5 py-3 text-sm text-text-muted">
            <span className="font-semibold text-text">Offer response</span>
            <span className="mt-0.5 block">
              about {offerResponseWeeks} week{offerResponseWeeks === 1 ? '' : 's'} after you submit
            </span>
          </p>
        )}

        <p className="flex gap-2 border-t border-border px-5 py-3 text-xs text-text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" focusable="false" />
          Fees and deadlines depend on the study options you choose. Currency conversions are
          approximate.
        </p>
      </div>
    </aside>
  );
}
