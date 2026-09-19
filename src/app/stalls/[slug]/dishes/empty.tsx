import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import {
  BOOTH_DISHES_EMPTY_COPY,
  BOOTH_DISHES_PAPER_LINE,
} from "@/lib/booth-dishes";
import { stallPath } from "@/lib/paths";

export function BoothDishesEmpty({
  slug,
  boothName,
}: {
  slug: string;
  boothName: string;
}) {
  return (
    <div data-booth-dishes-empty="">
      <MallNotice
        tone="empty"
        padded={false}
        titleAs="h2"
        eyebrow="I don't do dishes"
        title={BOOTH_DISHES_EMPTY_COPY}
        body={`${BOOTH_DISHES_PAPER_LINE} Nobody taped a dishes note on ${boothName} in this browser. Pour is I don't pour. Chip stays. Still a mug.`}
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
