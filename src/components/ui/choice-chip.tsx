import { cn } from "@/lib/utils";

/**
 * Square-cornered choice button, reused in two places: the style picker
 * and the pagination numbers.
 */
export function ChoiceChip({
  active,
  onClick,
  children,
  className,
  title,
  ariaCurrent,
  square,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaCurrent?: "page";
  /** 38px square, used by the pagination numbers */
  square?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={ariaCurrent ? undefined : active}
      aria-current={ariaCurrent && active ? ariaCurrent : undefined}
      className={cn(
        "cursor-pointer transition-colors",
        square ? "h-[38px] min-w-[38px]" : "ovr px-3 py-2",
        className,
      )}
      style={{
        border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
        borderRadius: "var(--radius)",
        background: active ? "var(--accent)" : "transparent",
        color: active
          ? "var(--accent-ink)"
          : "color-mix(in srgb, var(--fg) 58%, transparent)",
        ...(square
          ? { fontFamily: "var(--font-display)", fontSize: 14 }
          : null),
      }}
    >
      {children}
    </button>
  );
}
