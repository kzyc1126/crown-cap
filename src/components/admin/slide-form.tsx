"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui";
import type { GallerySlide } from "@/lib/types";
import { saveSlide, type ActionResult } from "@/server/actions";

/** Add or edit one home page slideshow slide. */
export function SlideForm({
  slide,
  position,
}: {
  slide?: GallerySlide;
  /** suggested position when adding a new slide */
  position?: number;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveSlide,
    null,
  );

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <input type="hidden" name="image" value={slide?.image ?? ""} />

      <Field id={`caption-${slide?.id ?? "new"}`} label="Caption">
        <input
          id={`caption-${slide?.id ?? "new"}`}
          name="caption"
          className="input"
          defaultValue={slide?.caption}
          placeholder="Collection wall"
        />
      </Field>

      <Field id={`position-${slide?.id ?? "new"}`} label="Order">
        <input
          id={`position-${slide?.id ?? "new"}`}
          name="position"
          type="number"
          className="input sm:w-24"
          defaultValue={slide?.position ?? position ?? 0}
        />
      </Field>

      <Field id={`photo-${slide?.id ?? "new"}`} label="Photo">
        <input
          id={`photo-${slide?.id ?? "new"}`}
          name="photo"
          type="file"
          accept="image/*"
          className="input"
        />
      </Field>

      <div className="sm:col-span-3 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Saving…" : slide ? "Save slide" : "Add slide"}
        </button>
        {state ? (
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
