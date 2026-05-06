import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Keep the landing route simple: bounce based on auth state.
  // If env vars aren't set yet, send the user to login (which shows the missing-env hint).
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  redirect(data.user ? "/app" : "/login");
}
