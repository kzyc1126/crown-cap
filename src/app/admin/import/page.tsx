import { ImportForm } from "@/components/admin";

export const metadata = { title: "Import" };

export default function AdminImportPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-[28px]">Bulk import</h2>
        <p className="dim mt-2 max-w-[60ch] text-[15px] leading-relaxed">
          Upload the CSV from the crowncaps.info scrape — or any spreadsheet export —
          to add many caps at once. Catalogue references are generated automatically.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
