import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PINS_NOTE_MAX,
  BOOTH_PINS_PAPER_LINE,
  stallPinsPath,
  stallPinsWritePath,
  type BoothPinsNote,
} from "@/lib/booth-pins";
import { cn } from "@/lib/utils";

export function BoothPinsForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPinsNote;
}) {
  const pinsPath = stallPinsPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPinsWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={pinsPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-pins-note">I don&apos;t have pins?</Label>
          <Textarea
            id="booth-pins-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PINS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have pins. Hem stays."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the pins note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PINS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPinsWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={pinsPath} />
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
