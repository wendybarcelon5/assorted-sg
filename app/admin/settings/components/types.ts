export type StoreSettings = {
  storeName: string;
  storeEmail: string;
  supportEmail: string;
  phone: string;

  currency: string;
  timezone: string;

  orderPrefix: string;

  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockNotifications: boolean;
};