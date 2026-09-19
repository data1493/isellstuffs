import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_WICK_NOTE_MAX,
  BOOTH_WICK_PAPER_LINE,
  stallWickPath,
  stallWickWritePath,
  type BoothWickNote,
} from "@/lib/booth-wick";
import { cn } from "@/lib/utils";

export function BoothWickForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothWickNote;
}) {
  const wickPath = stallWickPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallWickWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={wickPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-wick-note">I don&apos;t have a wick?</Label>
          <Textarea
            id="booth-wick-note"
            name="note"
            rows={3}
            maxLength={BOOTH_WICK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a wick. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the wick note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_WICK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallWickWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={wickPath} />
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
