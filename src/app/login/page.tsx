import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default function LoginPage() {
  return (
    <main className="wrap flex flex-1 items-center justify-center py-16">
      <div className="frame w-full max-w-[400px] p-8 sm:p-10">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        <span className="ovr" style={{ color: "var(--accent-strong)" }}>
          Filip’s Caps
        </span>
        <h1 className="mt-2 text-[30px]">Admin sign in</h1>
        <p className="dim mt-2 text-[15px] leading-relaxed">
          The catalogue manager is private. Enter the admin credentials to continue.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <Link href="/" className="ovr dimmer mt-7 inline-block">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
