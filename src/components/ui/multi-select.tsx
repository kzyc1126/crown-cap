"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { value: string; count?: number };

/**
 * A dropdown of checkboxes. The trigger reads like an input and names what is
 * picked; the panel lists every option with its count, and grows a search box
 * once the list is too long to scan (the country list runs to 180 rows).
 */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "All",
  searchable = options.length > 8,
  className,
}: {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  /** trigger text when nothing is selected */
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [needle, setNeedle] = useState("");

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (option: string) =>
    onChange(
      value.includes(option) ? value.filter((v) => v !== option) : [...value, option],
    );

  const q = needle.trim().toLowerCase();
  const shown = q
    ? options.filter((option) => option.value.toLowerCase().includes(q))
    : options;

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(", ")
        : `${value.length} selected`;

  return (
    <div ref={root} className={cn("relative", className)}>
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        className="input flex cursor-pointer items-center justify-between gap-3 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-summary`}
        onClick={() => setOpen((v) => !v)}
        style={value.length ? { borderColor: "var(--accent)" } : undefined}
      >
        <span id={`${id}-summary`} className="truncate">
          {summary}
        </span>
        <span
          aria-hidden
          className="flex-none text-[10px]"
          style={{
            color: "color-mix(in srgb, var(--fg) 55%, transparent)",
            transform: open ? "rotate(180deg)" : undefined,
          }}
        >
          ▼
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable
          aria-labelledby={`${id}-label`}
          className="absolute left-0 z-30 mt-1.5 min-w-full"
          style={{
            width: "max(100%, 240px)",
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            boxShadow: "0 12px 32px color-mix(in srgb, var(--fg) 14%, transparent)",
          }}
        >
          {searchable ? (
            <div className="border-b border-line p-2">
              <input
                type="text"
                className="input py-2"
                placeholder="Type to narrow…"
                value={needle}
                autoFocus
                onChange={(event) => setNeedle(event.target.value)}
              />
            </div>
          ) : null}

          <ul className="m-0 max-h-[280px] list-none overflow-y-auto p-1.5">
            {shown.map((option) => {
              const checked = value.includes(option.value);
              return (
                <li key={option.value}>
                  <label
                    className="flex cursor-pointer items-center gap-3 px-2 py-1.5 text-[14px]"
                    style={{
                      borderRadius: "var(--radius)",
                      background: checked
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : undefined,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option.value)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="flex-1 truncate">{option.value}</span>
                    {option.count !== undefined ? (
                      <span className="ovr dimmer">{option.count}</span>
                    ) : null}
                  </label>
                </li>
              );
            })}
            {shown.length === 0 ? (
              <li className="dimmer px-2 py-2 text-[14px]">Nothing matches.</li>
            ) : null}
          </ul>

          {value.length ? (
            <div className="flex justify-end border-t border-line px-2 py-1.5">
              <button
                type="button"
                className="ovr cursor-pointer"
                style={{ color: "var(--accent-strong)" }}
                onClick={() => onChange([])}
              >
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
