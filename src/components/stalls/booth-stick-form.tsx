import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_STICK_NOTE_MAX,
  BOOTH_STICK_PAPER_LINE,
  stallStickPath,
  stallStickWritePath,
  type BoothStickNote,
} from "@/lib/booth-stick";
import { cn } from "@/lib/utils";

export function BoothStickForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothStickNote;
}) {
  const stickPath = stallStickPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallStickWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={stickPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-stick-note">How do they get the zip?</Label>
          <Textarea
            id="booth-stick-note"
            name="note"
            rows={3}
            maxLength={BOOTH_STICK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't email the zip. Pay and open the folder."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the stick
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_STICK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallStickWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={stickPath} />
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
