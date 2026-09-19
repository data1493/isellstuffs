import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { ZIP_EMPTY_LINE, ZIP_TABLE_LINE } from "@/lib/listing-zip";
import { listingPath } from "@/lib/paths";

export function ListingZipEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-zip-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Zip not taped"
        title={ZIP_EMPTY_LINE}
        body={`${ZIP_TABLE_LINE} Tape it when walkers want the folder zip in the jewel. It does not drop the tote or write a USB.`}
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
