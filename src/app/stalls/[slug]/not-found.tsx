import type { Metadata } from "next";
import Link from "next/link";

import { missingStallMetadata } from "@/lib/seo";

export const metadata: Metadata = missingStallMetadata();

export default function StallNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Stall
      </p>
      <h1 className="font-heading text-4xl tracking-tight">
        That stall packed up
      </h1>
      <p className="max-w-xl text-muted-foreground">
        No booth with that slug. The folding table is gone, or the name is
        wrong.
      </p>
      <Link
        href="/"
        className="w-fit text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to the mall
      </Link>
    </div>
  );
}
