import { supabase } from "@/lib/supabase";

export type DashboardOrder = {
  id: string | number;
  customer_name: string | null;
  email: string | null;
  total: number;
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string;
};

export type DashboardNotification = {
  id: string | number;
  title: string;
  message: string;
  type: string | null;
  created_at: string | null;
};

export type DashboardProduct = {
  id: string | number;
  name: string;
  category: string | null;
  price: number;
  image: string | null;
  stock: number;
};

export type BestSellingProduct = {
  id: string | number | null;
  name: string;
  image: string | null;
  price: number;
  quantitySold: number;
  revenue: number;
};

export type OrderStatusSummary = {
  status: string;
  count: number;
  percentage: number;
};

export type DailyRevenue = {
  date: string;
  revenue: number;
};

export type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
  todaySales: number;
  recentOrders: DashboardOrder[];
  recentNotifications: DashboardNotification[];
  lowStockProducts: DashboardProduct[];
  bestSellingProducts: BestSellingProduct[];
  orderStatusSummary: OrderStatusSummary[];
  revenueLast30Days: DailyRevenue[];
};

type OrderRow = DashboardOrder;

type ProductRow = DashboardProduct;

type OrderItemRow = {
  id: string | number;
  order_id: string | number;
  product_id: string | number | null;
  product_name: string;
  quantity: number;
  price: number;
};

type NotificationRow = {
  id: string | number;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string | null;
};

const LOW_STOCK_LIMIT = 5;

const PAID_PAYMENT_STATUSES = [
  "paid",
  "received",
  "confirmed",
  "completed",
  "successful",
  "success",
];

const PENDING_ORDER_STATUSES = [
  "pending",
  "awaiting payment",
  "awaiting_payment",
  "new",
  "placed",
];

function normalizeStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isPaidOrder(order: OrderRow) {
  return PAID_PAYMENT_STATUSES.includes(
    normalizeStatus(order.payment_status)
  );
}

function isPendingOrder(order: OrderRow) {
  return PENDING_ORDER_STATUSES.includes(
    normalizeStatus(order.status)
  );
}

function getManilaStartOfToday() {
  const MANILA_OFFSET = 8 * 60 * 60 * 1000;
  const now = new Date();

  const manilaTime = new Date(
    now.getTime() + MANILA_OFFSET
  );

  return new Date(
    Date.UTC(
      manilaTime.getUTCFullYear(),
      manilaTime.getUTCMonth(),
      manilaTime.getUTCDate()
    ) - MANILA_OFFSET
  );
}

function getStartOfLast30Days() {
  const start = getManilaStartOfToday();

  start.setUTCDate(start.getUTCDate() - 29);

  return start;
}

function createRevenueLast30Days(
  orders: OrderRow[]
): DailyRevenue[] {
  const MANILA_OFFSET = 8 * 60 * 60 * 1000;
  const startDate = getStartOfLast30Days();

  const revenueByDate = new Map<string, number>();

  for (let index = 0; index < 30; index += 1) {
    const date = new Date(startDate);

    date.setUTCDate(
      startDate.getUTCDate() + index
    );

    const manilaDate = new Date(
      date.getTime() + MANILA_OFFSET
    );

    const key = [
      manilaDate.getUTCFullYear(),
      String(
        manilaDate.getUTCMonth() + 1
      ).padStart(2, "0"),
      String(
        manilaDate.getUTCDate()
      ).padStart(2, "0"),
    ].join("-");

    revenueByDate.set(key, 0);
  }

  orders
    .filter(isPaidOrder)
    .forEach((order) => {
      const orderDate = new Date(
        order.created_at
      );

      const manilaDate = new Date(
        orderDate.getTime() + MANILA_OFFSET
      );

      const key = [
        manilaDate.getUTCFullYear(),
        String(
          manilaDate.getUTCMonth() + 1
        ).padStart(2, "0"),
        String(
          manilaDate.getUTCDate()
        ).padStart(2, "0"),
      ].join("-");

      if (!revenueByDate.has(key)) {
        return;
      }

      revenueByDate.set(
        key,
        (revenueByDate.get(key) ?? 0) +
          Number(order.total ?? 0)
      );
    });

  return Array.from(
    revenueByDate.entries()
  ).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

function createOrderStatusSummary(
  orders: OrderRow[]
): OrderStatusSummary[] {
  if (orders.length === 0) {
    return [];
  }

  const counts = new Map<string, number>();

  orders.forEach((order) => {
    const normalized =
      normalizeStatus(order.status) ||
      "unknown";

    const displayStatus = normalized
      .split(/[_\s-]+/)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

    counts.set(
      displayStatus,
      (counts.get(displayStatus) ?? 0) + 1
    );
  });

  return Array.from(counts.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round(
        (count / orders.length) * 100
      ),
    }))
    .sort((first, second) => {
      return second.count - first.count;
    });
}

function createBestSellingProducts(
  orderItems: OrderItemRow[],
  products: ProductRow[]
): BestSellingProduct[] {
  const productMap = new Map(
    products.map((product) => [
      String(product.id),
      product,
    ])
  );

  const salesMap = new Map<
    string,
    BestSellingProduct
  >();

  orderItems.forEach((item) => {
    const productKey = item.product_id
      ? String(item.product_id)
      : item.product_name;

    const product = item.product_id
      ? productMap.get(String(item.product_id))
      : undefined;

    const existing = salesMap.get(productKey);

    const quantity = Number(
      item.quantity ?? 0
    );

    const itemPrice = Number(
      item.price ?? 0
    );

    if (existing) {
      existing.quantitySold += quantity;
      existing.revenue +=
        quantity * itemPrice;

      return;
    }

    salesMap.set(productKey, {
      id: item.product_id,
      name:
        product?.name ||
        item.product_name ||
        "Unknown Product",
      image: product?.image ?? null,
      price:
        Number(product?.price ?? 0) ||
        itemPrice,
      quantitySold: quantity,
      revenue: quantity * itemPrice,
    });
  });

  return Array.from(salesMap.values())
    .sort((first, second) => {
      return (
        second.quantitySold -
        first.quantitySold
      );
    })
    .slice(0, 5);
}

export async function getDashboardData(): Promise<DashboardData> {
  const startOfLast30Days =
    getStartOfLast30Days();

  const [
    ordersResult,
    profilesResult,
    productsResult,
    orderItemsResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
          id,
          customer_name,
          email,
          total,
          status,
          payment_status,
          payment_method,
          created_at
        `
      )
      .gte(
        "created_at",
        startOfLast30Days.toISOString()
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("products")
      .select(
        `
          id,
          name,
          category,
          price,
          image,
          stock
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("order_items")
      .select(
        `
          id,
          order_id,
          product_id,
          product_name,
          quantity,
          price
        `
      ),
  ]);

  if (ordersResult.error) {
    throw new Error(
      `Unable to load orders: ${ordersResult.error.message}`
    );
  }

  if (profilesResult.error) {
    throw new Error(
      `Unable to load customers: ${profilesResult.error.message}`
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Unable to load products: ${productsResult.error.message}`
    );
  }

  if (orderItemsResult.error) {
    throw new Error(
      `Unable to load order items: ${orderItemsResult.error.message}`
    );
  }

  const orders =
    (ordersResult.data ?? []).map(
      (order) => ({
        ...order,
        total: Number(order.total ?? 0),
      })
    ) as OrderRow[];

  const products =
    (productsResult.data ?? []).map(
      (product) => ({
        ...product,
        price: Number(
          product.price ?? 0
        ),
        stock: Number(
          product.stock ?? 0
        ),
      })
    ) as ProductRow[];

  const orderItems =
    (orderItemsResult.data ?? []).map(
      (item) => ({
        ...item,
        quantity: Number(
          item.quantity ?? 0
        ),
        price: Number(item.price ?? 0),
      })
    ) as OrderItemRow[];

  const paidOrders =
    orders.filter(isPaidOrder);

  const totalRevenue = paidOrders.reduce(
    (total, order) =>
      total + Number(order.total ?? 0),
    0
  );

  const startOfToday =
    getManilaStartOfToday();

  const todaySales = paidOrders
    .filter((order) => {
      return (
        new Date(order.created_at) >=
        startOfToday
      );
    })
    .reduce(
      (total, order) =>
        total + Number(order.total ?? 0),
      0
    );

  const pendingOrders = orders.filter(
    isPendingOrder
  ).length;

  const lowStockProducts = products
    .filter((product) => {
      return (
        product.stock >= 0 &&
        product.stock <= LOW_STOCK_LIMIT
      );
    })
    .sort(
      (first, second) =>
        first.stock - second.stock
    )
    .slice(0, 5);

  let recentNotifications: DashboardNotification[] =
  [];

const notificationResult = await supabase
  .from("notifications")
  .select(
    `
      id,
      title,
      message,
      type,
      is_read,
      created_at
    `
  )
  .order("created_at", {
    ascending: false,
  })
  .limit(5);

if (notificationResult.error) {
  console.error(
    "Unable to load dashboard notifications:",
    notificationResult.error
  );
} else {
  recentNotifications = (
    notificationResult.data ?? []
  ).map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    created_at: notification.created_at,
  }));
}

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers:
      profilesResult.count ?? 0,
    totalProducts: products.length,
    pendingOrders,
    lowStockCount: products.filter(
      (product) =>
        product.stock >= 0 &&
        product.stock <= LOW_STOCK_LIMIT
    ).length,
    todaySales,
    recentOrders: orders.slice(0, 5),
    recentNotifications,
    lowStockProducts,
    bestSellingProducts:
      createBestSellingProducts(
        orderItems,
        products
      ),
    orderStatusSummary:
      createOrderStatusSummary(orders),
    revenueLast30Days:
      createRevenueLast30Days(orders),
  };
}