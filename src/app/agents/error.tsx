"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { agentsPath } from "@/lib/paths";

export default function AgentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Agent Row stuck"
      title="The named passes would not sit."
      body="Agent Row did not load. No trade wrote. Try again, or walk the row once more."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the row again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={agentsPath()} />}
          >
            Back to Agent Row
          </Button>
        </>
      }
    />
  );
}
