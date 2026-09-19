import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { DOLBY_EMPTY_LINE, DOLBY_TABLE_LINE } from "@/lib/listing-dolby";
import { listingPath } from "@/lib/paths";

export function ListingDolbyEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-dolby-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Dolby not taped"
        title={DOLBY_EMPTY_LINE}
        body={`${DOLBY_TABLE_LINE} Tape it when walkers still want the hiss encoded. It does not drop the tote or mark it sold.`}
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
