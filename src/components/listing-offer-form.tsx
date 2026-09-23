import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { listingOfferTapePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function ListingOfferForm({
  listingId,
  tagLabel,
}: {
  listingId: string;
  tagLabel: string;
}) {
  return (
    <form
      method="post"
      action={listingOfferTapePath(listingId)}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="offer-amount">Your offer</Label>
        <input
          id="offer-amount"
          name="amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="8"
          aria-describedby="offer-amount-hint"
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <p
          id="offer-amount-hint"
          className="text-sm leading-6 text-muted-foreground"
        >
          Dollars. The tag stays {tagLabel}.
        </p>
      </div>
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
      >
        Tape it
      </button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        A scrap on the lamp. Not a new price. The tote still rings the tag.
      </p>
    </form>
  );
}
