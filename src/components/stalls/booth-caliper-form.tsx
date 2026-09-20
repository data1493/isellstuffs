import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_CALIPER_NOTE_MAX,
  BOOTH_CALIPER_PAPER_LINE,
  stallCaliperPath,
  stallCaliperWritePath,
  type BoothCaliperNote,
} from "@/lib/booth-caliper";
import { cn } from "@/lib/utils";

export function BoothCaliperForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothCaliperNote;
}) {
  const caliperPath = stallCaliperPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallCaliperWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={caliperPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-caliper-note">I don&apos;t have a caliper?</Label>
          <Textarea
            id="booth-caliper-note"
            name="note"
            rows={3}
            maxLength={BOOTH_CALIPER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a caliper. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the caliper note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_CALIPER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallCaliperWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={caliperPath} />
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
