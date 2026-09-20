import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_RACE_NOTE_MAX,
  BOOTH_RACE_PAPER_LINE,
  stallRacePath,
  stallRaceWritePath,
  type BoothRaceNote,
} from "@/lib/booth-race";
import { cn } from "@/lib/utils";

export function BoothRaceForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothRaceNote;
}) {
  const racePath = stallRacePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallRaceWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={racePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-race-note">I don&apos;t have a race?</Label>
          <Textarea
            id="booth-race-note"
            name="note"
            rows={3}
            maxLength={BOOTH_RACE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a race. Still a crate."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the race note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_RACE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallRaceWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={racePath} />
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
