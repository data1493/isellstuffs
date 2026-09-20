import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_LIFTER_NOTE_MAX,
  BOOTH_LIFTER_PAPER_LINE,
  stallLifterPath,
  stallLifterWritePath,
  type BoothLifterNote,
} from "@/lib/booth-lifter";
import { cn } from "@/lib/utils";

export function BoothLifterForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothLifterNote;
}) {
  const lifterPath = stallLifterPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallLifterWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={lifterPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-lifter-note">I don&apos;t have a lifter?</Label>
          <Textarea
            id="booth-lifter-note"
            name="note"
            rows={3}
            maxLength={BOOTH_LIFTER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a lifter. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the lifter note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_LIFTER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallLifterWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={lifterPath} />
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
