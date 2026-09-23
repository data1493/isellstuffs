import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BREAK_BILLS_NOTE_MAX,
  BREAK_BILLS_PAPER_LINE,
  type BreakBillsNote,
} from "@/lib/break-bills";
import { stallBreakPath, stallBreakWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BreakBillsForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BreakBillsNote;
}) {
  const breakPath = stallBreakPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallBreakWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={breakPath} />
        <div className="space-y-1.5">
          <Label htmlFor="break-bills-note">What is in the jar?</Label>
          <Textarea
            id="break-bills-note"
            name="note"
            rows={3}
            maxLength={BREAK_BILLS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="ones and fives"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the change note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BREAK_BILLS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallBreakWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={breakPath} />
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
