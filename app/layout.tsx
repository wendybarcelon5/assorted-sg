import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?redirect=/admin");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Admin profile lookup failed:",
      profileError
    );

    redirect("/login?error=profile-access");
  }

  const normalizedRole =
    typeof profile?.role === "string"
      ? profile.role.trim().toLowerCase()
      : "";

  if (
    normalizedRole !== "admin" &&
    normalizedRole !== "administrator"
  ) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Sidebar />

      <div className="lg:ml-72">
        <Header />

        <main className="min-h-screen bg-[#0B1120] p-6 text-white md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}