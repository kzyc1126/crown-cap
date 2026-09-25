"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminToken } from "@/lib/admin-auth";

export type LoginState = { error: string | null };

/** Only allow redirecting back to an in-app admin path, never an open redirect. */
function safeTarget(from: FormDataEntryValue | null): string {
  const value = typeof from === "string" ? from : "";
  return value.startsWith("/admin") ? value : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username");
  const password = formData.get("password");

  const ok =
    username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD;

  if (!ok) {
    return { error: "Wrong username or password." };
  }

  const token = await adminToken();
  if (!token) {
    return { error: "Admin login is not configured on the server." };
  }

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // one week
  });

  redirect(safeTarget(formData.get("from")));
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/login");
}
