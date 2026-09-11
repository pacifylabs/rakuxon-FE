'use client';

import type { FaqShape } from '@rakuxon/contract';

import { RepeatableGroup } from './RepeatableGroup';

export function FaqsEditor({ values, onChange }: { values: FaqShape[]; onChange: (values: FaqShape[]) => void }) {
  return (
    <RepeatableGroup
      label="FAQs"
      items={values}
      onChange={onChange}
      createBlank={() => ({ question: '', answer: '' })}
      renderRow={(item, update) => (
        <div className="flex flex-col gap-2">
          <input
            value={item.question}
            onChange={(e) => update({ question: e.target.value })}
            placeholder="Question"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
          <textarea
            value={item.answer}
            onChange={(e) => update({ answer: e.target.value })}
            placeholder="Answer"
            rows={2}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring"
          />
        </div>
      )}
    />
  );
}
