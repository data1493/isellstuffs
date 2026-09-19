import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_STAY_NOTE_MAX,
  BOOTH_STAY_PAPER_LINE,
  type BoothStayNote,
} from "@/lib/booth-stay";
import { stallStayPath, stallStayWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothStayForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothStayNote;
}) {
  const stayPath = stallStayPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallStayWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={stayPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-stay-note">What stays?</Label>
          <Textarea
            id="booth-stay-note"
            name="note"
            rows={3}
            maxLength={BOOTH_STAY_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="hangers stay"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the stay note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_STAY_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallStayWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={stayPath} />
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
