import type { Metadata } from "next";

import { DeskFrame } from "@/components/sell/desk-frame";
import { DeskPackedUp } from "@/components/sell/desk-packed-up";
import { OtherBoothDesks } from "@/components/sell/other-booth-desks";
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
      <div className="mt-8">
        <OtherBoothDesks
          excludeStallId={stall.id}
          seed={overlayDeskStalls(readSellerListings(), stall.id)}
        />
      </div>
    </DeskFrame>
  );
}
