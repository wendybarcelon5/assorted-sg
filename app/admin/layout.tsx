import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0F172A]">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Content */}

      <div className="lg:ml-72">

        {/* Header */}

        <Header />

        {/* Page */}

        <main className="p-6 md:p-8">

          {children}

        </main>

      </div>

    </div>
  );
}