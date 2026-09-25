import Link from "next/link";
import { AdminNav } from "@/components/admin";
import { getAdminStats } from "@/server/queries";
import { logout } from "@/app/login/actions";

export const metadata = { title: "Admin" };

/** The admin always reads live rows — never a cached render. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const stats = await getAdminStats();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line">
        <div className="wrap flex flex-wrap items-center gap-4 py-5">
          <div>
            <span className="ovr" style={{ color: "var(--accent-strong)" }}>
              Admin
            </span>
            <h1 className="mt-1 text-[30px]">Catalogue manager</h1>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link href="/" className="btn quiet">
              View site
            </Link>
            <form action={logout}>
              <button type="submit" className="btn quiet">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="wrap pb-5">
          <AdminNav newRequests={stats.newRequests} />
        </div>
      </header>

      <main className="wrap flex-1 py-9">{children}</main>
    </div>
  );
}
