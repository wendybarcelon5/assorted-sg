import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-800 bg-[#111] p-8">

        <h1 className="text-3xl font-black text-red-600">
          ASSORTED SG
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Admin Panel
        </p>

        <nav className="mt-12 space-y-4">

          <Link href="/admin" className="block hover:text-red-500">
            📊 Dashboard
          </Link>

          <Link href="/admin/products" className="block hover:text-red-500">
            📦 Products
          </Link>

          <Link href="/admin/orders" className="block hover:text-red-500">
            📋 Orders
          </Link>

          <Link href="/admin/customers" className="block hover:text-red-500">
            👥 Customers
          </Link>

          <Link href="/admin/reports" className="block hover:text-red-500">
            📈 Reports
          </Link>

          <Link href="/admin/settings" className="block hover:text-red-500">
            ⚙ Settings
          </Link>

        </nav>

      </aside>

      {/* Page Content */}
      <section className="flex-1 p-10">
        {children}
      </section>

    </main>
  );
}