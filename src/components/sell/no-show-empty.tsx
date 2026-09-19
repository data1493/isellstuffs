import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  folderPath,
  giftPath,
  pickupPath,
  sellDeskPath,
  sellDeskQueuePath,
} from "@/lib/paths";

export function NoShowEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="They never showed"
      title="Nobody missed the window. Files stay in the folder."
      body="Paid physical lines show up here after a tote walks. A no-show puts the lamp back on the floor. Not a refund. The slip stays."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={sellDeskPath()} />}
          >
            Back to the desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={pickupPath()} />}
          >
            Buyer pickup slip
          </Button>
        </>
      }
    />
  );
}

export function NoShowNotPhysical({
  listingIds,
  slip,
}: {
  listingIds: string[];
  slip?: string;
}) {
  const folder = Boolean(slip && listingIds.length > 0);

  return (
    <MallNotice
      tone="empty"
      eyebrow="They never showed"
      title="Nothing to put back. Files stay in the folder."
      body="This browser only paid files or a gift code. There is no driveway window to miss. Codes stay at the gift desk."
      actions={
        <>
          {folder && slip ? (
            <Button
              className="rounded-full px-5"
              render={<Link href={folderPath(slip)} />}
            >
              Open the folder
            </Button>
          ) : null}
          <Button
            variant={folder ? "outline" : undefined}
            className="rounded-full px-5"
            render={<Link href={giftPath()} />}
          >
            Gift desk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={sellDeskQueuePath()} />}
          >
            Driveway queue
          </Button>
        </>
      }
    />
  );
}
