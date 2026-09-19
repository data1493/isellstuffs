"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { sellDeskStallPath, stallEditPath } from "@/lib/paths";
import {
  SELLER_STALLS_CHANGED,
  stallCardById,
} from "@/lib/stall-overlay";

export function StallCardCopy({
  stallId,
  slug,
  boothName,
  blurb,
}: {
  stallId: string;
  slug: string;
  boothName: string;
  blurb: string;
}) {
  const [card, setCard] = useState({ boothName, blurb });

  useEffect(() => {
    function apply() {
      const patch = stallCardById(stallId);
      setCard(
        patch
          ? { boothName: patch.boothName, blurb: patch.blurb }
          : { boothName, blurb },
      );
    }

    apply();
    window.addEventListener(SELLER_STALLS_CHANGED, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(SELLER_STALLS_CHANGED, apply);
      window.removeEventListener("storage", apply);
    };
  }, [blurb, boothName, stallId]);

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="font-heading text-4xl leading-[1.1] tracking-tight text-balance sm:text-5xl">
        {card.boothName}
      </h1>
      <p className="text-base leading-7 text-muted-foreground sm:text-lg">
        {card.blurb}
      </p>
      <p className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
        <Link
          href={stallEditPath(slug)}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Rewrite the booth card
        </Link>
        <Link
          href={sellDeskStallPath(slug)}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open this booth&apos;s desk
        </Link>
      </p>
    </div>
  );
}
