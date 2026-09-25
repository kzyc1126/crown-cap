import Link from "next/link";
import { CapForm } from "@/components/admin";

export const metadata = { title: "Add a cap" };

export default function NewCapPage() {
  return (
    <div className="grid gap-6">
      <Link href="/admin/caps" className="ovr">
        ← All caps
      </Link>
      <h2 className="text-[28px]">Add a cap</h2>
      <CapForm />
    </div>
  );
}
