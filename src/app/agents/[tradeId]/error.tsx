"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { agentsPath } from "@/lib/paths";

export default function AgentSlipError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Slip stuck"
      title="That paper would not sit."
      body="The slip did not load. No second confirm wrote. Try again, or walk back to the row."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open the slip again
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
