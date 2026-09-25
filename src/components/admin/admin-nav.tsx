"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/caps", label: "Caps" },
  { href: "/admin/requests", label: "Trade requests" },
  { href: "/admin/settings", label: "Site figures" },
  { href: "/admin/import", label: "Import" },
];

export function AdminNav({ newRequests }: { newRequests: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="ovr flex items-center gap-2 px-3 py-2"
            style={{
              border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
              borderRadius: "var(--radius)",
              background: active ? "var(--accent)" : "transparent",
              color: active
                ? "var(--accent-ink)"
                : "color-mix(in srgb, var(--fg) 62%, transparent)",
            }}
          >
            {link.label}
            {link.href === "/admin/requests" && newRequests > 0 ? (
              <span
                className="grid h-[18px] min-w-[18px] place-items-center rounded-full text-[10px]"
                style={{
                  background: active ? "var(--accent-ink)" : "var(--accent)",
                  color: active ? "var(--accent)" : "var(--accent-ink)",
                  letterSpacing: 0,
                }}
              >
                {newRequests}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
