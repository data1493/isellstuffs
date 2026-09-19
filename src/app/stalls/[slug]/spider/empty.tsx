import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_SPIDER_EMPTY_COPY,
  BOOTH_SPIDER_PAPER_LINE,
} from "@/lib/booth-spider";
import { stallPath } from "@/lib/paths";

export function BoothSpiderEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-spider-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a spider"
        title={BOOTH_SPIDER_EMPTY_COPY}
        body={`${BOOTH_SPIDER_PAPER_LINE} Nobody taped a spider note on ${boothName} in this browser. Still Side A.`}
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
