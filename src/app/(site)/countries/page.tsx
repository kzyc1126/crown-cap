import type { Metadata } from "next";
import { CountryBoard } from "@/components/countries";
import { PageHeader } from "@/components/ui";
import { buildCountryRows, countryTotals } from "@/lib/country-rows";
import { formatNumber } from "@/lib/format";
import { getCountryTally } from "@/server/queries";

export const metadata: Metadata = { title: "Countries" };

// Static (ISR), refreshed every 10 minutes — served from the CDN, not a function.
export const revalidate = 600;

export default async function CountriesPage() {
  const rows = buildCountryRows(await getCountryTally());
  const totals = countryTotals(rows);
  const percent = Math.round((totals.collected / totals.sovereign) * 100);

  return (
    <div className="wrap flex-1 pb-18 pt-11">
      <PageHeader
        kicker="The world"
        title="Countries"
        note="Every country there is, and how much of each one is in the album. Open a country to see its caps."
      />

      <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-5">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 46, lineHeight: 1 }}>
            {totals.collected}
            <span className="dimmer" style={{ fontSize: 26 }}>
              /{totals.sovereign}
            </span>
          </div>
          <span className="ovr dimmer">Sovereign countries · {percent}%</span>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 46, lineHeight: 1 }}>
            {totals.places}
          </div>
          <span className="ovr dimmer">Places in total, territories included</span>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 46, lineHeight: 1 }}>
            {formatNumber(totals.caps)}
          </div>
          <span className="ovr dimmer">Caps catalogued</span>
        </div>

        <div
          className="h-2 min-w-[180px] flex-1"
          style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)" }}
          role="img"
          aria-label={`${totals.collected} of ${totals.sovereign} countries collected`}
        >
          <div
            className="h-full"
            style={{ width: `${percent}%`, background: "var(--accent)" }}
          />
        </div>
      </div>

      <CountryBoard rows={rows} />
    </div>
  );
}
