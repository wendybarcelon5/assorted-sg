import DashboardStats from "@/components/admin/DashboardStats";

export default function AdminDashboard() {
  return (
    <main className="admin-page space-y-8">

      {/* Welcome */}

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#111827] p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-red-500 hover:shadow-red-600/20">

        <h1 className="text-4xl font-extrabold tracking-wide text-white md:text-5xl">
          Dashboard
        </h1>

        <p className="mt-3 text-lg text-gray-200">
          Welcome back,
          <span className="font-bold text-[#D4AF37]">
            {" "}Wendy
          </span>
          👋
        </p>

       <p className="text-base font-semibold uppercase tracking-wider text-gray-300">
          Here's what's happening with your store today.
        </p>

      </div>

      {/* Statistics */}

      <DashboardStats />

            {/* Recent Orders */}

      <div className="rounded-3xl border border-white/10 bg-[#1E293B] p-8 shadow-xl">

        <h2 className="mt-2 text-4xl font-extrabold text-white">
          Recent Orders
        </h2>

        <p className="mt-3 text-gray-300">
          Customer orders will appear here.
        </p>

      </div>

    </main>
  );
}