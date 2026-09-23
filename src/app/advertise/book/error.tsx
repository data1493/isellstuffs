"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";
import { advertiseBookPath, advertisePath } from "@/lib/paths";

export default function AdvertiseBookError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Booking desk stuck"
      title="Next weekend’s card did not load."
      body="The live corners are still on the floor. Try the desk again, or read this window’s rate card."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the desk again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertisePath()} />}
          >
            Rate card
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href={advertiseBookPath()} />}
          >
            Book menu
          </Button>
        </>
      }
    />
  );
}
