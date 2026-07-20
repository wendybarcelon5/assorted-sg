import { supabase } from "@/lib/supabase";

export async function createNotification(
  title: string,
  message: string,
  type: string = "general"
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Cannot create notification: user is not logged in.",
      userError
    );

    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: user.id,
        title,
        message,
        type,
        is_read: false,
      },
    ]);

  if (error) {
    console.error(
      "Notification creation error:",
      error
    );
  }
}