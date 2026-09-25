import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CapDetail } from "@/components/caps";
import { getCapById } from "@/server/queries";

export async function generateMetadata({
  params,
}: PageProps<"/caps/[id]">): Promise<Metadata> {
  const { id } = await params;
  const cap = await getCapById(Number(id));
  return { title: cap ? `${cap.name} · ${cap.ref}` : "Cap not found" };
}

export default async function CapPage({
  params,
  searchParams,
}: PageProps<"/caps/[id]">) {
  const { id } = await params;
  const cap = await getCapById(Number(id));
  if (!cap) notFound();

  const { from } = await searchParams;
  const origin = from === "wishlist" || cap.wish ? "wishlist" : "collection";

  return <CapDetail cap={cap} from={origin} />;
}
