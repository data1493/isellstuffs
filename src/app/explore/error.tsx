"use client";

import { BrowseError } from "@/components/browse/states";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BrowseError
      title="The concourse lights flickered."
      body={
        error.message
          ? "We could not load the floor. Try again, or pick a hub and walk an aisle."
          : "This aisle did not load. Try again, or walk back to the homepage."
      }
      onRetry={reset}
    />
  );
}
