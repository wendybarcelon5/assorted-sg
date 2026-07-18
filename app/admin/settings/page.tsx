"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

import SettingsForm from "./components/SettingsForm";
import SettingsHeader from "./components/SettingsHeader";
import type { StoreSettings } from "./components/types";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Assorted SG",
  storeEmail: "hello@assortedsg.com",
  supportEmail: "support@assortedsg.com",
  phone: "+63 912 345 6789",

  currency: "PHP",
  timezone: "Asia/Manila",

  orderPrefix: "ASG",

  emailNotifications: true,
  orderNotifications: true,
  lowStockNotifications: true,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<StoreSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSettings(
    refresh = false
  ) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          storeName:
            data.store_name ??
            DEFAULT_SETTINGS.storeName,

          storeEmail:
            data.store_email ??
            DEFAULT_SETTINGS.storeEmail,

          supportEmail:
            data.support_email ??
            DEFAULT_SETTINGS.supportEmail,

          phone:
            data.phone ??
            DEFAULT_SETTINGS.phone,

          currency:
            data.currency ??
            DEFAULT_SETTINGS.currency,

          timezone:
            data.timezone ??
            DEFAULT_SETTINGS.timezone,

          orderPrefix:
            data.order_prefix ??
            DEFAULT_SETTINGS.orderPrefix,

          emailNotifications:
            data.email_notifications ??
            true,

          orderNotifications:
            data.order_notifications ??
            true,

          lowStockNotifications:
            data.low_stock_notifications ??
            true,
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField<
    K extends keyof StoreSettings
  >(field: K, value: StoreSettings[K]) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveSettings() {
  try {
    setSaving(true);
    setSuccess("");
    setError("");

    const payload = {
      id: 1,

      store_name: settings.storeName.trim(),
      store_email: settings.storeEmail.trim(),
      support_email: settings.supportEmail.trim(),
      phone: settings.phone.trim(),

      currency: settings.currency,
      timezone: settings.timezone,

      order_prefix:
        settings.orderPrefix.trim().toUpperCase(),

      email_notifications:
        settings.emailNotifications,

      order_notifications:
        settings.orderNotifications,

      low_stock_notifications:
        settings.lowStockNotifications,

      updated_at: new Date().toISOString(),
    };

    const {
      data,
      error: saveError,
    } = await supabase
      .from("settings")
      .upsert(payload, {
        onConflict: "id",
      })
      .select()
      .single();

    if (saveError) {
      console.error(
        "Supabase settings save error:",
        saveError
      );

      const details = [
        saveError.message,
        saveError.details,
        saveError.hint,
        saveError.code
          ? `Error code: ${saveError.code}`
          : "",
      ]
        .filter(Boolean)
        .join(" — ");

      setError(
        details ||
          "Supabase rejected the settings update."
      );

      return;
    }

    console.log(
      "Settings saved successfully:",
      data
    );

    setSuccess(
      "Settings saved successfully."
    );
  } catch (unexpectedError: unknown) {
    console.error(
      "Unexpected settings error:",
      unexpectedError
    );

    if (
      typeof unexpectedError === "object" &&
      unexpectedError !== null
    ) {
      setError(
        JSON.stringify(
          unexpectedError,
          null,
          2
        )
      );
    } else {
      setError(String(unexpectedError));
    }
  } finally {
    setSaving(false);
  }
}

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-yellow-500"
            size={42}
          />

          <p className="mt-4 font-bold text-white">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <SettingsHeader
        refreshing={refreshing}
        onRefresh={() =>
          loadSettings(true)
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 font-semibold text-green-400">
          {success}
        </div>
      )}

      <SettingsForm
        settings={settings}
        saving={saving}
        onChange={updateField}
        onSave={saveSettings}
      />
    </main>
  );
}