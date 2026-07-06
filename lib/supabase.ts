import { createClient } from "@supabase/supabase-js";

console.log("URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);