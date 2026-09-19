import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PRINT_NOTE_MAX,
  BOOTH_PRINT_PAPER_LINE,
  stallPrintPath,
  stallPrintWritePath,
  type BoothPrintNote,
} from "@/lib/booth-print";
import { cn } from "@/lib/utils";

export function BoothPrintForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPrintNote;
}) {
  const printPath = stallPrintPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPrintWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={printPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-print-note">I don&apos;t print?</Label>
          <Textarea
            id="booth-print-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PRINT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't print. Take the file."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the print note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PRINT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPrintWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={printPath} />
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
