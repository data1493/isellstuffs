import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_BUTTONS_NOTE_MAX,
  BOOTH_BUTTONS_PAPER_LINE,
  stallButtonsPath,
  stallButtonsWritePath,
  type BoothButtonsNote,
} from "@/lib/booth-buttons";
import { cn } from "@/lib/utils";

export function BoothButtonsForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothButtonsNote;
}) {
  const buttonsPath = stallButtonsPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallButtonsWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={buttonsPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-buttons-note">I don&apos;t have buttons?</Label>
          <Textarea
            id="booth-buttons-note"
            name="note"
            rows={3}
            maxLength={BOOTH_BUTTONS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have buttons. Snaps stay."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the buttons note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_BUTTONS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallButtonsWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={buttonsPath} />
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
