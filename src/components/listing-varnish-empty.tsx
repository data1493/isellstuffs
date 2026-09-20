import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { VARNISH_EMPTY_LINE, VARNISH_TABLE_LINE } from "@/lib/listing-varnish";
import { listingPath } from "@/lib/paths";

export function ListingVarnishEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-varnish-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Varnish not taped"
        title={VARNISH_EMPTY_LINE}
        body={`${VARNISH_TABLE_LINE} Tape it when walkers still want the one-pager coated. It does not drop the tote or rewrite the file.`}
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
