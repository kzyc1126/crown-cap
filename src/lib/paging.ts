/**
 * Page numbers to show around the current one: the first and last page always,
 * two either side of the current page, and `null` where a run is skipped.
 * A thousand caps is ninety-odd pages — printing them all is unusable.
 */
export function pageWindow(current: number, total: number, span = 2): Array<number | null> {
  const shown = new Set<number>([1, total]);
  for (let page = current - span; page <= current + span; page += 1) {
    if (page >= 1 && page <= total) shown.add(page);
  }

  const pages = [...shown].sort((a, b) => a - b);
  const out: Array<number | null> = [];
  pages.forEach((page, i) => {
    if (i > 0 && page - pages[i - 1] > 1) out.push(null);
    out.push(page);
  });
  return out;
}
