"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { advertisePath } from "@/lib/paths";

export default function CampaignError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Campaign jammed"
      title="This paid page did not load."
      body="The takeover may still be on the concourse. Try again, or read the rate card."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the campaign again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Mall rate card
          </Button>
        </>
      }
    />
  );
}
