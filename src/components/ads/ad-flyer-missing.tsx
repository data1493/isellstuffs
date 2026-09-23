import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { advertiseBookPath, advertisePath } from "@/lib/paths";

export function AdFlyerMissing({ padded = true }: { padded?: boolean }) {
  return (
    <MallNotice
      padded={padded}
      tone="missing"
      eyebrow="No flyer"
      title="No flyer for that booking."
      body="The sheet lives in this browser. The id is missing, this is a different machine, or the corner was never booked."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={advertiseBookPath()} />}
          >
            Book next weekend
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Rate card
          </Button>
        </>
      }
    />
  );
}
