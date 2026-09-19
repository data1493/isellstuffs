"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Stall } from "@/lib/commerce";
import { sellDeskStallPath } from "@/lib/paths";
import { overlayDeskStalls } from "@/lib/seller-desk";
import {
  SELLER_LISTINGS_CHANGED,
  readSellerListings,
} from "@/lib/seller-overlay";

export function OtherBoothDesks({
  excludeStallId,
  seed = [],
}: {
  excludeStallId: string;
  seed?: Stall[];
}) {
  const [booths, setBooths] = useState(seed);

  useEffect(() => {
    function apply() {
      setBooths(overlayDeskStalls(readSellerListings(), excludeStallId));
    }

    apply();
    window.addEventListener(SELLER_LISTINGS_CHANGED, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(SELLER_LISTINGS_CHANGED, apply);
      window.removeEventListener("storage", apply);
    };
  }, [excludeStallId]);

  return (
    <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
      <p>
        Desks for other booths you listed on.
        {booths.length === 0
          ? " List somewhere else and that booth gets a desk."
          : null}
      </p>
      {booths.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {booths.map((booth) => (
            <li key={booth.id}>
              <Link
                href={sellDeskStallPath(booth.slug)}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {booth.boothName}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
