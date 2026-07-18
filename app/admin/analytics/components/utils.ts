import {
  AnalyticsSummary,
  ChartData,
  DateFilter,
  Order,
  Product,
} from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) {
    return `₱${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `₱${(value / 1_000).toFixed(1)}K`;
  }

  return `₱${Math.round(value)}`;
}

export function isSuccessfulOrder(order: Order) {
  const statusText = `${order.payment_status ?? ""} ${
    order.status ?? ""
  }`.toLowerCase();

  const unsuccessfulStatuses = [
    "cancel",
    "failed",
    "rejected",
    "refund",
  ];

  return !unsuccessfulStatuses.some((status) =>
    statusText.includes(status)
  );
}

export function getFilterStartDate(filter: DateFilter) {
  const now = new Date();

  if (filter === "today") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  if (filter === "7days") {
    const date = new Date(now);

    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  if (filter === "30days") {
    const date = new Date(now);

    date.setDate(date.getDate() - 29);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  if (filter === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

export function getPreviousPeriod(
  filter: DateFilter
): { start: Date; end: Date } | null {
  const now = new Date();

  if (filter === "today") {
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    return { start, end };
  }

  if (filter === "7days") {
    const end = new Date(now);

    end.setDate(end.getDate() - 6);
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    return { start, end };
  }

  if (filter === "30days") {
    const end = new Date(now);

    end.setDate(end.getDate() - 29);
    end.setHours(0, 0, 0, 0);

    const start = new Date(end);
    start.setDate(start.getDate() - 30);

    return { start, end };
  }

  if (filter === "year") {
    return {
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear(), 0, 1),
    };
  }

  return null;
}

export function calculatePercentageChange(
  current: number,
  previous: number
) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

export function filterOrdersByDate(
  orders: Order[],
  filter: DateFilter
) {
  const startDate = getFilterStartDate(filter);

  if (!startDate) {
    return orders;
  }

  return orders.filter((order) => {
    if (!order.created_at) {
      return false;
    }

    const orderDate = new Date(order.created_at);

    return (
      !Number.isNaN(orderDate.getTime()) &&
      orderDate >= startDate
    );
  });
}

export function getPreviousOrders(
  orders: Order[],
  filter: DateFilter
) {
  const period = getPreviousPeriod(filter);

  if (!period) {
    return [];
  }

  return orders.filter((order) => {
    if (!order.created_at) {
      return false;
    }

    const orderDate = new Date(order.created_at);

    return (
      !Number.isNaN(orderDate.getTime()) &&
      orderDate >= period.start &&
      orderDate < period.end
    );
  });
}

export function calculateAnalyticsSummary(
  filteredOrders: Order[],
  previousOrders: Order[],
  products: Product[]
): AnalyticsSummary {
  const successfulOrders =
    filteredOrders.filter(isSuccessfulOrder);

  const previousSuccessfulOrders =
    previousOrders.filter(isSuccessfulOrder);

  const revenue = successfulOrders.reduce(
    (total, order) => total + Number(order.total ?? 0),
    0
  );

  const previousRevenue = previousSuccessfulOrders.reduce(
    (total, order) => total + Number(order.total ?? 0),
    0
  );

  const customerEmails = new Set(
    filteredOrders
      .map((order) => order.email?.trim().toLowerCase())
      .filter(Boolean)
  );

  const previousCustomerEmails = new Set(
    previousOrders
      .map((order) => order.email?.trim().toLowerCase())
      .filter(Boolean)
  );

  const averageOrderValue =
    successfulOrders.length > 0
      ? revenue / successfulOrders.length
      : 0;

  const previousAverageOrderValue =
    previousSuccessfulOrders.length > 0
      ? previousRevenue / previousSuccessfulOrders.length
      : 0;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock ?? 0) <= 5
  ).length;

  return {
    revenue,
    totalOrders: filteredOrders.length,
    successfulOrders: successfulOrders.length,
    customers: customerEmails.size,
    averageOrderValue,

    revenueChange: calculatePercentageChange(
      revenue,
      previousRevenue
    ),

    ordersChange: calculatePercentageChange(
      filteredOrders.length,
      previousOrders.length
    ),

    customersChange: calculatePercentageChange(
      customerEmails.size,
      previousCustomerEmails.size
    ),

    averageOrderChange: calculatePercentageChange(
      averageOrderValue,
      previousAverageOrderValue
    ),
  };
}

export function createTodayChartData(
  orders: Order[]
): ChartData[] {
  const now = new Date();

  return Array.from({ length: 8 }, (_, index) => {
    const startHour = index * 3;

    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startHour
    );

    const periodEnd = new Date(periodStart);
    periodEnd.setHours(periodEnd.getHours() + 3);

    const periodOrders = orders.filter((order) => {
      if (!order.created_at) {
        return false;
      }

      const orderDate = new Date(order.created_at);

      return (
        orderDate >= periodStart &&
        orderDate < periodEnd
      );
    });

    const revenue = periodOrders
      .filter(isSuccessfulOrder)
      .reduce(
        (total, order) =>
          total + Number(order.total ?? 0),
        0
      );

    return {
      label: periodStart.toLocaleTimeString("en-PH", {
        hour: "numeric",
      }),
      revenue,
      orders: periodOrders.length,
    };
  });
}

export function createDailyChartData(
  orders: Order[],
  days: number
): ChartData[] {
  const now = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);

    date.setDate(
      now.getDate() - (days - 1 - index)
    );

    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      if (!order.created_at) {
        return false;
      }

      const orderDate = new Date(order.created_at);

      return (
        orderDate >= date &&
        orderDate < nextDate
      );
    });

    const revenue = dayOrders
      .filter(isSuccessfulOrder)
      .reduce(
        (total, order) =>
          total + Number(order.total ?? 0),
        0
      );

    return {
      label: date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
      revenue,
      orders: dayOrders.length,
    };
  });
}

export function createMonthlyChartData(
  orders: Order[],
  monthCount = 12
): ChartData[] {
  const now = new Date();

  return Array.from(
    { length: monthCount },
    (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() -
          (monthCount - 1 - index),
        1
      );

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1
      );

      const monthOrders = orders.filter((order) => {
        if (!order.created_at) {
          return false;
        }

        const orderDate = new Date(order.created_at);

        return (
          orderDate >= monthDate &&
          orderDate < nextMonth
        );
      });

      const revenue = monthOrders
        .filter(isSuccessfulOrder)
        .reduce(
          (total, order) =>
            total + Number(order.total ?? 0),
          0
        );

      return {
        label: monthDate.toLocaleDateString(
          "en-PH",
          {
            month: "short",
          }
        ),
        revenue,
        orders: monthOrders.length,
      };
    }
  );
}

export function createChartData(
  orders: Order[],
  filter: DateFilter
) {
  if (filter === "today") {
    return createTodayChartData(orders);
  }

  if (filter === "7days") {
    return createDailyChartData(orders, 7);
  }

  if (filter === "30days") {
    return createDailyChartData(orders, 30);
  }

  return createMonthlyChartData(orders, 12);
}

export function getPeriodLabel(filter: DateFilter) {
  if (filter === "today") {
    return "compared with yesterday";
  }

  if (filter === "7days") {
    return "compared with previous 7 days";
  }

  if (filter === "30days") {
    return "compared with previous 30 days";
  }

  if (filter === "year") {
    return "compared with last year";
  }

  return "all recorded data";
}