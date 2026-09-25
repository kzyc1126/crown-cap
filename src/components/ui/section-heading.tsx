import Link from "next/link";

/** Section heading: title, a dividing rule, then a link at the far right. */
export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-5 flex items-baseline gap-4.5">
      <h2 className="text-[30px]">{title}</h2>
      <span className="rule" />
      {action ? (
        <Link href={action.href} className="ovr">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
