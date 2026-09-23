"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { cartShakePath } from "@/lib/paths";

export default function CartShakeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Shake stuck"
      title="The tote would not shake."
      body="Sold chairs and packed leftovers are still in the bag. Try again, or walk back to the tote."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Shake again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={cartShakePath()} />}
          >
            Back to shake
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/cart" />}
          >
            Open the tote
          </Button>
        </>
      }
    />
  );
}
