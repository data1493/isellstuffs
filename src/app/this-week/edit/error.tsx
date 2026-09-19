"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { thisWeekEditPath, thisWeekPath } from "@/lib/paths";

export default function ThisWeekEditError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Tape slipped"
      title="The table did not take the tape."
      body="The overlay did not save. Try again, or walk this week's drop as the fixtures left it."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape it again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={thisWeekPath()} />}
          >
            Weekend table
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={thisWeekEditPath()} />}
          >
            Back to the setter
          </Button>
        </>
      }
    />
  );
}
