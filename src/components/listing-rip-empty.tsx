import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RIP_EMPTY_LINE, RIP_TABLE_LINE } from "@/lib/listing-rip";
import { listingPath } from "@/lib/paths";

export function ListingRipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-rip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Rip not taped"
        title={RIP_EMPTY_LINE}
        body={`${RIP_TABLE_LINE} Tape it when walkers want a WAV. It does not drop the tote or write a transfer.`}
        actions={
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={listingPath(listingId)} />}
          >
            Back to the listing
          </Button>
        }
      />
    </div>
  );
}
