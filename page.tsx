"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = "study-organizer.tasks.v1";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function makeId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export default function AppPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setTasks(loadTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTasks(tasks);
  }, [tasks, hydrated]);

  function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const next: Task = {
      id: makeId(),
      title,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [next, ...prev]);
    setDraft("");
  }

  function toggleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className="flex flex-1 justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Study Organizer
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              No login required. Your tasks are saved on this device only.
            </p>
          </div>
          {tasks.some((t) => t.done) ? (
            <button
              type="button"
              onClick={clearCompleted}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              Clear completed
            </button>
          ) : null}
        </div>

        <form
          onSubmit={addTask}
          className="mt-8 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a task (e.g., 'Read chapter 3')"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-zinc-400"
          />
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Add
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 text-sm font-medium dark:border-zinc-800">
            <span>Tasks</span>
            <span className="text-xs font-normal text-zinc-500">
              {hydrated ? `${remaining} remaining` : ""}
            </span>
          </div>

          {hydrated && tasks.length === 0 ? (
            <div className="px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400">
              No tasks yet. Add your first one above.
            </div>
          ) : null}

          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleDone(t.id)}
                  aria-label={t.done ? "Mark not done" : "Mark done"}
                  className={[
                    "h-5 w-5 rounded border",
                    t.done
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950",
                  ].join(" ")}
                />

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

                <button
                  type="button"
                  onClick={() => deleteTask(t.id)}
                  className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Tip: tasks are stored in your browser&apos;s local storage. Clearing
          your browser data will erase them.
        </p>
      </div>
    </div>
  );
}
