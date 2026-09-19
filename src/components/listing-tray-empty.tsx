import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { TRAY_EMPTY_LINE, TRAY_TABLE_LINE } from "@/lib/listing-tray";
import { listingPath } from "@/lib/paths";

export function ListingTrayEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-tray-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Tray not taped"
        title={TRAY_EMPTY_LINE}
        body={`${TRAY_TABLE_LINE} Tape it when walkers still want a cleaner jewel. It does not drop the tote or mark it sold.`}
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
