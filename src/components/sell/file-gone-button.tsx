import { buttonVariants } from "@/components/ui/button";
import { FILE_GONE_MIRROR_SCRIPT } from "@/lib/file-gone-overlay";
import { sellDeskGonePath, sellDeskPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function FileGoneButton({
  listingId,
  intent,
  returnTo,
}: {
  listingId: string;
  intent: "gone" | "open";
  returnTo?: string;
}) {
  const restock = intent === "open";

  return (
    <form action={sellDeskGonePath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: FILE_GONE_MIRROR_SCRIPT }} />
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
        {restock ? "Back in the folder" : "File pulled"}
      </button>
    </form>
  );
}
