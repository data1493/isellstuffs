import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { KNOCKOUT_EMPTY_LINE, KNOCKOUT_TABLE_LINE } from "@/lib/listing-knockout";
import { listingPath } from "@/lib/paths";

export function ListingKnockoutEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-knockout-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Knockout not taped"
        title={KNOCKOUT_EMPTY_LINE}
        body={`${KNOCKOUT_TABLE_LINE} Tape it when walkers still want the grease knocked out. It does not drop the tote or rewrite the file. Knock out the grease, not a login.`}
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
