import { buttonVariants } from "@/components/ui/button";
import { sellDeskPath, sellDeskTestedPath } from "@/lib/paths";
import { TESTED_KINDA_MIRROR_SCRIPT } from "@/lib/tested-kinda-pin";
import { cn } from "@/lib/utils";

export function TestedPin({
  listingId,
  intent,
  returnTo,
}: {
  listingId: string;
  intent: "pin" | "drop";
  returnTo?: string;
}) {
  const drop = intent === "drop";

  return (
    <form action={sellDeskTestedPath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: TESTED_KINDA_MIRROR_SCRIPT }} />
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
          buttonVariants({ variant: drop ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {drop ? "Take off the rack" : "Mark kinda"}
      </button>
    </form>
  );
}
