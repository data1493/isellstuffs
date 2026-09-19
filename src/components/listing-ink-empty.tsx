import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { INK_EMPTY_LINE, INK_TABLE_LINE } from "@/lib/listing-ink";
import { listingPath } from "@/lib/paths";

export function ListingInkEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-ink-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Sharpie not taped"
        title={INK_EMPTY_LINE}
        body={`${INK_TABLE_LINE} Tape it when BEATS 07 is already on the disc. It does not drop the tote or rewrite the title.`}
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
