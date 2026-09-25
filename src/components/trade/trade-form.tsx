"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Field, PageHeader, SectionHeading } from "@/components/ui";
import { TradeOfferCard } from "@/components/trade/trade-offer-card";
import {
  emptyOffer,
  offeredCapFields,
  type Offer,
} from "@/components/trade/types";
import { useCart } from "@/hooks/use-cart";
import { MAIL_ATTACHMENT_BUDGET, formatBytes, photoBudget } from "@/lib/limits";
import type { Cap } from "@/lib/types";
import { submitTradeRequest } from "@/server/actions";

export function TradeForm({ caps, wishlist }: { caps: Cap[]; wishlist: Cap[] }) {
  const cart = useCart();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [offers, setOffers] = useState<Record<string, Offer>>({});
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const marked = useMemo(
    () =>
      cart.items
        .map((id) => caps.find((cap) => String(cap.id) === id))
        .filter((cap) => cap !== undefined),
    [cart.items, caps],
  );

  /*
   * Photos are attached to the notification e-mail, which is capped as a whole
   * message — so the allowance per photo depends on how many are attached.
   * Computed here and shown on every card, matching the server's own check.
   */
  const photoCount = useMemo(
    () => Object.values(offers).filter((offer) => offer.file).length,
    [offers],
  );
  const photoLimit = photoBudget(Math.max(1, photoCount));

  /* Collect photo object URLs so they can be revoked when the page unmounts. */
  const previewUrls = useRef<Set<string>>(new Set());
  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  function patchOffer(id: number, patch: Partial<Offer>) {
    if (patch.preview) previewUrls.current.add(patch.preview);
    setOffers((current) => ({
      ...current,
      [id]: { ...emptyOffer, ...current[id], ...patch },
    }));
    setStatus(null);
  }

  /** Checks that can be made without a round trip. */
  function validate() {
    if (!name.trim() || !contact.trim())
      return "Add your name and a way to reach you first.";

    const missingTarget = marked.find((cap) => !offers[cap.id]?.target);
    if (missingTarget)
      return `Choose what you would trade for “${missingTarget.name}”.`;

    /* A Cap row cannot be written without these, so they are asked for here
       rather than left for Filip to chase up by e-mail. */
    for (const cap of marked) {
      const offer = offers[cap.id];
      if (offer?.target !== "other") continue;
      const missing = offeredCapFields.find(
        (field) => field.required && !offer[field.key].trim(),
      );
      if (missing)
        return `Add the ${missing.label.toLowerCase()} of the cap you are offering for “${cap.name}”.`;
    }

    const files = marked
      .map((cap) => ({ cap, file: offers[cap.id]?.file }))
      .filter((entry): entry is { cap: Cap; file: File } => Boolean(entry.file));

    const tooBig = files.find((entry) => entry.file.size > photoLimit);
    if (tooBig)
      return (
        `The photo for “${tooBig.cap.name}” is ${formatBytes(tooBig.file.size)} — ` +
        `with ${files.length} photo${files.length === 1 ? "" : "s"} attached the limit is ` +
        `${formatBytes(photoLimit)} each.`
      );

    const total = files.reduce((sum, entry) => sum + entry.file.size, 0);
    if (total > MAIL_ATTACHMENT_BUDGET)
      return (
        `Your photos come to ${formatBytes(total)} together — ` +
        `${formatBytes(MAIL_ATTACHMENT_BUDGET)} is the most one request can carry.`
      );

    return "";
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const problem = validate();
    if (problem) {
      setStatus({ ok: false, message: problem });
      return;
    }

    const data = new FormData();
    data.set("name", name.trim());
    data.set("contact", contact.trim());
    data.set(
      "items",
      JSON.stringify(
        marked.map((cap) => {
          const offer = offers[cap.id] ?? emptyOffer;
          return {
            capId: cap.id,
            target: offer.target,
            note: offer.note,
            /* Only meaningful for "other"; the server ignores them otherwise. */
            offered: Object.fromEntries(
              offeredCapFields.map((field) => [field.key, offer[field.key]]),
            ),
          };
        }),
      ),
    );
    marked.forEach((cap) => {
      const file = offers[cap.id]?.file;
      if (file) data.set(`photo-${cap.id}`, file);
    });

    startTransition(async () => {
      const result = await submitTradeRequest(null, data);
      setStatus(result);
      if (result.ok) {
        cart.clear();
        setOffers({});
        setName("");
        setContact("");
      }
    });
  }

  const message = status
    ? status.message
    : marked.length === 0
      ? "Mark at least one cap first."
      : "You can edit anything before sending.";

  return (
    <form
      onSubmit={handleSubmit}
      className="wrap flex-1 pb-20 pt-11"
      style={{ maxWidth: 980 }}
    >
      <PageHeader kicker="Correspondence" title="Trade with me" />
      <p className="dim mt-4 max-w-[52ch] text-base leading-relaxed">
        Leave your name and a way to reach you, then say what you’d offer for each
        cap you’ve marked. Every request gets an answer within a week.
      </p>

      <div className="mt-9 grid gap-7 sm:grid-cols-2">
        <Field id="trade-name" label="Your name">
          <input
            id="trade-name"
            name="name"
            className="input"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field id="trade-contact" label="Email or phone">
          <input
            id="trade-contact"
            name="contact"
            className="input"
            placeholder="you@mail.com  /  +62…"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-11">
        <SectionHeading
          title={`Caps you want (${marked.length})`}
          action={{ label: "Add more", href: "/collection" }}
        />
      </div>

      {marked.length === 0 ? (
        <div className="frame p-11 text-center" style={{ borderStyle: "dashed" }}>
          <p className="dim mb-4">Nothing marked yet.</p>
          <Link href="/collection" className="btn">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {marked.map((cap) => (
            <TradeOfferCard
              key={cap.id}
              cap={cap}
              offer={offers[cap.id] ?? emptyOffer}
              wishlist={wishlist}
              photoLimit={photoLimit}
              onChange={(patch) => patchOffer(cap.id, patch)}
              onRemove={() => cart.remove(String(cap.id))}
            />
          ))}
        </div>
      )}

      <div className="mt-9 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          className="btn solid"
          style={{ padding: "16px 32px" }}
          disabled={marked.length === 0 || pending}
        >
          {pending ? "Sending…" : "Offer trade"}
        </button>
        <span
          className="ovr"
          style={{
            color: status?.ok
              ? "var(--accent-strong)"
              : "color-mix(in srgb, var(--fg) 62%, transparent)",
          }}
        >
          {message}
        </span>
      </div>
    </form>
  );
}
