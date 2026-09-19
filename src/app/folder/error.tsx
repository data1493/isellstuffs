"use client";

import Link from "next/link";

import { MallNotice } from "@/components/mall-notice";
import { Button } from "@/components/ui/button";

export default function FolderError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <MallNotice
      tone="error"
      eyebrow="Folder stuck"
      title="The envelope would not open."
      body="The booth folder did not load. The slip is still the proof. Try again, or walk back to the receipt."
      actions={
        <>
          <Button className="rounded-full px-5" onClick={reset}>
            Try the folder again
          </Button>
          <Button
            variant="outline"
            className="rounded-full px-5"
            render={<Link href="/checkout/success" />}
          >
            Back to the slip
          </Button>
        </>
      }
    />
  );
}
