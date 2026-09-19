import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_SEW_EMPTY_COPY, BOOTH_SEW_PAPER_LINE } from "@/lib/booth-sew";
import { stallPath } from "@/lib/paths";

export function BoothSewEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-sew-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't sew"
        title={BOOTH_SEW_EMPTY_COPY}
        body={`${BOOTH_SEW_PAPER_LINE} Nobody taped a sew note on ${boothName} in this browser. Wash is laundry paper. Size is the tag. Walkers still ask Hall Closet to take a cuff in.`}
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
    </div>
  );
}
