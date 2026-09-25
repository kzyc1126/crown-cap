import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap flex flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="ovr" style={{ color: "var(--accent-strong)" }}>
        404
      </span>
      <h1 style={{ fontSize: "clamp(36px,6vw,60px)" }}>Cap not found</h1>
      <Link href="/collection" className="btn">
        Back to the collection
      </Link>
    </div>
  );
}
