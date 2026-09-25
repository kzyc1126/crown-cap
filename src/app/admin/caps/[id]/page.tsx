import Link from "next/link";
import { notFound } from "next/navigation";
import { CapForm, ConfirmButton } from "@/components/admin";
import { deleteCap } from "@/server/actions";
import { getCapById } from "@/server/queries";

export async function generateMetadata({ params }: PageProps<"/admin/caps/[id]">) {
  const { id } = await params;
  const cap = await getCapById(Number(id));
  return { title: cap ? `Edit ${cap.name}` : "Cap not found" };
}

export default async function EditCapPage({ params }: PageProps<"/admin/caps/[id]">) {
  const { id } = await params;
  const cap = await getCapById(Number(id));
  if (!cap) notFound();

  return (
    <div className="grid gap-6">
      <Link href="/admin/caps" className="ovr">
        ← All caps
      </Link>

      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="text-[28px]">{cap.name}</h2>
        <span className="ovr dimmer">{cap.ref}</span>
        <Link href={`/caps/${cap.id}`} className="ovr ml-auto">
          View on site →
        </Link>
      </div>

      <CapForm cap={cap} />

      <form action={deleteCap} className="border-t border-line pt-6">
        <input type="hidden" name="id" value={cap.id} />
        <ConfirmButton label="Delete this cap" />
      </form>
    </div>
  );
}
