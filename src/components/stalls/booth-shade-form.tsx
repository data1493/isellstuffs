import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SHADE_NOTE_MAX,
  BOOTH_SHADE_PAPER_LINE,
  type BoothShadeNote,
} from "@/lib/booth-shade";
import { stallShadePath, stallShadeWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothShadeForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothShadeNote;
}) {
  const shadePath = stallShadePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallShadeWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={shadePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-shade-note">What stays in the shade?</Label>
          <Textarea
            id="booth-shade-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SHADE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Records stay in the shade. Jackets crease in the sun."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the shade note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SHADE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallShadeWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={shadePath} />
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
