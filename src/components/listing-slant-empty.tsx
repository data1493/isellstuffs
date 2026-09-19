import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { SLANT_EMPTY_LINE, SLANT_TABLE_LINE } from "@/lib/listing-slant";
import { listingPath } from "@/lib/paths";

export function ListingSlantEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-slant-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Still two weights"
        title={SLANT_EMPTY_LINE}
        body={`${SLANT_TABLE_LINE} Tape it when walkers still want an italic. It does not drop the tote or rewrite the file.`}
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
