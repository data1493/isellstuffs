import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { REGISTER_EMPTY_LINE, REGISTER_TABLE_LINE } from "@/lib/listing-register";
import { listingPath } from "@/lib/paths";

export function ListingRegisterEmpty({ listingId }: { listingId: string }) {
  return (
    <div data-register-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Register not taped"
        title={REGISTER_EMPTY_LINE}
        body={`${REGISTER_TABLE_LINE} Tape it when walkers still want bars on the scans. It does not drop the tote or rewrite the file.`}
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
