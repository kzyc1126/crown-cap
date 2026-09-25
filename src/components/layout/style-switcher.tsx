"use client";

import { ChoiceChip } from "@/components/ui";
import { useStyle } from "@/hooks/use-style";
import { styleOptions } from "@/data/styles";

/** Top bar: pick style 01 / 02 / 03. */
export function StyleSwitcher() {
  const { style, setStyle } = useStyle();
  const active = styleOptions.find((option) => option.id === style);

  return (
    <div className="border-b border-line bg-surface">
      <div className="wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-2">
        <span className="ovr dimmer hidden sm:inline">Style</span>
        <div className="flex flex-wrap gap-1.5">
          {styleOptions.map((option) => (
            <ChoiceChip
              key={option.id}
              active={option.id === style}
              onClick={() => setStyle(option.id)}
              title={option.note}
              className="py-1.5"
            >
              {option.number} {option.label}
            </ChoiceChip>
          ))}
        </div>
        <span className="ovr dimmer ml-auto hidden sm:block">{active?.note}</span>
      </div>
    </div>
  );
}
