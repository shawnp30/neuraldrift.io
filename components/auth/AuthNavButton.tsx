"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function AuthNavButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!loaded) return <div className="h-8 w-8" />;

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="hidden lg:inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-accent/40 hover:text-accent"
      >
        Sign In
      </Link>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="relative hidden lg:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white transition-colors hover:border-accent/40"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-white/10 bg-[#111113] p-2 shadow-2xl">
          <p className="truncate px-3 py-2 text-xs text-[#8888a0]">{user.email}</p>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5"
          >
            Dashboard
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-white/5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
