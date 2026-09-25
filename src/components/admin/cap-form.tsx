"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui";
import type { Cap } from "@/lib/types";
import { saveCap, type ActionResult } from "@/server/actions";

/** Create or edit one cap. Leave `cap` undefined to create. */
export function CapForm({ cap }: { cap?: Cap }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveCap,
    null,
  );

  return (
    <form action={action} className="grid max-w-3xl gap-6">
      {cap ? <input type="hidden" name="id" value={cap.id} /> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name">
          <input
            id="name"
            name="name"
            className="input"
            defaultValue={cap?.name}
            placeholder="Bintang Pilsener"
            required
          />
        </Field>
        <Field id="brewery" label="Product / brewery">
          <input
            id="brewery"
            name="brewery"
            className="input"
            defaultValue={cap?.brewery}
            placeholder="PT Multi Bintang"
            required
          />
        </Field>
        <Field id="country" label="Country">
          <input
            id="country"
            name="country"
            className="input"
            defaultValue={cap?.country}
            placeholder="Indonesia"
            required
          />
        </Field>
        <Field id="liner" label="Liner type">
          <input
            id="liner"
            name="liner"
            className="input"
            defaultValue={cap?.liner}
            placeholder="Cork / PVC / Metal"
          />
        </Field>
        <Field id="year" label="Year">
          <input
            id="year"
            name="year"
            type="number"
            className="input"
            defaultValue={cap?.year ?? ""}
            placeholder="Undated"
          />
        </Field>
        <Field id="copies" label="Copies owned">
          <input
            id="copies"
            name="copies"
            type="number"
            min={0}
            className="input"
            defaultValue={cap?.copies ?? 1}
          />
        </Field>
        <Field id="paletteIndex" label="Disc colour (0–7)">
          <input
            id="paletteIndex"
            name="paletteIndex"
            type="number"
            min={0}
            max={7}
            className="input"
            defaultValue={cap?.paletteIndex ?? 0}
          />
        </Field>
        <Field id="image" label="Photo path">
          <input
            id="image"
            name="image"
            className="input"
            defaultValue={cap?.image ?? ""}
            placeholder="/caps/bintang.jpg"
          />
        </Field>
      </div>

      <Field id="photo" label="…or upload a photo">
        <input id="photo" name="photo" type="file" accept="image/*" className="input" />
      </Field>

      <Field id="notes" label="Notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="input resize-y"
          defaultValue={cap?.notes ?? ""}
          placeholder="Anything worth remembering about this cap…"
        />
      </Field>

      <label className="ovr flex items-center gap-3">
        <input
          type="checkbox"
          name="wish"
          defaultChecked={cap?.wish ?? false}
          className="h-4 w-4"
        />
        Wishlist item (not owned yet)
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn solid" disabled={pending}>
          {pending ? "Saving…" : cap ? "Save changes" : "Add cap"}
        </button>
        {state && !state.ok ? (
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
