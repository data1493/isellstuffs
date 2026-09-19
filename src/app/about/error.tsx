"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { aboutPath } from "@/lib/paths";

export default function AboutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Story stuck"
      title="The about page did not tape."
      body="The mall is still a flea market with a roof. Try the story again, or walk the concourse."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Tape it again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={aboutPath()} />}
          >
            Back to about
          </Button>
        </>
      }
    />
  );
}
