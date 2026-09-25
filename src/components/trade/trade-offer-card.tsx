"use client";

import Image from "next/image";
import { CapDisc } from "@/components/caps/cap-disc";
import { Field, Frame, IconButton } from "@/components/ui";
import { formatYear } from "@/lib/format";
import { formatBytes } from "@/lib/limits";
import type { Cap } from "@/lib/types";
import { offeredCapFields, type Offer } from "./types";

/** One card: the cap being asked for, and what is offered in return. */
export function TradeOfferCard({
  cap,
  offer,
  wishlist,
  photoLimit,
  onChange,
  onRemove,
}: {
  cap: Cap;
  offer: Offer;
  wishlist: Cap[];
  /** bytes this photo may weigh — shrinks as more photos are added */
  photoLimit: number;
  onChange: (patch: Partial<Offer>) => void;
  onRemove: () => void;
}) {
  return (
    <Frame className="p-5">
      <div className="flex items-center gap-4">
        <CapDisc cap={cap} size={66} />
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
            {cap.name}
          </div>
          <div className="ovr dimmer mt-1" style={{ fontSize: 10 }}>
            {cap.country} · {cap.liner} · {formatYear(cap.year)}
          </div>
        </div>
        <IconButton label={`Remove ${cap.name}`} onClick={onRemove} />
      </div>

      <Field id={`target-${cap.id}`} label="Trade with" className="mt-5">
        <select
          id={`target-${cap.id}`}
          className="input"
          value={offer.target}
          onChange={(event) => onChange({ target: event.target.value })}
        >
          <option value="">— choose a cap —</option>
          {wishlist.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.country}
            </option>
          ))}
          <option value="other">Other (not on my wishlist)</option>
        </select>
      </Field>

      {offer.target === "other" ? (
        <div className="mt-4 grid gap-4">
          <p className="ovr dimmer m-0">Tell me about your cap</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {offeredCapFields.map((field) => (
              <Field
                key={field.key}
                id={`${field.key}-${cap.id}`}
                label={field.required ? `${field.label} *` : field.label}
              >
                <input
                  id={`${field.key}-${cap.id}`}
                  type={field.type ?? "text"}
                  className="input"
                  placeholder={field.placeholder}
                  value={offer[field.key]}
                  onChange={(event) =>
                    onChange({ [field.key]: event.target.value })
                  }
                />
              </Field>
            ))}
          </div>

          <Field id={`note-${cap.id}`} label="Anything else">
            <textarea
              id={`note-${cap.id}`}
              rows={2}
              className="input resize-y"
              placeholder="Condition, how you came by it…"
              value={offer.note}
              onChange={(event) => onChange({ note: event.target.value })}
            />
          </Field>

          <label
            className="ovr flex cursor-pointer items-center justify-center gap-2.5 p-4 text-center"
            style={{
              border: "1px dashed var(--accent-mid)",
              color: "var(--accent-strong)",
            }}
          >
            {offer.fileName || `Upload a photo · max ${formatBytes(photoLimit)}`}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (offer.preview) URL.revokeObjectURL(offer.preview);
                onChange({
                  file,
                  fileName: file.name,
                  preview: URL.createObjectURL(file),
                });
              }}
            />
          </label>

          {offer.file && offer.file.size > photoLimit ? (
            <p
              className="ovr m-0"
              style={{ color: "var(--accent-strong)", fontSize: 10 }}
            >
              {formatBytes(offer.file.size)} — over the {formatBytes(photoLimit)} limit
            </p>
          ) : null}

          {offer.preview ? (
            <div className="relative h-32 w-32 overflow-hidden border border-line">
              <Image
                src={offer.preview}
                alt={offer.fileName}
                fill
                sizes="128px"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </Frame>
  );
}
