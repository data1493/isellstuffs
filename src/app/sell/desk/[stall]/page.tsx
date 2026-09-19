import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeskFrame } from "@/components/sell/desk-frame";
import { DeskPackedUp } from "@/components/sell/desk-packed-up";
import { FolderTapeDoor } from "@/components/sell/folder-tape-door";
import { OtherBoothDesks } from "@/components/sell/other-booth-desks";
import { sellDeskPath, sellHoursPath } from "@/lib/paths";
import {
  DESK_STALL_ID,
  deskListingsForStall,
  deskStallBySlug,
  overlayDeskStalls,
} from "@/lib/seller-desk";
import { readSellerListings } from "@/lib/seller-overlay";
import {
  missingSellDeskStallMetadata,
  sellDeskStallMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type StallDeskProps = {
  params: Promise<{ stall: string }>;
};

export async function generateMetadata({
  params,
}: StallDeskProps): Promise<Metadata> {
  const { stall: slug } = await params;
  const stall = deskStallBySlug(slug);
  if (!stall) {
    return missingSellDeskStallMetadata();
  }
  return sellDeskStallMetadata(stall);
}

export default async function SellDeskStallPage({ params }: StallDeskProps) {
  const { stall: slug } = await params;
  const stall = deskStallBySlug(slug);

  if (!stall) {
    return <DeskPackedUp />;
  }

  if (stall.id === DESK_STALL_ID) {
    redirect(sellDeskPath());
  }

  return (
    <DeskFrame stall={stall} listings={deskListingsForStall(stall.id)}>
      <div className="mt-8 space-y-3">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Tuesday is the default door.{" "}
          <Link
            href={sellDeskPath()}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Open the Tuesday desk
          </Link>
          .{" "}
          <Link
            href={sellHoursPath(stall.slug)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Tape this weekend’s hours
          </Link>
          .
        </p>
        <FolderTapeDoor stallId={stall.id} />
        <OtherBoothDesks
          excludeStallId={stall.id}
          seed={overlayDeskStalls(readSellerListings(), stall.id)}
        />
      </div>
    </DeskFrame>
  );
}
