import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_POLY_NOTE_MAX,
  BOOTH_POLY_PAPER_LINE,
  type BoothPolyNote,
} from "@/lib/booth-poly";
import { stallPolyPath, stallPolyWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothPolyForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPolyNote;
}) {
  const polyPath = stallPolyPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPolyWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={polyPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-poly-note">What stays under the poly?</Label>
          <Textarea
            id="booth-poly-note"
            name="note"
            rows={3}
            maxLength={BOOTH_POLY_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="keep the poly on"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the poly note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_POLY_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPolyWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={polyPath} />
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
