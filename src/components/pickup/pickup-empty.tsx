import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { folderHasDigitalLines } from "@/lib/digital-folder";
import { folderPath } from "@/lib/paths";

export function PickupEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Pickup slip"
      title="No pickup on this slip."
      body="This tab has no paid physical lines. Files stay in the folder. Pay something you can hold, then walk up with the hours."
      actions={
        <>
          <Button className="rounded-full px-5" render={<Link href="/cart" />}>
            Back to tote
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/explore" />}
          >
            Walk the floor
          </Button>
        </>
      }
    />
  );
}

export function PickupDigitalOnly({
  slip,
  listingIds,
}: {
  slip: string;
  listingIds: string[];
}) {
  const showFolder = folderHasDigitalLines(listingIds);

  return (
    <MallNotice
      tone="empty"
      eyebrow="Pickup slip"
      title="Nothing to pick up. Files stay in the folder."
      body="This slip is a file or a gift code. There is no driveway hour. The mall does not ship. Open the folder for the stand-in."
      actions={
        <>
          {showFolder ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={folderPath(slip)} />}
            >
              Open your folder
            </Button>
          ) : null}
          <Button
            variant={showFolder ? "outline" : undefined}
            className="rounded-full px-5"
            render={<Link href="/cart" />}
          >
            Back to tote
          </Button>
        </>
      }
    />
  );
}
