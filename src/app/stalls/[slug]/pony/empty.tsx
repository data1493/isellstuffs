import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_PONY_EMPTY_COPY, BOOTH_PONY_PAPER_LINE } from "@/lib/booth-pony";
import { stallPath } from "@/lib/paths";

export function BoothPonyEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-pony-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a pony"
        title={BOOTH_PONY_EMPTY_COPY}
        body={`${BOOTH_PONY_PAPER_LINE} Nobody taped a pony note on ${boothName} in this browser. Still a closet.`}
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
