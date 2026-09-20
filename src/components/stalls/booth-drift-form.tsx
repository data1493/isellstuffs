import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_DRIFT_NOTE_MAX,
  BOOTH_DRIFT_PAPER_LINE,
  stallDriftPath,
  stallDriftWritePath,
  type BoothDriftNote,
} from "@/lib/booth-drift";
import { cn } from "@/lib/utils";

export function BoothDriftForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothDriftNote;
}) {
  const driftPath = stallDriftPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallDriftWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={driftPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-drift-note">I don&apos;t have a drift?</Label>
          <Textarea
            id="booth-drift-note"
            name="note"
            rows={3}
            maxLength={BOOTH_DRIFT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a drift. Still a driveway."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the drift note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_DRIFT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallDriftWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={driftPath} />
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
