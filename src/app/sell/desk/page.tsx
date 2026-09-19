import type { Metadata } from "next";
import Link from "next/link";

import { DeskFrame } from "@/components/sell/desk-frame";
import { DeskPackedUp } from "@/components/sell/desk-packed-up";
import { OtherBoothDesks } from "@/components/sell/other-booth-desks";
import { sellDeskQueuePath } from "@/lib/paths";
import { overlayDeskStalls, deskListings, deskStall } from "@/lib/seller-desk";
import { readSellerListings } from "@/lib/seller-overlay";
import { sellDeskMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = sellDeskMetadata();

export default function SellDeskPage() {
  const stall = deskStall();

  if (!stall) {
    return <DeskPackedUp />;
  }

  return (
    <DeskFrame stall={stall} listings={deskListings()}>
      <div className="mt-8 space-y-3">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          <Link
            href={sellDeskQueuePath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Who is coming
          </Link>{" "}
          up the drive from paid pickup slips. Files stay in the folder.
        </p>
        <OtherBoothDesks
          excludeStallId={stall.id}
          seed={overlayDeskStalls(readSellerListings(), stall.id)}
        />
      </div>
    </DeskFrame>
  );
}
