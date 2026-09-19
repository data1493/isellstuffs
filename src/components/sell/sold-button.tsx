import { buttonVariants } from "@/components/ui/button";
import { sellDeskPath, sellDeskSoldPath } from "@/lib/paths";
import { SOLD_MIRROR_SCRIPT } from "@/lib/sold-overlay";
import { cn } from "@/lib/utils";

export function SoldButton({
  listingId,
  intent,
  returnTo,
}: {
  listingId: string;
  intent: "sold" | "open";
  returnTo?: string;
}) {
  const restock = intent === "open";

  return (
    <form action={sellDeskSoldPath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: SOLD_MIRROR_SCRIPT }} />
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="intent" value={intent} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? sellDeskPath()}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: restock ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {restock ? "Back on the table" : "Sold tonight"}
      </button>
    </form>
  );
}
