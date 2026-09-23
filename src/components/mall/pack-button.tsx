import { buttonVariants } from "@/components/ui/button";
import { PACKED_MIRROR_SCRIPT } from "@/lib/packed-stall";
import { sellDeskPackPath, sellDeskPath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function PackButton({
  stallId,
  intent,
  returnTo,
}: {
  stallId: string;
  intent: "pack" | "open";
  returnTo?: string;
}) {
  const unpack = intent === "open";

  return (
    <form action={sellDeskPackPath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: PACKED_MIRROR_SCRIPT }} />
      <input type="hidden" name="stallId" value={stallId} />
      <input type="hidden" name="intent" value={intent} />
      <input
        type="hidden"
        name="returnTo"
        value={returnTo ?? sellDeskPath()}
      />
      <button
        type="submit"
        className={cn(
          buttonVariants({ variant: unpack ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {unpack ? "Set the table back up" : "Pack up for the week"}
      </button>
    </form>
  );
}
