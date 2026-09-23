import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export function LotEmpty() {
  return (
    <MallNotice
      tone="empty"
      eyebrow="The lot"
      title="No folding tables on the map."
      body="The catalog booths did not load. This is not this week's picks. Walk the concourse."
      actions={
        <Button
          variant="outline"
          className="rounded-full px-5"
          render={<Link href="/explore" />}
        >
          Walk the concourse
        </Button>
      }
    />
  );
}
