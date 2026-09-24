"use client";

import { PortalError } from "@/components/portals/portal-error";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PortalError
      reset={reset}
      eyebrow="Floor down"
      title="The portals did not load."
      body="Chat and trade did not render. Nothing was written. Try the floor again."
    />
  );
}
