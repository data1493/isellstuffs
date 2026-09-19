import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_MATCH_NOTE_MAX,
  BOOTH_MATCH_PAPER_LINE,
  stallMatchPath,
  stallMatchWritePath,
  type BoothMatchNote,
} from "@/lib/booth-match";
import { cn } from "@/lib/utils";

export function BoothMatchForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothMatchNote;
}) {
  const matchPath = stallMatchPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallMatchWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={matchPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-match-note">What&apos;s on the table?</Label>
          <Textarea
            id="booth-match-note"
            name="note"
            rows={3}
            maxLength={BOOTH_MATCH_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Nothing matches."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the match note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_MATCH_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallMatchWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={matchPath} />
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
