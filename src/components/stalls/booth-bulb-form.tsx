import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_BULB_NOTE_MAX,
  BOOTH_BULB_PAPER_LINE,
  stallBulbPath,
  stallBulbWritePath,
  type BoothBulbNote,
} from "@/lib/booth-bulb";
import { cn } from "@/lib/utils";

export function BoothBulbForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothBulbNote;
}) {
  const bulbPath = stallBulbPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallBulbWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={bulbPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-bulb-note">I don&apos;t have a bulb?</Label>
          <Textarea
            id="booth-bulb-note"
            name="note"
            rows={3}
            maxLength={BOOTH_BULB_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a bulb. Twist the neck anyway."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the bulb note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_BULB_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallBulbWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={bulbPath} />
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
