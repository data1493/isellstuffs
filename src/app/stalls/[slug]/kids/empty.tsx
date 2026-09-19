import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_KIDS_EMPTY_COPY, BOOTH_KIDS_PAPER_LINE } from "@/lib/booth-kids";
import { stallPath } from "@/lib/paths";

export function BoothKidsEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-kids-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="Kids touch it, you buy it"
        title={BOOTH_KIDS_EMPTY_COPY}
        body={`${BOOTH_KIDS_PAPER_LINE} Nobody taped a kids note on ${boothName} in this browser. Film is still no photos.`}
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
