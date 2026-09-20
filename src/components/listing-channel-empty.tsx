import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CHANNEL_EMPTY_LINE, CHANNEL_TABLE_LINE } from "@/lib/listing-channel";
import { listingPath } from "@/lib/paths";

export function ListingChannelEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-channel-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Channel not taped"
        title={CHANNEL_EMPTY_LINE}
        body={`${CHANNEL_TABLE_LINE} Tape it when walkers still want a shop channel. It does not drop the tote or mark it sold.`}
        actions={
          <Button
            variant="outline"
            className="h-11 w-full rounded-full px-5 sm:w-auto"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
