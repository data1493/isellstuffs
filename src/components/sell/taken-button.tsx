"use client";

import { buttonVariants } from "@/components/ui/button";
import { sellTakenPath } from "@/lib/paths";
import { TAKEN_MIRROR_SCRIPT } from "@/lib/taken-handoff";
import { cn } from "@/lib/utils";

export function TakenButton({
  slipId,
  listingId,
  intent,
  returnTo,
  look = "button",
}: {
  slipId: string;
  listingId: string;
  intent: "taken" | "waiting";
  returnTo?: string;
  look?: "button" | "text";
}) {
  const waiting = intent === "waiting";
  const label = waiting ? "Still waiting" : look === "text" ? "I took it" : "They took it";

  return (
    <form action={sellTakenPath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: TAKEN_MIRROR_SCRIPT }} />
      <input type="hidden" name="slipId" value={slipId} />
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={intent} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? sellTakenPath()}
      />
      <button
        type="submit"
        className={
          look === "text"
            ? "mt-0.5 block text-sm text-foreground underline-offset-4 hover:underline"
            : cn(
                buttonVariants({ variant: waiting ? "outline" : "secondary" }),
                "h-11 w-full rounded-full px-5 sm:w-auto",
              )
        }
      >
        {label}
      </button>
    </form>
  );
}
