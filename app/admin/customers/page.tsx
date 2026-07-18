"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

import CustomerDetailsModal from "./components/CustomerDetailsModal";
import CustomerFilters from "./components/CustomerFilters";
import CustomerStats from "./components/CustomerStats";
import CustomerTable from "./components/CustomerTable";
import CustomersHeader from "./components/CustomersHeader";

import {
  Customer,
  CustomerFilter,
  CustomerOrder,
  CustomerSort,
  CustomerStatus,
} from "./components/types";

import {
  filterCustomers,
  getCustomerSummary,
  isSuccessfulOrder,
  sortCustomers,
} from "./components/utils";

type OrderRow = {
  id?: string | number | null;
  created_at?: string | null;
  status?: string | null;
  total?: number | string | null;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  items?: unknown;
  order_items?: unknown;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeTotal(value: unknown) {
  const total = Number(value ?? 0);

  return Number.isFinite(total) ? total : 0;
}

function getTime(date?: string | null) {
  if (!date) {
    return 0;
  }

  const time = new Date(date).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function getCustomerStatus(
  totalOrders: number,
  firstOrderDate: string | null,
  lastOrderDate: string | null
): CustomerStatus {
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  const firstOrderTime = getTime(firstOrderDate);
  const lastOrderTime = getTime(lastOrderDate);

  if (
    totalOrders === 1 &&
    firstOrderTime > 0 &&
    now - firstOrderTime <= thirtyDays
  ) {
    return "new";
  }

  if (totalOrders >= 2) {
    return "returning";
  }

  if (
    lastOrderTime > 0 &&
    now - lastOrderTime <= ninetyDays
  ) {
    return "active";
  }

  return "inactive";
}

function createCustomerId(
  email: string,
  phone: string,
  name: string
) {
  return (
    email.toLowerCase() ||
    phone.replace(/\s+/g, "") ||
    name.toLowerCase().replace(/\s+/g, "-")
  );
}

function buildCustomers(rows: OrderRow[]) {
  const customerGroups = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      orders: CustomerOrder[];
    }
  >();

  rows.forEach((row, index) => {
    const name =
      normalizeText(row.customer_name) ||
      normalizeText(row.name) ||
      "Guest Customer";

    const email =
      normalizeText(row.customer_email) ||
      normalizeText(row.email);

    const phone =
      normalizeText(row.customer_phone) ||
      normalizeText(row.phone);

    const customerId = createCustomerId(
      email,
      phone,
      name
    );

    const groupKey =
      customerId || `guest-customer-${index}`;

    const order: CustomerOrder = {
      id: row.id ?? `order-${index + 1}`,
      created_at: row.created_at ?? null,
      status: row.status ?? null,
      total: normalizeTotal(row.total),
      payment_method: row.payment_method ?? null,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      items: row.items,
      order_items: row.order_items,
    };

    const existingCustomer =
      customerGroups.get(groupKey);

    if (existingCustomer) {
      existingCustomer.orders.push(order);

      if (
        existingCustomer.name === "Guest Customer" &&
        name !== "Guest Customer"
      ) {
        existingCustomer.name = name;
      }

      if (!existingCustomer.email && email) {
        existingCustomer.email = email;
      }

      if (!existingCustomer.phone && phone) {
        existingCustomer.phone = phone;
      }

      return;
    }

    customerGroups.set(groupKey, {
      name,
      email,
      phone,
      orders: [order],
    });
  });

  return Array.from(customerGroups.entries()).map(
    ([id, group]): Customer => {
      const orders = [...group.orders].sort(
        (a, b) =>
          getTime(b.created_at) -
          getTime(a.created_at)
      );

      const successfulOrders = orders.filter(
        isSuccessfulOrder
      );

      const totalSpent = successfulOrders.reduce(
        (sum, order) =>
          sum + normalizeTotal(order.total),
        0
      );

      const averageOrderValue =
        successfulOrders.length > 0
          ? totalSpent / successfulOrders.length
          : 0;

      const orderDates = orders
        .map((order) => order.created_at)
        .filter(
          (date): date is string =>
            Boolean(date) && getTime(date) > 0
        )
        .sort(
          (a, b) => getTime(a) - getTime(b)
        );

      const firstOrderDate =
        orderDates[0] ?? null;

      const lastOrderDate =
        orderDates[orderDates.length - 1] ?? null;

      return {
        id,
        name: group.name,
        email: group.email,
        phone: group.phone,
        totalOrders: orders.length,
        successfulOrders:
          successfulOrders.length,
        totalSpent,
        averageOrderValue,
        firstOrderDate,
        lastOrderDate,
        status: getCustomerStatus(
          orders.length,
          firstOrderDate,
          lastOrderDate
        ),
        orders,
      };
    }
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<CustomerFilter>("all");
  const [sort, setSort] =
    useState<CustomerSort>("newest");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(
    async (showRefreshState = false) => {
      try {
        setError("");

        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const { data, error: ordersError } =
          await supabase
            .from("orders")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

        if (ordersError) {
          throw ordersError;
        }

        const customerData = buildCustomers(
          (data ?? []) as OrderRow[]
        );

        setCustomers(customerData);

        setSelectedCustomer(
          (currentCustomer) => {
            if (!currentCustomer) {
              return null;
            }

            return (
              customerData.find(
                (customer) =>
                  customer.id ===
                  currentCustomer.id
              ) ?? null
            );
          }
        );
      } catch (loadError) {
        console.error(
          "Failed to load customers:",
          loadError
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load customer information."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const summary = useMemo(
    () => getCustomerSummary(customers),
    [customers]
  );

  const displayedCustomers = useMemo(() => {
    const filteredCustomers = filterCustomers(
      customers,
      search,
      filter
    );

    return sortCustomers(
      filteredCustomers,
      sort
    );
  }, [customers, search, filter, sort]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-red-500"
          />

          <p className="mt-4 font-bold text-white">
            Loading customers...
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Collecting customer information from
            your orders.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-6">
        <CustomersHeader
          refreshing={refreshing}
          onRefresh={() =>
            void loadCustomers(true)
          }
        />

        {error && (
          <section className="flex flex-col gap-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="font-bold text-red-300">
                  Customer data could not be
                  loaded
                </p>

                <p className="mt-1 text-sm text-red-200/70">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadCustomers(true)
              }
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
            >
              Try Again
            </button>
          </section>
        )}

        <CustomerStats summary={summary} />

        <CustomerFilters
          search={search}
          filter={filter}
          sort={sort}
          resultCount={
            displayedCustomers.length
          }
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />

        <CustomerTable
          customers={displayedCustomers}
          onSelectCustomer={
            setSelectedCustomer
          }
        />
      </main>

      <CustomerDetailsModal
        customer={selectedCustomer}
        open={selectedCustomer !== null}
        onClose={() =>
          setSelectedCustomer(null)
        }
      />
    </>
  );
}