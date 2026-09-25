import Link from "next/link";
import { Frame } from "@/components/ui";

const cards = [
  {
    index: "01",
    label: "My collection",
    desc: "Every cap, arranged by country, brewery, liner or decade.",
    cta: "Browse",
    href: "/collection",
  },
  {
    index: "02",
    label: "Countries",
    desc: "Every country in the collection, with a cap from each.",
    cta: "Explore",
    href: "/countries",
  },
  {
    index: "03",
    label: "My wishlist",
    desc: "The caps still missing. Reference only — not for trade.",
    cta: "See the wants",
    href: "/wishlist",
  },
  {
    index: "04",
    label: "Trade with me",
    desc: "Mark my duplicates, offer yours, send one request.",
    cta: "Start a trade",
    href: "/trade",
  },
];

export function MenuCards() {
  return (
    <section className="wrap pt-14">
      <div className="grid gap-7 sm:grid-cols-2">
        {cards.map((card) => (
          <Frame key={card.index} className="transition-colors hover:border-accent-mid">
            <Link href={card.href} className="block p-6 text-fg hover:text-fg">
              <span className="ovr" style={{ color: "var(--accent-strong)" }}>
                {card.index}
              </span>
              <h3 className="mb-2 mt-3 text-[28px]">{card.label}</h3>
              <p className="dim min-h-12 text-[15px] leading-relaxed">{card.desc}</p>
              <span className="ovr" style={{ color: "var(--accent-strong)" }}>
                {card.cta} &nbsp;→
              </span>
            </Link>
          </Frame>
        ))}
      </div>
    </section>
  );
}
