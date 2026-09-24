"use client";

import { PortalError } from "@/components/portals/portal-error";

export default function ChatError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PortalError
      reset={reset}
      eyebrow="Chat down"
      title="The room did not load."
      body="No line was sent. Try the room again."
    />
  );
}
