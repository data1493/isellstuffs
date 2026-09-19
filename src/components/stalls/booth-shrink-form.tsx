import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SHRINK_NOTE_MAX,
  BOOTH_SHRINK_PAPER_LINE,
  stallShrinkPath,
  stallShrinkWritePath,
  type BoothShrinkNote,
} from "@/lib/booth-shrink";
import { cn } from "@/lib/utils";

export function BoothShrinkForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothShrinkNote;
}) {
  const shrinkPath = stallShrinkPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallShrinkWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={shrinkPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-shrink-note">I don&apos;t shrink-wrap?</Label>
          <Textarea
            id="booth-shrink-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SHRINK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't shrink-wrap. Poly stays if it is on."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the shrink note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SHRINK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallShrinkWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={shrinkPath} />
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
