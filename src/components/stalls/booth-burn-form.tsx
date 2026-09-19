import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_BURN_NOTE_MAX,
  BOOTH_BURN_PAPER_LINE,
  stallBurnPath,
  stallBurnWritePath,
  type BoothBurnNote,
} from "@/lib/booth-burn";
import { cn } from "@/lib/utils";

export function BoothBurnForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothBurnNote;
}) {
  const burnPath = stallBurnPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallBurnWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={burnPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-burn-note">I don&apos;t burn?</Label>
          <Textarea
            id="booth-burn-note"
            name="note"
            rows={3}
            maxLength={BOOTH_BURN_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't burn a disc. Pay and open the folder."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the burn note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_BURN_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallBurnWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={burnPath} />
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
