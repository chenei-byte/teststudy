"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.from("study_tasks").insert({
    user_id: userData.user.id,
    title,
  });
  if (error) redirect("/app?error=insert");

  revalidatePath("/app");
}

export async function toggleDone(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const done = String(formData.get("done") ?? "").trim() === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase
    .from("study_tasks")
    .update({ done })
    .eq("id", id);

  if (error) redirect("/app?error=update");
  revalidatePath("/app");
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.from("study_tasks").delete().eq("id", id);
  if (error) redirect("/app?error=delete");

  revalidatePath("/app");
}

