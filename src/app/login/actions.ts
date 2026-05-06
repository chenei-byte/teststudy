"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=email");

  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  const emailRedirectTo = origin
    ? `${origin}/auth/callback`
    : "http://localhost:3000/auth/callback";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) redirect("/login?error=otp");

  redirect("/login?sent=1");
}

