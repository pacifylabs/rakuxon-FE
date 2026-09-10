'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

export interface TabDefinition {
  id: string;
  label: string;
  /** Rendered inline before the label — usually a lucide icon. */
  icon?: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabDefinition[];
  /** Defaults to the first tab. */
  defaultTabId?: string;
}

/**
 * A tabbed panel: one focused section visible at a time instead of a long
 * stacked scroll. Uncontrolled — the active tab is this component's own
 * state, because which tab is open is a view concern, not something a
 * caller's data model needs to know about.
 */
export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const idBase = useId();
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const selected = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${idBase}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                selected
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          role="tabpanel"
          id={`${idBase}-panel-${active.id}`}
          aria-labelledby={`${idBase}-tab-${active.id}`}
          className="pt-8"
        >
          {active.content}
        </div>
      )}
    </div>
  );
}
