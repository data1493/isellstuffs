import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { LOST_EMPTY_COPY } from "@/lib/booth-lost";
import { stallPath } from "@/lib/paths";

export function BoothLostEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <MallNotice
      tone="empty"
      padded={false}
      titleAs="h2"
      eyebrow="Lost"
      title={LOST_EMPTY_COPY}
      body={`Nobody taped a left-behind title on ${boothName} in this browser. Write the title — green sunglasses — and leave it on this booth.`}
      actions={
        <Button
          variant="outline"
          className="rounded-full px-5"
          render={<Link href={stallPath(slug)} />}
        >
          Back to the stall
        </Button>
      }
    />
  );
}
