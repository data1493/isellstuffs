import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { BOOTH_FLASH_EMPTY_COPY, BOOTH_FLASH_PAPER_LINE } from "@/lib/booth-flash";
import { stallPath } from "@/lib/paths";

export function BoothFlashEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-flash-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't flash"
        title={BOOTH_FLASH_EMPTY_COPY}
        body={`${BOOTH_FLASH_PAPER_LINE} Nobody taped a flash note on ${boothName} in this browser. What boots is what boots.`}
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
