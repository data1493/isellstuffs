import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_STAY_EMPTY_COPY, BOOTH_STAY_PAPER_LINE } from "@/lib/booth-stay";
import { stallPath } from "@/lib/paths";

export function BoothStayEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-stay-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Hangers stay"
        title={BOOTH_STAY_EMPTY_COPY}
        body={`${BOOTH_STAY_PAPER_LINE} Nobody taped furniture on ${boothName} in this browser. Free is still extras you can take.`}
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
