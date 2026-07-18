export type DateFilter =
  | "today"
  | "7days"
  | "30days"
  | "year"
  | "all";

export type Order = {
  id: string | number;

  customer_name?: string | null;

  email?: string | null;

  total?: number | string | null;

  status?: string | null;

  payment_status?: string | null;

  payment_method?: string | null;

  created_at?: string | null;
};

export type Product = {
  id: string | number;

  name?: string | null;

  price?: number | string | null;

  stock?: number | string | null;

  created_at?: string | null;
};

export type AnalyticsSummary = {
  revenue: number;

  totalOrders: number;

  successfulOrders: number;

  customers: number;

  averageOrderValue: number;

  revenueChange: number;

  ordersChange: number;

  customersChange: number;

  averageOrderChange: number;
};

export type ChartData = {
  label: string;

  revenue: number;

  orders: number;
};

export type PaymentMethodData = {
  name: string;

  value: number;
};

export type OrderStatusData = {
  name: string;

  value: number;
};

export type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

export type TopCustomer = {
  name: string;
  email: string;
  spent: number;
  orders: number;
};