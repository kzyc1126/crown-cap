/** Page header: small kicker, large title and a short note. */
export function PageHeader({
  kicker,
  title,
  note,
}: {
  kicker: string;
  title: string;
  note?: string;
}) {
  return (
    <>
      <span className="ovr" style={{ color: "var(--accent-strong)" }}>
        {kicker}
      </span>
      <div className="mt-3 flex flex-wrap items-end gap-7">
        <h1 style={{ fontSize: "clamp(40px,6vw,64px)" }}>{title}</h1>
        {note ? (
          <p className="dim mb-2 max-w-[42ch] text-[15px] leading-relaxed">{note}</p>
        ) : null}
      </div>
    </>
  );
}
