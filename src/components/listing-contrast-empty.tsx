import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  CONTRAST_EMPTY_LINE,
  CONTRAST_TABLE_LINE,
} from "@/lib/listing-contrast";
import { listingPath } from "@/lib/paths";

export function ListingContrastEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-contrast-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Contrast not taped"
        title={CONTRAST_EMPTY_LINE}
        body={`${CONTRAST_TABLE_LINE} Tape it when walkers still want the screen brighter. It does not drop the tote or mark it sold.`}
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
