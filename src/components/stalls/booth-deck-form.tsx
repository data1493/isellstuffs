import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_DECK_NOTE_MAX,
  BOOTH_DECK_PAPER_LINE,
  stallDeckPath,
  stallDeckWritePath,
  type BoothDeckNote,
} from "@/lib/booth-deck";
import { cn } from "@/lib/utils";

export function BoothDeckForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothDeckNote;
}) {
  const deckPath = stallDeckPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallDeckWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={deckPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-deck-note">I don&apos;t have a deck?</Label>
          <Textarea
            id="booth-deck-note"
            name="note"
            rows={3}
            maxLength={BOOTH_DECK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a deck. Spin it at home."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the deck note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_DECK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallDeckWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={deckPath} />
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full",
            )}
          >
            Clear this booth
          </button>
        </form>
      ) : null}
    </div>
  );
}
