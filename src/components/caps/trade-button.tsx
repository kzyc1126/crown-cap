"use client";

import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

/** The "Add for trade" button, shared by the grid and the detail page. */
export function TradeButton({
  capId,
  className,
  style,
}: {
  capId: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cart = useCart();
  const marked = cart.has(capId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        cart.toggle(capId);
      }}
      className={cn("btn", marked && "solid", className)}
      style={style}
    >
      {marked ? "Marked ✓" : "Add for trade"}
    </button>
  );
}
