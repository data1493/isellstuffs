import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_GOBO_EMPTY_COPY, BOOTH_GOBO_PAPER_LINE } from "@/lib/booth-gobo";
import { stallPath } from "@/lib/paths";

export function BoothGoboEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-gobo-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a gobo"
        title={BOOTH_GOBO_EMPTY_COPY}
        body={`${BOOTH_GOBO_PAPER_LINE} Nobody taped a gobo note on ${boothName} in this browser. Still a folder. Still a jewel case.`}
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
