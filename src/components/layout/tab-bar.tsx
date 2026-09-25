"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-items";

/** Bottom navigation for small screens. */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-bg md:hidden">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[66px] flex-col items-center justify-center gap-1.5"
            style={{
              color: active
                ? "var(--accent-strong)"
                : "color-mix(in srgb, var(--fg) 55%, transparent)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: active
                  ? "var(--accent)"
                  : "color-mix(in srgb, var(--fg) 25%, transparent)",
              }}
            />
            {/* Plate sets a monospace overline, so the label is kept small
                and clipped rather than left to run into its neighbour. */}
            <span
              className="ovr w-full truncate px-0.5 text-center"
              style={{ fontSize: 9, letterSpacing: "0.06em" }}
            >
              {item.short}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
