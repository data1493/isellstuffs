import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_DIG_EMPTY_COPY, BOOTH_DIG_PAPER_LINE } from "@/lib/booth-dig";
import { stallPath } from "@/lib/paths";

export function BoothDigEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-dig-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Don't dig under"
        title={BOOTH_DIG_EMPTY_COPY}
        body={`${BOOTH_DIG_PAPER_LINE} Nobody taped a gravel note on ${boothName} in this browser. Van is more out back. Lost is sunglasses. Walkers still crawl under Sunday Crate.`}
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
