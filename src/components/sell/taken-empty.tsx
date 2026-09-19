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

export function TakenEmpty() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Who left with it"
      title="Nobody walked up. Files stay in the folder."
      body="Paid physical lines show up here after a tote walks. They walked is not a refund. Not a sold sticker."
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

export function TakenNotPhysical({
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
      eyebrow="Who left with it"
      title="Nobody walked up. Files stay in the folder."
      body="This browser only paid files or a gift code. There is no driveway handoff to close. Codes stay at the gift desk."
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
