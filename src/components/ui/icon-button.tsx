import { cn } from "@/lib/utils";

/** Small square button, used for close and remove (×) actions. */
export function IconButton({
  label,
  onClick,
  size = 32,
  className,
}: {
  label: string;
  onClick: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("btn quiet flex-none p-0 leading-none", className)}
      style={{ width: size, height: size }}
    >
      ×
    </button>
  );
}
