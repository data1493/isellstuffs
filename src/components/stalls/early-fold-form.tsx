import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EARLY_FOLD_NOTE_MAX,
  EARLY_FOLD_PAPER_LINE,
  type EarlyFoldNote,
} from "@/lib/early-fold";
import { stallFoldPath, stallFoldWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function EarlyFoldForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: EarlyFoldNote;
}) {
  const fold = stallFoldPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFoldWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={fold} />
        <div className="space-y-1.5">
          <Label htmlFor="early-fold-note">When are you folding?</Label>
          <Textarea
            id="early-fold-note"
            name="note"
            rows={3}
            maxLength={EARLY_FOLD_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Boxing at noon."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the last-call note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {EARLY_FOLD_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFoldWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={fold} />
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
