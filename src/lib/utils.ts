export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initialsOf(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/** A short description composed from the cap's own fields. */
export function capDescription(cap: {
  name: string;
  brewery: string;
  country: string;
  liner: string;
  year: number | null;
  copies: number;
  wish: boolean;
}) {
  const dated = cap.year === null ? "undated" : `dated ${cap.year}`;
  const base = `${cap.liner} liner, ${dated}, pressed for ${cap.brewery} in ${cap.country}.`;
  if (cap.wish) return `${base} Still missing from the album — this is one I'm hunting for.`;
  if (cap.copies > 1)
    return `${base} ${cap.copies} copies in the drawer, so the spares are open for trade.`;
  return `${base} Single copy, so it stays in the album for now.`;
}

/** Whether the href is the active route for the current pathname. */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
