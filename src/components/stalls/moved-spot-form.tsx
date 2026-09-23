import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MOVED_SPOT_NOTE_MAX,
  MOVED_SPOT_PAPER_LINE,
  type MovedSpotNote,
} from "@/lib/moved-spot";
import { stallSpotPath, stallSpotWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function MovedSpotForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: MovedSpotNote;
}) {
  const spot = stallSpotPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSpotWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={spot} />
        <div className="space-y-1.5">
          <Label htmlFor="moved-spot-note">Where did the table go?</Label>
          <Textarea
            id="moved-spot-note"
            name="note"
            rows={3}
            maxLength={MOVED_SPOT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Two spots toward the pavilion."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the gravel note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {MOVED_SPOT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSpotWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={spot} />
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
