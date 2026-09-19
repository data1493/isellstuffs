import type { Metadata } from "next";
import Link from "next/link";

import { missingListingMetadata } from "@/lib/seo";

export const metadata: Metadata = missingListingMetadata();

export default function ListingNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Listing
      </p>
      <h1 className="font-heading text-4xl tracking-tight">
        That listing walked off
      </h1>
      <p className="max-w-xl text-muted-foreground">
        No SKU with that id. It sold, the id is wrong, or it never made it onto
        the table.
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
