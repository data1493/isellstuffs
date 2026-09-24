"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const INTERVAL_MS = 4000;

/** Poll the server floor when DATABASE_URL is on. Cookie default does not pretend to be live. */
export function FloorRefresh({ shared }: { shared: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!shared) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      router.refresh();
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [shared, router]);

  if (!shared) return null;

  return (
    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-primary">
      Live floor · refresh 4s
    </p>
  );
}
