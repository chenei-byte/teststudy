import Link from "next/link";
import { signInWithMagicLink } from "./actions";

function MissingEnvHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium">Missing Supabase environment variables.</p>
      <p className="mt-1">
        Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
        Vercel (and <code className="font-mono">.env.local</code> for dev).
      </p>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sent = sp.sent === "1";
  const envMissing = sp.env === "missing";

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to Study Organizer
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a magic link.
        </p>

        <div className="mt-6">
          <MissingEnvHint show={envMissing} />
        </div>

        <form action={signInWithMagicLink} className="mt-6 space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Send magic link
          </button>
        </form>

        {sent ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Check your email for the sign-in link.
          </div>
        ) : null}

        <p className="mt-8 text-xs text-zinc-500">
          After you deploy, set your Supabase Auth redirect URLs and{" "}
          <Link className="underline" href="/app">
            open the app
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

