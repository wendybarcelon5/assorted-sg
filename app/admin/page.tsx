import DashboardStats from "@/components/admin/DashboardStats";
import RevenueChart from "@/components/admin/RevenueChart";
import OrdersChart from "@/components/admin/OrdersChart";
import RecentOrders from "@/components/admin/RecentOrders";
import RecentNotifications from "@/components/admin/RecentNotifications";
import BestSellingProducts from "@/components/admin/BestSellingProducts";
import LowStockProducts from "@/components/admin/LowStockProducts";

export default function AdminDashboard() {
  return (
    <main className="admin-page space-y-8">

      {/* Welcome */}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#111827] p-8 shadow-xl">

        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
          Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
          Good Evening, Assorted SG 👋
        </h1>

        <p className="mt-3 max-w-3xl text-gray-300">
          Welcome back. Here's a quick overview of your store's
          performance, recent orders, inventory, and customer activity.
        </p>

      </section>

      {/* Statistics */}

      <DashboardStats />

      {/* Charts */}

      <section className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <RevenueChart />
        </div>

        <div>
          <OrdersChart />
        </div>

      </section>

      {/* Orders + Notifications */}

      <section className="grid gap-6 xl:grid-cols-2">

        <RecentOrders />

        <RecentNotifications />

      </section>

      {/* Products */}

      <section className="grid gap-6 xl:grid-cols-2">

        <BestSellingProducts />

        <LowStockProducts />

      </section>

    </main>
  );
}