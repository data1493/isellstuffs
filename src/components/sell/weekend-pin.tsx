import { buttonVariants } from "@/components/ui/button";
import { sellDeskPath, sellDeskWeekendPath } from "@/lib/paths";
import { WEEKEND_PIN_MIRROR_SCRIPT } from "@/lib/weekend-table-pin";
import { cn } from "@/lib/utils";

export function WeekendPin({
  listingId,
  intent,
  returnTo,
}: {
  listingId: string;
  intent: "pin" | "drop";
  returnTo?: string;
}) {
  const taped = intent === "drop";

  return (
    <form action={sellDeskWeekendPath()} method="post" className="w-full sm:w-auto">
      <script dangerouslySetInnerHTML={{ __html: WEEKEND_PIN_MIRROR_SCRIPT }} />
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
          buttonVariants({ variant: taped ? "outline" : "secondary" }),
          "h-11 w-full rounded-full px-5 sm:w-auto",
        )}
      >
        {taped ? "Take off the weekend table" : "Tape onto this weekend"}
      </button>
    </form>
  );
}
