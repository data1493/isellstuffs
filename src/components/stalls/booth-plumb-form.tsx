import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PLUMB_NOTE_MAX,
  BOOTH_PLUMB_PAPER_LINE,
  stallPlumbPath,
  stallPlumbWritePath,
  type BoothPlumbNote,
} from "@/lib/booth-plumb";
import { cn } from "@/lib/utils";

export function BoothPlumbForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPlumbNote;
}) {
  const plumbPath = stallPlumbPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPlumbWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={plumbPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-plumb-note">I don&apos;t have a plumb?</Label>
          <Textarea
            id="booth-plumb-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PLUMB_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a plumb. Still a crack. Still a stain."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the plumb note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PLUMB_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPlumbWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={plumbPath} />
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
