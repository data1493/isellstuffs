import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { RADIO_EMPTY_LINE, RADIO_TABLE_LINE } from "@/lib/listing-radio";
import { listingPath } from "@/lib/paths";

export function ListingRadioEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-radio-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Leave the radio edit"
        title={RADIO_EMPTY_LINE}
        body={`${RADIO_TABLE_LINE} Tape it when walkers still want the album cut. It does not drop the tote or rewrite the splice.`}
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
