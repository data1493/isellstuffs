import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { sellPath } from "@/lib/paths";

export default function SellStartEmpty() {
  return (
    <MallNotice
      tone="empty"
      eyebrow="Empty table"
      title="No booth to pick."
      body="The mall still lists on stalls that already exist. Walk back to sell and start again."
      actions={
        <Button className="rounded-full px-5" render={<Link href={sellPath()} />}>
          Back to sell
        </Button>
      }
    />
  );
}
