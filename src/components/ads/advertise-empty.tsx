import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export function AdvertiseEmpty() {
  return (
    <MallNotice
      padded={false}
      titleAs="h2"
      tone="empty"
      eyebrow="No windows"
      title="No corners are for sale this weekend."
      body="Featured stalls and takeovers are campaign fixtures. When the catalog has none, the mall floor stays unlabeled."
      actions={
        <Button className="rounded-full px-5" render={<Link href="/" />}>
          Walk the concourse
        </Button>
      }
    />
  );
}
