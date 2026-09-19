import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_JIG_EMPTY_COPY, BOOTH_JIG_PAPER_LINE } from "@/lib/booth-jig";
import { stallPath } from "@/lib/paths";

export function BoothJigEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-jig-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't have a jig"
        title={BOOTH_JIG_EMPTY_COPY}
        body={`${BOOTH_JIG_PAPER_LINE} Nobody taped a jig note on ${boothName} in this browser. Still a table.`}
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
