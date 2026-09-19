import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { KNURL_EMPTY_LINE, KNURL_TABLE_LINE } from "@/lib/listing-knurl";
import { listingPath } from "@/lib/paths";

export function ListingKnurlEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-knurl-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Knurl not taped"
        title={KNURL_EMPTY_LINE}
        body={`${KNURL_TABLE_LINE} Tape it when walkers still want the lid knurled. It does not drop the tote or mark it sold.`}
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
