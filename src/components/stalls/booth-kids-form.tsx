import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_KIDS_NOTE_MAX,
  BOOTH_KIDS_PAPER_LINE,
  type BoothKidsNote,
} from "@/lib/booth-kids";
import { stallKidsPath, stallKidsWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothKidsForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothKidsNote;
}) {
  const kidsPath = stallKidsPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallKidsWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={kidsPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-kids-note">What happens if they pick it up?</Label>
          <Textarea
            id="booth-kids-note"
            name="note"
            rows={3}
            maxLength={BOOTH_KIDS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="kids touch it you buy it"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the kids note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_KIDS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallKidsWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={kidsPath} />
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
