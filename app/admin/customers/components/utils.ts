import {
  Customer,
  CustomerFilter,
  CustomerOrder,
  CustomerSort,
  CustomerSummary,
} from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date?: string | null) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isSuccessfulOrder(order: CustomerOrder) {
  const status = String(order.status ?? "").toLowerCase();

  return (
    status.includes("paid") ||
    status.includes("complete") ||
    status.includes("deliver") ||
    status.includes("ship") ||
    status.includes("process")
  );
}

export function getCustomerSummary(
  customers: Customer[]
): CustomerSummary {
  const totalCustomers = customers.length;

  const newCustomers = customers.filter(
    (customer) => customer.status === "new"
  ).length;

  const returningCustomers = customers.filter(
    (customer) => customer.status === "returning"
  ).length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "active"
  ).length;

  const totalCustomerRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const averageCustomerValue =
    totalCustomers > 0
      ? totalCustomerRevenue / totalCustomers
      : 0;

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    activeCustomers,
    totalCustomerRevenue,
    averageCustomerValue,
  };
}

export function filterCustomers(
  customers: Customer[],
  search: string,
  filter: CustomerFilter
) {
  return customers.filter((customer) => {
    const matchesSearch =
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.phone
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all"
        ? true
        : customer.status === filter;

    return matchesSearch && matchesFilter;
  });
}

export function sortCustomers(
  customers: Customer[],
  sort: CustomerSort
) {
  return [...customers].sort((a, b) => {
    switch (sort) {
      case "highest-spending":
        return b.totalSpent - a.totalSpent;

      case "lowest-spending":
        return a.totalSpent - b.totalSpent;

      case "most-orders":
        return b.totalOrders - a.totalOrders;

      case "oldest":
        return (
          new Date(a.firstOrderDate ?? 0).getTime() -
          new Date(b.firstOrderDate ?? 0).getTime()
        );

      case "name":
        return a.name.localeCompare(b.name);

      default:
        return (
          new Date(b.lastOrderDate ?? 0).getTime() -
          new Date(a.lastOrderDate ?? 0).getTime()
        );
    }
  });
}