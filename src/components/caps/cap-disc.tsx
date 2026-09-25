"use client";

import Image from "next/image";
import { useStyle } from "@/hooks/use-style";
import { capPalettes } from "@/data/styles";
import type { Cap } from "@/lib/types";
import { initialsOf } from "@/lib/utils";

/**
 * The cap itself. Uses the photo from /public/caps when the cap has one,
 * otherwise falls back to a crimped disc carrying the cap's initials.
 */
export function CapDisc({ cap, size = 98 }: { cap: Cap; size?: number }) {
  const { style } = useStyle();
  const [fill, ink] = capPalettes[style][cap.paletteIndex % 8];

  // The photos in /public/caps have had their studio backdrop cut away, so
  // the cap sits on the page with no ring and no circular crop — either
  // would only shave the crimped teeth off an edge it already has.
  if (cap.image) {
    return (
      <div className="relative flex-none" style={{ width: size, height: size }}>
        <Image
          src={cap.image}
          alt={cap.name}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </div>
    );
  }

  const inner = Math.round(size * 0.806);

  return (
    <div
      className="grid flex-none place-items-center rounded-full"
      style={{ width: size, height: size, background: "var(--ring)" }}
    >
      <div
        className="grid place-items-center rounded-full"
        style={{
          width: inner,
          height: inner,
          background: fill,
          color: ink,
          fontFamily: "var(--font-display)",
          fontSize: Math.round(size * 0.245),
        }}
      >
        {initialsOf(cap.name)}
      </div>
    </div>
  );
}
