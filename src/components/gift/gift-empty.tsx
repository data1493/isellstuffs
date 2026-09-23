import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { listingPath } from "@/lib/paths";

export function GiftEmpty() {
  return (
    <MallNotice
      tone="empty"
      padded={false}
      titleAs="h2"
      eyebrow="Gift desk"
      title="Buy the card, open the folder, bring the code."
      body="No paper stamp on this browser yet. The stand-in gift card is still a tote line. Checkout is test pay. This desk does not discount the bag."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={listingPath("dl-mall-gift-card")} />}
          >
            See the gift card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/folder" />}
          >
            Open the folder
          </Button>
        </>
      }
    />
  );
}
