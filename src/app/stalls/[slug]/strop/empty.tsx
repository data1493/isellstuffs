import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_STROP_EMPTY_COPY,
  BOOTH_STROP_PAPER_LINE,
} from "@/lib/booth-strop";
import { stallPath } from "@/lib/paths";

export function BoothStropEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-strop-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a strop"
        title={BOOTH_STROP_EMPTY_COPY}
        body={`${BOOTH_STROP_PAPER_LINE} Nobody taped a strop note on ${boothName} in this browser. Still a crate. Still a skip.`}
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
