"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui";
import { importCaps, type ActionResult } from "@/server/actions";

const sample = `name,brewery,country,liner type,year,copies
Bintang Pilsener,PT Multi Bintang,Indonesia,Cork,1974,3
Chimay Bleue,Bières de Chimay,Belgium,Printed PVC,1998,1`;

/** Upload or paste a CSV and push the rows straight into the database. */
export function ImportForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    importCaps,
    null,
  );

  return (
    <form action={action} className="grid max-w-3xl gap-6">
      <Field id="file" label="CSV file">
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          className="input"
        />
      </Field>

      <Field id="payload" label="…or paste the CSV here">
        <textarea
          id="payload"
          name="payload"
          rows={12}
          className="input resize-y"
          placeholder={sample}
          style={{ fontFamily: "var(--font-plex-mono), monospace", fontSize: 13 }}
        />
      </Field>

      <Field id="target" label="Import into">
        <select id="target" name="target" className="input sm:w-64">
          <option value="collection">My collection</option>
          <option value="wishlist">My wishlist</option>
        </select>
      </Field>

      <label className="ovr flex items-center gap-3">
        <input type="checkbox" name="replace" className="h-4 w-4" />
        Replace everything already in that list
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn solid" disabled={pending}>
          {pending ? "Importing…" : "Import caps"}
        </button>
        {state ? (
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {state.message}
          </span>
        ) : null}
      </div>

      <div className="dim text-[13px] leading-relaxed">
        <p className="m-0">
          First row must be the header. Recognised columns (comma, semicolon or tab
          separated):
        </p>
        <p className="m-0 mt-2">
          <strong>name</strong> (or cap, title) · <strong>brewery</strong> (or
          product, producer) · <strong>country</strong> · <strong>liner type</strong>{" "}
          (or liner) · <strong>year</strong> · <strong>copies</strong> (or quantity)
          · <strong>image</strong> (or photo). Rows without a name and a country are
          skipped. Catalogue references are generated automatically.
        </p>
      </div>
    </form>
  );
}
