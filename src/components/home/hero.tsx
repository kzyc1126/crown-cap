"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStyle } from "@/hooks/use-style";
import { Frame } from "@/components/ui";
import { yearsWord } from "@/lib/format";
import type { GallerySlide } from "@/lib/types";

const INTERVAL = 5600;

const panelBackground =
  "linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent) 6%, transparent))";

function Slides({ slides, index }: { slides: GallerySlide[]; index: number }) {
  /* An empty slideshow still needs to fill its frame. */
  if (slides.length === 0) {
    return (
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ background: panelBackground }}
      >
        <span className="ovr" style={{ color: "var(--accent-strong)" }}>
          Add slides in the admin
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(index * 100) / slides.length}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative h-full"
            style={{ width: `${100 / slides.length}%` }}
          >
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.caption}
                fill
                sizes="(min-width: 860px) 60vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="relative h-full w-full"
                style={{ background: panelBackground }}
              >
                <span
                  className="ovr absolute bottom-4 right-4"
                  style={{ color: "var(--accent-strong)" }}
                >
                  {slide.caption}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dots({
  slides,
  index,
  onPick,
  wide,
}: {
  slides: GallerySlide[];
  index: number;
  onPick: (i: number) => void;
  wide?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {slides.map((slide, i) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Slide ${i + 1}: ${slide.caption}`}
          aria-current={i === index}
          className="cursor-pointer border-0 p-0"
          style={{
            width: wide ? 46 : 40,
            height: wide ? 2 : 3,
            background:
              i === index
                ? "var(--accent)"
                : "color-mix(in srgb, var(--fg) 30%, transparent)",
          }}
        />
      ))}
    </div>
  );
}

export function Hero({
  slides,
  startYear,
}: {
  slides: GallerySlide[];
  startYear: number;
}) {
  const { style } = useStyle();
  const [index, setIndex] = useState(0);
  const years = yearsWord(startYear);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      INTERVAL,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  const intro =
    "Every cap lifted by hand and logged by country, brewery and liner. Duplicates are always open for trade.";

  /* Plate: a full-bleed hero with the text sitting over the photo. */
  if (style === "plate") {
    return (
      <section className="relative h-[min(74vh,620px)] overflow-hidden border-b border-line">
        <Slides slides={slides} index={index} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--bg) 94%, transparent) 0%, color-mix(in srgb, var(--bg) 45%, transparent) 46%, color-mix(in srgb, var(--bg) 60%, transparent) 100%)",
          }}
        />
        <div className="wrap relative flex h-full flex-col justify-end pb-10">
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            Plate I — the shelf
          </span>
          <h1
            className="mt-3.5 max-w-[16ch]"
            style={{ fontSize: "clamp(46px,8.4vw,108px)" }}
          >
            {years} years of{" "}
            <em style={{ fontStyle: "italic", color: "var(--accent)" }}>
              crown caps
            </em>
          </h1>
          <div className="mt-5 flex flex-wrap items-end gap-6">
            <p className="dim m-0 max-w-[44ch] text-base leading-relaxed">
              {intro}
            </p>
            <div className="ml-auto">
              <Dots slides={slides} index={index} onPick={setIndex} wide />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/collection" className="btn solid">
              Browse the collection
            </Link>
            <Link href="/trade" className="btn">
              Trade with me
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* Verdigris & Industry: text on the left, framed slideshow on the right. */
  return (
    <section className="wrap pt-11">
      <div className="grid items-end gap-11 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            Private catalogue — est. {startYear}
          </span>
          <h1
            className="mt-4"
            style={{ fontSize: "clamp(46px,7vw,84px)", lineHeight: 0.96 }}
          >
            {years} years
            <br />
            of crown caps
          </h1>
          <p className="dim mt-5 max-w-[40ch] text-base leading-relaxed">
            {intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/collection" className="btn solid">
              Browse the collection
            </Link>
            <Link href="/trade" className="btn">
              Trade with me
            </Link>
          </div>
        </div>

        <Frame className="relative aspect-[16/10]">
          <Slides slides={slides} index={index} />
          <div className="absolute bottom-4 left-4 z-3">
            <Dots slides={slides} index={index} onPick={setIndex} />
          </div>
        </Frame>
      </div>
    </section>
  );
}
