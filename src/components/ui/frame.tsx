import { cn } from "@/lib/utils";

/**
 * A hairline box with "+" registration marks in all four corners
 * (the marks disappear in the Plate style through the --corner-show token).
 */
export function Frame({
  as: Tag = "div",
  className,
  style,
  children,
}: {
  as?: "div" | "section" | "article";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn("frame", className)} style={style}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      {children}
    </Tag>
  );
}
