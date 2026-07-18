export type CustomerStatus =
  | "active"
  | "new"
  | "returning"
  | "inactive";

export type CustomerOrder = {
  id: string | number;
  created_at?: string | null;
  status?: string | null;
  total?: number | null;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  items?: unknown;
  order_items?: unknown;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  successfulOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
  status: CustomerStatus;
  orders: CustomerOrder[];
};

export type CustomerSummary = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  totalCustomerRevenue: number;
  averageCustomerValue: number;
};

export type CustomerFilter =
  | "all"
  | "new"
  | "returning"
  | "active"
  | "inactive";

export type CustomerSort =
  | "newest"
  | "oldest"
  | "highest-spending"
  | "lowest-spending"
  | "most-orders"
  | "name";