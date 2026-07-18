import { supabase } from "@/lib/supabase";

export async function createNotification(
  title: string,
  message: string,
  type: string = "general"
) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      title,
      message,
      type,
      is_read: false,
    });

  if (error) {
    console.error("Unable to create notification:", error);
  }
}