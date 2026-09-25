import { CapTile } from "@/components/caps/cap-tile";
import { SectionHeading } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import type { Cap } from "@/lib/types";

export function LatestEntries({
  caps,
  totalCaps,
}: {
  caps: Cap[];
  totalCaps: number;
}) {
  return (
    <section className="wrap pb-18 pt-14">
      <SectionHeading
        title="Latest entries"
        action={{ label: `All ${formatNumber(totalCaps)} caps`, href: "/collection" }}
      />
      <div className="capgrid">
        {caps.map((cap) => (
          <CapTile key={cap.id} cap={cap} from="collection" />
        ))}
      </div>
    </section>
  );
}
