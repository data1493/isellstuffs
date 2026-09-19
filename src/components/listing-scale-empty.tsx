import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  SCALE_EMPTY_LINE,
  SCALE_TABLE_LINE,
} from "@/lib/listing-scale";
import { listingPath } from "@/lib/paths";

export function ListingScaleEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-scale-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Scale not taped"
        title={SCALE_EMPTY_LINE}
        body={`${SCALE_TABLE_LINE} Tape it when walkers still want the ratios rewritten. It does not drop the tote or rewrite the file.`}
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
