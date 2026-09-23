import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button, buttonVariants } from "@/components/ui/button";
import { CART_MIRROR_SCRIPT } from "@/lib/cart";
import { stallBagPath, stallPath } from "@/lib/paths";
import {
  eligibleStallListingIds,
  type StallBagNotice,
} from "@/lib/stall-bag";
import { cn } from "@/lib/utils";

function StallBagNoticeView({ bag }: { bag: StallBagNotice }) {
  if (bag === "scooped") {
    return (
      <MallNotice
        padded={false}
        tone="empty"
        titleAs="h2"
        eyebrow="Scooped"
        title="Scooped the table. The later pile is still a pile."
        body="Still-here finds from this booth are in the tote. Sold, packed, and pulled SKUs stayed on the floor."
        actions={
          <Button className="rounded-full px-5" render={<Link href="/cart" />}>
            Open the tote
          </Button>
        }
      />
    );
  }

  return (
    <MallNotice
      padded={false}
      tone="empty"
      titleAs="h2"
      eyebrow="This table"
      title="Nothing still here to bag."
      body="Sold, packed, pulled, and missing SKUs stay on the floor. The tote did not change."
    />
  );
}

export function parseStallBagNotice(
  value: string | string[] | undefined,
): StallBagNotice | undefined {
  const bag = Array.isArray(value) ? value[0] : value;
  if (bag === "scooped" || bag === "empty") {
    return bag;
  }
  return undefined;
}

export function BagThisTableButton({
  stallId,
  slug,
  bag,
}: {
  stallId: string;
  slug: string;
  bag?: StallBagNotice;
}) {
  const eligible = eligibleStallListingIds(stallId);

  return (
    <div className="w-full max-w-2xl space-y-3" data-stall-bag={stallId}>
      <script dangerouslySetInnerHTML={{ __html: CART_MIRROR_SCRIPT }} />
      {eligible.length > 0 ? (
        <form action={stallBagPath()} method="post" className="w-full">
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="returnTo" value={stallPath(slug)} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full rounded-full px-5",
            )}
          >
            Bag this table
          </button>
        </form>
      ) : null}
      {bag ? <StallBagNoticeView bag={bag} /> : null}
    </div>
  );
}
