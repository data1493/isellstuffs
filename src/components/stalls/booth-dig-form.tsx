import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_DIG_NOTE_MAX,
  BOOTH_DIG_PAPER_LINE,
  stallDigPath,
  stallDigWritePath,
  type BoothDigNote,
} from "@/lib/booth-dig";
import { cn } from "@/lib/utils";

export function BoothDigForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothDigNote;
}) {
  const digPath = stallDigPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallDigWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={digPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-dig-note">What&apos;s on the table?</Label>
          <Textarea
            id="booth-dig-note"
            name="note"
            rows={3}
            maxLength={BOOTH_DIG_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Don't dig under. The zips are not in the gravel."
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
          {BOOTH_DIG_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallDigWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={digPath} />
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
