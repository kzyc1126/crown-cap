import Link from "next/link";
import { formatNumber } from "@/lib/format";

export function SiteFooter({
  ownerName,
  totalCaps,
  totalCountries,
}: {
  ownerName: string;
  totalCaps: number;
  totalCountries: number;
}) {
  return (
    <footer className="border-t border-line pb-8 pt-6">
      <div className="wrap flex flex-wrap items-baseline gap-4">
        <span className="ovr dimmer">{ownerName} — personal catalogue</span>
        <Link href="/admin" className="ovr dimmer hover:text-fg">
          Admin
        </Link>
        <span className="ovr dimmer ml-auto">
          {formatNumber(totalCaps)} caps · {formatNumber(totalCountries)} countries
        </span>
      </div>
    </footer>
  );
}
