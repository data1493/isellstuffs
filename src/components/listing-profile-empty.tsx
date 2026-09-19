import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { PROFILE_EMPTY_LINE, PROFILE_TABLE_LINE } from "@/lib/listing-profile";
import { listingPath } from "@/lib/paths";

export function ListingProfileEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-profile-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Three looks"
        title={PROFILE_EMPTY_LINE}
        body={`${PROFILE_TABLE_LINE} Tape it when walkers still want a camera profile. It does not drop the tote or rewrite the file.`}
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
