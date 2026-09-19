import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FIX_NOTE_MAX,
  BOOTH_FIX_PAPER_LINE,
  stallFixPath,
  stallFixWritePath,
  type BoothFixNote,
} from "@/lib/booth-fix";
import { cn } from "@/lib/utils";

export function BoothFixForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFixNote;
}) {
  const fixPath = stallFixPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFixWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={fixPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-fix-note">What don&apos;t you fix?</Label>
          <Textarea
            id="booth-fix-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FIX_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't fix"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape I don&apos;t fix
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FIX_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFixWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={fixPath} />
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
