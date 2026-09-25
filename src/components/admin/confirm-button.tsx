"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Destructive submit button that asks once inline — first click arms it,
 * second click submits. No browser dialog involved.
 */
export function ConfirmButton({
  label = "Delete",
  confirmLabel = "Tap again to delete",
  className,
}: {
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type={armed ? "submit" : "button"}
      onClick={() => {
        if (!armed) setArmed(true);
      }}
      className={cn("btn quiet", className)}
      style={armed ? { borderColor: "var(--accent)", color: "var(--accent-strong)" } : undefined}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
