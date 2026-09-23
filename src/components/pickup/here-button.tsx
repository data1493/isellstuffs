"use client";

import { useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  HERE_COPY,
  HERE_MIRROR_SCRIPT,
  isHandoffHere,
  readHereHandoffs,
  subscribeHere,
} from "@/lib/here-handoff";
import { pickupHerePath, pickupPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function HereButton({
  slipId,
  listingId,
  returnTo,
}: {
  slipId: string;
  listingId: string;
  returnTo?: string;
}) {
  const here = useSyncExternalStore(
    subscribeHere,
    () => isHandoffHere(slipId, listingId, readHereHandoffs()),
    () => false,
  );
  const waiting = here;
  const label = waiting ? "Still on the way" : "I'm walking up";

  return (
    <form
      action={pickupHerePath()}
      method="post"
      data-pickup-here={listingId}
      className="w-full sm:w-auto"
    >
      <script dangerouslySetInnerHTML={{ __html: HERE_MIRROR_SCRIPT }} />
      <input type="hidden" name="slipId" value={slipId} />
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={waiting ? "wait" : "here"} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? pickupPath()}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: waiting ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {label}
      </button>
      {waiting ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{HERE_COPY}</p>
      ) : null}
    </form>
  );
}
