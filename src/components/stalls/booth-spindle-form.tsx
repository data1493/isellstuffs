import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SPINDLE_NOTE_MAX,
  BOOTH_SPINDLE_PAPER_LINE,
  stallSpindlePath,
  stallSpindleWritePath,
  type BoothSpindleNote,
} from "@/lib/booth-spindle";
import { cn } from "@/lib/utils";

export function BoothSpindleForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSpindleNote;
}) {
  const spindlePath = stallSpindlePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSpindleWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={spindlePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-spindle-note">I don&apos;t have a spindle?</Label>
          <Textarea
            id="booth-spindle-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SPINDLE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a spindle. Still a jewel."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the spindle note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SPINDLE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSpindleWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={spindlePath} />
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
