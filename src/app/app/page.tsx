import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addTask, deleteTask, signOut, toggleDone } from "./actions";

type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  inserted_at: string;
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = sp.error ? String(sp.error) : null;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: tasks, error: tasksError } = await supabase
    .from("study_tasks")
    .select("id,title,done,inserted_at")
    .order("inserted_at", { ascending: false })
    .returns<TaskRow[]>();

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Study Organizer
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Signed in as{" "}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {userData.user.email}
              </span>
            </p>
          </div>
          <form action={signOut}>
            <button
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            Something went wrong (<code className="font-mono">{error}</code>).
          </div>
        ) : null}

        {!process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase env vars are missing. Add them in Vercel (Project → Settings
            → Environment Variables), then redeploy.
          </div>
        ) : null}

        <form
          action={addTask}
          className="mt-8 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <input
            name="title"
            placeholder="Add a task (e.g., 'Read chapter 3')"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Add
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-4 py-3 text-sm font-medium dark:border-zinc-800">
            Tasks
          </div>

          {tasksError ? (
            <div className="px-4 py-4 text-sm text-rose-600 dark:text-rose-400">
              Couldn&apos;t load tasks. Make sure the `study_tasks` table + RLS
              policy exist in Supabase.
            </div>
          ) : null}

          {tasks && tasks.length === 0 ? (
            <div className="px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400">
              No tasks yet. Add your first one above.
            </div>
          ) : null}

          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {(tasks ?? []).map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <form action={toggleDone}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={String(!t.done)} />
                  <button
                    type="submit"
                    className={[
                      "h-5 w-5 rounded border",
                      t.done
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
                    ].join(" ")}
                    aria-label={t.done ? "Mark not done" : "Mark done"}
                  />
                </form>

                <div className="flex-1">
                  <div
                    className={[
                      "text-sm",
                      t.done
                        ? "text-zinc-400 line-through"
                        : "text-zinc-900 dark:text-zinc-100",
                    ].join(" ")}
                  >
                    {t.title}
                  </div>
                </div>

                <form action={deleteTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

