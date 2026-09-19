"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { agentTalkPath, agentsPath } from "@/lib/paths";

export default function AgentTalkError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Talk stuck"
      title="The line would not tape."
      body="Agent talk did not load. Named-pass rates did not write. Try again, or walk back to the row."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Open talk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={agentTalkPath()} />}
          >
            Back to talk
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={agentsPath()} />}
          >
            Agent Row
          </Button>
        </>
      }
    />
  );
}
