import { Plus, Trash2 } from 'lucide-react';

import { Button, FormField, SelectField } from '@rakuxon/ui';
import type { EducationHistoryEntry } from '@rakuxon/contract';

import { QUALIFICATION_LEVELS } from './qualificationLevels';

export function EducationHistorySection({
  entries,
  onChange,
  onAdd,
  onRemove,
}: {
  entries: EducationHistoryEntry[];
  onChange: (index: number, patch: Partial<EducationHistoryEntry>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-heading text-lg font-semibold text-text">Education history</h2>

      {entries.length === 0 && (
        <p className="text-sm text-text-muted">Add at least your most recent school or institution.</p>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
          {entries.map((entry, index) => (
            <div key={index} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <FormField
                label="Institution name"
                name={`institutionName-${index}`}
                defaultValue={entry.institutionName}
                onChange={(event) => onChange(index, { institutionName: event.target.value })}
              />
              <FormField
                label="Qualification"
                name={`qualification-${index}`}
                placeholder="e.g. WAEC, A-Levels, BSc Computer Science"
                defaultValue={entry.qualification}
                onChange={(event) => onChange(index, { qualification: event.target.value })}
              />
              <SelectField
                label="Level"
                name={`level-${index}`}
                placeholder="Select a level"
                options={QUALIFICATION_LEVELS}
                value={entry.level ?? ''}
                onChange={(value) =>
                  onChange(index, { level: (value || undefined) as EducationHistoryEntry['level'] })
                }
              />
              <FormField
                label="Field of study"
                name={`fieldOfStudy-${index}`}
                placeholder="Optional"
                defaultValue={entry.fieldOfStudy ?? ''}
                onChange={(event) => onChange(index, { fieldOfStudy: event.target.value })}
              />
              <FormField
                label="Grade"
                name={`grade-${index}`}
                placeholder="Optional"
                defaultValue={entry.grade ?? ''}
                onChange={(event) => onChange(index, { grade: event.target.value })}
              />
              <FormField
                label="Start year"
                name={`startYear-${index}`}
                type="number"
                placeholder="2020"
                defaultValue={entry.startYear ? String(entry.startYear) : ''}
                onChange={(event) =>
                  onChange(index, { startYear: Number(event.target.value) || undefined })
                }
              />
              <FormField
                label="End year"
                name={`endYear-${index}`}
                type="number"
                placeholder="2023"
                defaultValue={entry.endYear ? String(entry.endYear) : ''}
                onChange={(event) =>
                  onChange(index, { endYear: Number(event.target.value) || undefined })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="Remove this entry"
              className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-danger"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="ghost" type="button" onClick={onAdd} className="self-start">
        <Plus aria-hidden="true" className="mr-2 inline size-4" />
        Add another
      </Button>
    </div>
  );
}
