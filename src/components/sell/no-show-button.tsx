import { buttonVariants } from "@/components/ui/button";
import { NO_SHOW_MIRROR_SCRIPT } from "@/lib/no-show-handoff";
import { sellNoShowPath, sellNoShowWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function NoShowButton({
  slipId,
  listingId,
  intent,
  returnTo,
}: {
  slipId: string;
  listingId: string;
  intent: "noshow" | "waiting";
  returnTo?: string;
}) {
  const waiting = intent === "waiting";

  return (
    <form action={sellNoShowWritePath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: NO_SHOW_MIRROR_SCRIPT }} />
      <input type="hidden" name="slipId" value={slipId} />
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={intent} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? sellNoShowPath()}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: waiting ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {waiting ? "Still waiting" : "They never showed"}
      </button>
    </form>
  );
}
