import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_INNERS_EMPTY_COPY,
  BOOTH_INNERS_PAPER_LINE,
} from "@/lib/booth-inners";
import { stallPath } from "@/lib/paths";

export function BoothInnersEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-inners-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have inners"
        title={BOOTH_INNERS_EMPTY_COPY}
        body={`${BOOTH_INNERS_PAPER_LINE} Nobody taped an inners note on ${boothName} in this browser. Grocery bag.`}
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
