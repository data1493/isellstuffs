import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BACK_SOON_NOTE_MAX,
  BACK_SOON_PAPER_LINE,
  type BackSoonNote,
} from "@/lib/back-soon";
import { stallBackPath, stallBackWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BackSoonForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BackSoonNote;
}) {
  const back = stallBackPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallBackWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={back} />
        <div className="space-y-1.5">
          <Label htmlFor="back-soon-note">When are you back?</Label>
          <Textarea
            id="back-soon-note"
            name="note"
            rows={3}
            maxLength={BACK_SOON_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Taco truck, back at 1."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the lunch note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BACK_SOON_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallBackWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={back} />
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
