import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { advertisePath } from "@/lib/paths";

export function CampaignEnded() {
  return (
    <MallNotice
      tone="missing"
      eyebrow="Window closed"
      title="This campaign is off the floor."
      body="The takeover that paid for this URL is not in the stand-in catalog. The rate card still lists what a corner costs."
      actions={
        <>
          <Button
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            See the rate card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/" />}
          >
            Walk the concourse
          </Button>
        </>
      }
    />
  );
}
