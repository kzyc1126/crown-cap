"use client";

import Link from "next/link";
import { memo, useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  type ActionResult,
  type CapRowInput,
  deleteCap,
  saveCapRows,
  updateCapImage,
} from "@/server/actions";
import { ConfirmButton } from "./confirm-button";

/** The columns the admin table shows — a slice of Cap that survives the wire. */
export type CapRow = CapRowInput & { ref: string; image: string | null };

type Edit = Partial<Omit<CapRow, "id" | "ref">>;

const FIRST_YEAR = 1850;
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - FIRST_YEAR + 1 }, (_, i) =>
  String(THIS_YEAR - i),
);

const same = (a: CapRow, b: CapRow) =>
  a.name === b.name &&
  a.brewery === b.brewery &&
  a.country === b.country &&
  a.liner === b.liner &&
  a.year === b.year &&
  a.copies === b.copies &&
  a.wish === b.wish;

/**
 * The admin caps table, edited in place. Each cell is a control; rows that
 * differ from what was loaded are marked, and one Save writes them all.
 */
export function CapTable({
  caps,
  countries,
  liners,
}: {
  caps: CapRow[];
  countries: string[];
  liners: string[];
}) {
  const [edits, setEdits] = useState<Map<number, Edit>>(() => new Map());

  const [state, save, saving] = useActionState<ActionResult | null, FormData>(
    async (prev, data) => {
      const result = await saveCapRows(prev, data);
      if (result.ok) setEdits(new Map());
      return result;
    },
    null,
  );

  const changed: CapRowInput[] = [];
  for (const cap of caps) {
    const edit = edits.get(cap.id);
    if (!edit) continue;
    const edited: CapRow = { ...cap, ...edit };
    if (same(cap, edited)) continue;
    changed.push({
      id: edited.id,
      name: edited.name,
      brewery: edited.brewery,
      country: edited.country,
      liner: edited.liner,
      year: edited.year,
      copies: edited.copies,
      wish: edited.wish,
    });
  }

  /* Leaving the page with unsaved rows gets the browser's own warning. */
  useEffect(() => {
    if (changed.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed.length]);

  /* Stable, so a keystroke in one row re-renders that row only. */
  const onChange = useCallback((id: number, patch: Edit) => {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id), ...patch });
      return next;
    });
  }, []);

  return (
    <div className="grid gap-4">
      <form
        action={save}
        className="flex flex-wrap items-center gap-4"
        style={{ minHeight: 44 }}
      >
        <input type="hidden" name="rows" value={JSON.stringify(changed)} />
        <button
          type="submit"
          className="btn solid"
          disabled={saving || changed.length === 0}
        >
          {saving
            ? "Saving…"
            : changed.length === 0
              ? "Save changes"
              : `Save ${changed.length} change${changed.length === 1 ? "" : "s"}`}
        </button>
        {changed.length > 0 ? (
          <button
            type="button"
            className="btn quiet"
            disabled={saving}
            onClick={() => setEdits(new Map())}
          >
            Discard
          </button>
        ) : null}
        {state && (!state.ok || changed.length === 0) ? (
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {state.message}
          </span>
        ) : null}
      </form>

      <div className="border border-line">
        <table className="table edit-table">
          <colgroup>
            <col style={{ width: 56 }} />
            <col style={{ width: 88 }} />
            <col />
            <col />
            <col style={{ width: 150 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 104 }} />
            <col style={{ width: 84 }} />
            <col style={{ width: 124 }} />
            <col style={{ width: 96 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Ref</th>
              <th>Name</th>
              <th>Product</th>
              <th>Country</th>
              <th>Liner</th>
              <th>Year</th>
              <th>Copies</th>
              <th>List</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {caps.map((cap) => (
              <Row
                key={cap.id}
                cap={cap}
                edit={edits.get(cap.id)}
                countries={countries}
                liners={liners}
                onChange={onChange}
              />
            ))}
          </tbody>
        </table>

        {caps.length === 0 ? (
          <p className="dim p-6 text-center">No caps match that search.</p>
        ) : null}
      </div>
    </div>
  );
}

const Row = memo(function Row({
  cap,
  edit,
  countries,
  liners,
  onChange,
}: {
  cap: CapRow;
  edit: Edit | undefined;
  countries: string[];
  liners: string[];
  onChange: (id: number, patch: Edit) => void;
}) {
  const edited: CapRow = { ...cap, ...edit };
  const dirty = !same(cap, edited);
  const set = (patch: Edit) => onChange(cap.id, patch);

  return (
    <tr style={dirty ? { background: "var(--accent-soft)" } : undefined}>
      <td>
        <ImageCell cap={cap} />
      </td>
      <td className="ovr dimmer whitespace-nowrap">
        <Link href={`/admin/caps/${cap.id}`} title="Open the full edit form">
          {cap.ref}
        </Link>
      </td>
      <td>
        <input
          aria-label="Name"
          className="input"
          value={edited.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </td>
      <td>
        <input
          aria-label="Product / brewery"
          className="input"
          value={edited.brewery}
          onChange={(e) => set({ brewery: e.target.value })}
        />
      </td>
      <td>
        <LazySelect
          label="Country"
          options={countries}
          value={edited.country}
          onChange={(country) => set({ country })}
        />
      </td>
      <td>
        <LazySelect
          label="Liner"
          options={liners}
          value={edited.liner}
          onChange={(liner) => set({ liner })}
        />
      </td>
      <td>
        <LazySelect
          label="Year"
          options={YEARS}
          value={edited.year === null ? "" : String(edited.year)}
          blank="Undated"
          onChange={(year) => set({ year: year ? Number(year) : null })}
        />
      </td>
      <td>
        <input
          aria-label="Copies"
          type="number"
          min={0}
          step={1}
          className="input"
          disabled={edited.wish}
          value={edited.wish ? "" : edited.copies}
          onChange={(e) =>
            set({ copies: Math.max(0, Math.floor(Number(e.target.value) || 0)) })
          }
        />
      </td>
      <td>
        <select
          aria-label="List"
          className="input"
          value={edited.wish ? "wishlist" : "collection"}
          onChange={(e) => {
            const wish = e.target.value === "wishlist";
            set({ wish, copies: wish ? 0 : Math.max(1, edited.copies) });
          }}
        >
          <option value="collection">Collection</option>
          <option value="wishlist">Wishlist</option>
        </select>
      </td>
      <td>
        <form action={deleteCap} className="flex justify-end">
          <input type="hidden" name="id" value={cap.id} />
          <ConfirmButton className="px-3" />
        </form>
      </td>
    </tr>
  );
});

/** Thumbnail plus one-click photo replace, straight from the table row. */
function ImageCell({ cap }: { cap: CapRow }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, data) => updateCapImage(data),
    null,
  );
  const failed = state !== null && !state.ok;

  return (
    <form ref={formRef} action={action} className="flex items-center justify-center">
      <input type="hidden" name="id" value={cap.id} />
      <label
        className="cursor-pointer"
        title={failed ? state.message : cap.image ? "Change photo" : "Upload a photo"}
        style={{ opacity: pending ? 0.5 : 1, display: "block" }}
      >
        {cap.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cap.image}
            alt=""
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              background: "var(--surface)",
              borderRadius: 8,
              outline: failed ? "1px solid var(--accent-strong)" : "none",
            }}
          />
        ) : (
          <span
            className="ovr dimmer"
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              border: `1px dashed ${failed ? "var(--accent-strong)" : "var(--line)"}`,
              borderRadius: 8,
            }}
          >
            +
          </span>
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          hidden
          onChange={(event) => {
            if (event.target.files?.length) formRef.current?.requestSubmit();
          }}
        />
      </label>
    </form>
  );
}

/**
 * A select that lists only its current value until it is opened. Hundreds of
 * rows each carrying every country and every year is what made the table
 * crawl; this way the full list exists only in the select being used.
 */
function LazySelect({
  label,
  options,
  value,
  blank,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  /** label for the empty option; omit to have no empty option */
  blank?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const expand = () => {
    if (!open) setOpen(true);
  };

  const listed = open ? (options.includes(value) || value === "" ? options : [value, ...options]) : [value];

  return (
    <select
      aria-label={label}
      className="input"
      value={value}
      onMouseDown={expand}
      onFocus={expand}
      onKeyDown={expand}
      onTouchStart={expand}
      onChange={(e) => onChange(e.target.value)}
    >
      {blank !== undefined ? <option value="">{blank}</option> : null}
      {listed.map((option) =>
        option === "" ? null : (
          <option key={option} value={option}>
            {option}
          </option>
        ),
      )}
    </select>
  );
}
