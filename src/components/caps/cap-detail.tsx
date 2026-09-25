"use client";

import Link from "next/link";
import { CapDisc } from "@/components/caps/cap-disc";
import { TradeButton } from "@/components/caps/trade-button";
import { Frame } from "@/components/ui";
import { capSpecs, capTags, isTradable } from "@/lib/caps";
import type { Cap } from "@/lib/types";
import { capDescription } from "@/lib/utils";

export function CapDetail({
  cap,
  from,
}: {
  cap: Cap;
  from: "collection" | "wishlist";
}) {
  return (
    <div className="wrap flex-1 pb-20 pt-8">
      <Link href={`/${from}`} className="ovr">
        ← {from === "wishlist" ? "My wishlist" : "My collection"}
      </Link>

      <div className="mt-7 grid items-start gap-9 lg:grid-cols-[.85fr_1.15fr] lg:gap-13">
        <Frame className="grid place-items-center bg-surface p-6 sm:p-13">
          <CapDisc cap={cap} size={250} />
        </Frame>

        <div>
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {cap.ref}
          </span>
          <h1 className="mb-1 mt-3" style={{ fontSize: "clamp(38px,5.4vw,60px)" }}>
            {cap.name}
          </h1>
          <div
            className="dim"
            style={{ fontFamily: "var(--font-display)", fontSize: 23 }}
          >
            {cap.brewery}
          </div>

          <p className="dim mt-5 max-w-[52ch] text-[15px] leading-relaxed">
            {capDescription(cap)}
          </p>

          <dl className="mt-6 grid max-w-[520px] grid-cols-[auto_1fr]">
            {capSpecs(cap).map(([key, value]) => (
              <div key={key} className="contents">
                <dt
                  className="ovr dimmer border-b border-line py-2.5 pr-6"
                  style={{ fontSize: 11 }}
                >
                  {key}
                </dt>
                <dd className="m-0 border-b border-line py-2 text-[15px]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {capTags(cap).map((tag) => (
              <span
                key={tag}
                className="ovr dim px-2.5 py-1.5"
                style={{ fontSize: 10, border: "1px solid var(--line)" }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {isTradable(cap) ? (
              <TradeButton capId={String(cap.id)} style={{ padding: "13px 24px" }} />
            ) : null}
            {!cap.wish && !isTradable(cap) ? (
              <span className="ovr dimmer max-w-[34ch]">
                Only one of these in the collection — it stays in the album, so it
                cannot be asked for.
              </span>
            ) : null}
            <Link href="/trade" className="btn quiet" style={{ padding: "13px 24px" }}>
              Open trade form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
