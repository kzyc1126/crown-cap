"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui";
import type { SiteSetting } from "@/lib/types";
import { saveSettings, type ActionResult } from "@/server/actions";

/** Only what cannot be counted: the site name and the starting year. */
export function SettingsForm({ settings }: { settings: SiteSetting }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={action} className="grid max-w-3xl gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="ownerName" label="Site name">
          <input
            id="ownerName"
            name="ownerName"
            className="input"
            defaultValue={settings.ownerName}
          />
        </Field>
        <Field id="startYear" label="Collecting since">
          <input
            id="startYear"
            name="startYear"
            type="number"
            className="input"
            defaultValue={settings.startYear}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn solid" disabled={pending}>
          {pending ? "Saving…" : "Save"}
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
