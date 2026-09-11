'use client';

import type { EnglishTestShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

const TESTS: EnglishTestShape['test'][] = ['IELTS', 'TOEFL', 'PTE', 'Duolingo'];

/** Shared between institutions and courses — the entity's `EnglishTest` jsonb shape is identical on both. */
export function EnglishTestsEditor({
  values,
  onChange,
}: {
  values: EnglishTestShape[];
  onChange: (values: EnglishTestShape[]) => void;
}) {
  return (
    <RepeatableGroup
      label="English tests"
      items={values}
      onChange={onChange}
      createBlank={() => ({ test: 'IELTS' as const, minScore: '' })}
      renderRow={(item, update) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={item.test}
            onChange={(e) => update({ test: e.target.value as EnglishTestShape['test'] })}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          >
            {TESTS.map((test) => (
              <option key={test} value={test}>
                {test}
              </option>
            ))}
          </select>
          <input
            value={item.minScore}
            onChange={(e) => update({ minScore: e.target.value })}
            placeholder="Minimum score, e.g. 6.5"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </div>
      )}
    />
  );
}
