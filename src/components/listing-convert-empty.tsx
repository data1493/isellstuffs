import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { CONVERT_EMPTY_LINE, CONVERT_TABLE_LINE } from "@/lib/listing-convert";
import { listingPath } from "@/lib/paths";

export function ListingConvertEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-convert-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Open to convert"
        title={CONVERT_EMPTY_LINE}
        body={`${CONVERT_TABLE_LINE} Tape it when walkers ask to transcode the cubes. It does not drop the tote or rewrite the file.`}
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
