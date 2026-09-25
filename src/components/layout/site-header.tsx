"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/components/layout/nav-items";
import { TradeDrawer } from "@/components/layout/trade-drawer";
import { useCart } from "@/hooks/use-cart";
import type { Cap } from "@/lib/types";
import { isActivePath } from "@/lib/utils";

export function SiteHeader({
  ownerName,
  tradableCaps,
}: {
  ownerName: string;
  /** caps open for trade, so the drawer can show what has been marked */
  tradableCaps: Cap[];
}) {
  const pathname = usePathname();
  const cart = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Count only caps still open for trade — one marked earlier can since have
     been deleted, or dropped to its last copy. */
  const markedCount = cart.items.filter((id) =>
    tradableCaps.some((cap) => String(cap.id) === id),
  ).length;

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-line backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
      >
        <div className="wrap flex h-16 items-center gap-6 md:h-[76px]">
          <Link href="/" className="flex items-center gap-3 text-fg hover:text-fg">
            <span
              className="grid h-[26px] w-[26px] place-items-center rounded-full"
              style={{ background: "var(--accent)" }}
            >
              <span
                className="block h-[13px] w-[13px] rounded-full"
                style={{ background: "var(--bg)" }}
              />
            </span>
            <span
              className="uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 25,
                letterSpacing: "0.06em",
              }}
            >
              {ownerName}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ovr pb-1"
                  style={{
                    color: active
                      ? "var(--accent-strong)"
                      : "color-mix(in srgb, var(--fg) 55%, transparent)",
                    borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn ml-auto md:ml-0"
          >
            <span className="hidden sm:inline">For trade</span>
            <span
              className="grid h-[21px] min-w-[21px] place-items-center rounded-full text-[11px]"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
                letterSpacing: 0,
              }}
            >
              {markedCount}
            </span>
          </button>
        </div>
      </header>

      <TradeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        caps={tradableCaps}
      />
    </>
  );
}
