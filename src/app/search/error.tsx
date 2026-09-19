"use client";

import { BrowseError } from "@/components/browse/states";

export default function SearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BrowseError
      title="The search lights flickered."
      body="We could not look that up. Try again, or walk the concourse instead."
      onRetry={reset}
    />
  );
}
