import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellDeskPath } from "@/lib/paths";

export default function SellDeskStallEmpty() {
  return (
    <MallNotice
      tone="empty"
      eyebrow="Empty table"
      title="That stall packed up."
      body="No booth with that slug. The Tuesday desk is still the default door."
      actions={
        <Button
          className="rounded-full px-5"
          render={<Link href={sellDeskPath()} />}
        >
          Tuesday desk
        </Button>
      }
    />
  );
}
