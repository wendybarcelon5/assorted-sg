"use client";

import {
  Bell,
  Building2,
  Clock3,
  DollarSign,
  Mail,
  Package,
  Phone,
  Save,
  Store,
} from "lucide-react";

import type { StoreSettings } from "./types";

type SettingsFormProps = {
  settings: StoreSettings;
  saving: boolean;
  onChange: <K extends keyof StoreSettings>(
    field: K,
    value: StoreSettings[K]
  ) => void;
  onSave: () => void;
};

type TextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  icon: React.ReactNode;
  onChange: (value: string) => void;
};

function TextField({
  label,
  value,
  placeholder,
  type = "text",
  icon,
  onChange,
}: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-300">
        {label}
      </span>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-500"
        />
      </div>
    </label>
  );
}

type ToggleFieldProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleField({
  title,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-yellow-500"
            : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsForm({
  settings,
  saving,
  onChange,
  onSave,
}: SettingsFormProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <Building2 size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Store Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic business details shown across your store.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <TextField
            label="Store Name"
            value={settings.storeName}
            placeholder="Assorted SG"
            icon={<Store size={18} />}
            onChange={(value) =>
              onChange("storeName", value)
            }
          />

          <TextField
            label="Store Email"
            type="email"
            value={settings.storeEmail}
            placeholder="hello@assortedsg.com"
            icon={<Mail size={18} />}
            onChange={(value) =>
              onChange("storeEmail", value)
            }
          />

          <TextField
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            placeholder="support@assortedsg.com"
            icon={<Mail size={18} />}
            onChange={(value) =>
              onChange("supportEmail", value)
            }
          />

          <TextField
            label="Phone Number"
            type="tel"
            value={settings.phone}
            placeholder="+63 912 345 6789"
            icon={<Phone size={18} />}
            onChange={(value) =>
              onChange("phone", value)
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <DollarSign size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Regional Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select your preferred currency and timezone.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-300">
              Currency
            </span>

            <div className="relative">
              <DollarSign
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <select
                value={settings.currency}
                onChange={(event) =>
                  onChange(
                    "currency",
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0B1120] py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-yellow-500"
              >
                <option value="PHP">
                  PHP — Philippine Peso
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>

                <option value="SGD">
                  SGD — Singapore Dollar
                </option>

                <option value="EUR">
                  EUR — Euro
                </option>
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-300">
              Timezone
            </span>

            <div className="relative">
              <Clock3
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <select
                value={settings.timezone}
                onChange={(event) =>
                  onChange(
                    "timezone",
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0B1120] py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-yellow-500"
              >
                <option value="Asia/Manila">
                  Asia/Manila
                </option>

                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>
              </select>
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <Package size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Order Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure how new order numbers are displayed.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <TextField
            label="Order Prefix"
            value={settings.orderPrefix}
            placeholder="ASG"
            icon={<Package size={18} />}
            onChange={(value) =>
              onChange(
                "orderPrefix",
                value.toUpperCase()
              )
            }
          />

          <p className="mt-3 text-sm text-gray-500">
            Example order number:{" "}
            <span className="font-bold text-yellow-400">
              {settings.orderPrefix || "ASG"}-1001
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-400">
            <Bell size={22} />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              Notification Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose which alerts you want to receive.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <ToggleField
            title="Email Notifications"
            description="Receive general store notifications by email."
            checked={settings.emailNotifications}
            onChange={(value) =>
              onChange(
                "emailNotifications",
                value
              )
            }
          />

          <ToggleField
            title="New Order Notifications"
            description="Receive an alert whenever a customer places an order."
            checked={settings.orderNotifications}
            onChange={(value) =>
              onChange(
                "orderNotifications",
                value
              )
            }
          />

          <ToggleField
            title="Low Stock Notifications"
            description="Receive alerts when product inventory is running low."
            checked={
              settings.lowStockNotifications
            }
            onChange={(value) =>
              onChange(
                "lowStockNotifications",
                value
              )
            }
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-yellow-500 px-6 py-3.5 font-black text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={19} />

          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}