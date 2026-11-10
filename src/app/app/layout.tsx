"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/shell/AppShell";
import { ToastProvider } from "@/components/s/kit";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, ready, me } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !me) router.replace("/");
    if (ready && me?.role === "student" && !state.onboarded[me.id]) router.replace("/welcome");
  }, [ready, me, router, state.onboarded]);
  if (!ready || !me) return <div className="grid min-h-dvh place-items-center"><div className="shimmer h-10 w-40 rounded-full" /></div>;
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
