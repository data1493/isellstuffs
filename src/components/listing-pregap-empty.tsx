import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PREGAP_EMPTY_LINE, PREGAP_TABLE_LINE } from "@/lib/listing-pregap";
import { listingPath } from "@/lib/paths";

export function ListingPregapEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-pregap-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Pregap not taped"
        title={PREGAP_EMPTY_LINE}
        body={`${PREGAP_TABLE_LINE} Tape it when walkers still want a shop hidden lead-in. It does not drop the tote or mark it sold.`}
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
