import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { FREE_EMPTY_COPY } from "@/lib/free-box";
import { stallPath } from "@/lib/paths";

export function FreeBoxEmpty({
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
      eyebrow="Free box"
      title={FREE_EMPTY_COPY}
      body={`Nobody taped a free title on ${boothName} in this browser. Write the title — extra plastic hangers — and leave it on the pile.`}
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
