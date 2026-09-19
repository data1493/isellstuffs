import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { QUANTIZE_EMPTY_LINE, QUANTIZE_TABLE_LINE } from "@/lib/listing-quantize";
import { listingPath } from "@/lib/paths";

export function ListingQuantizeEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-quantize-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Quantize not taped"
        title={QUANTIZE_EMPTY_LINE}
        body={`${QUANTIZE_TABLE_LINE} Tape it when walkers still want the kicks snapped. It does not drop the tote or rewrite the file.`}
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
