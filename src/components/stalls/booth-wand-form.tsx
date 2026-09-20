import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_WAND_NOTE_MAX,
  BOOTH_WAND_PAPER_LINE,
  stallWandPath,
  stallWandWritePath,
  type BoothWandNote,
} from "@/lib/booth-wand";
import { cn } from "@/lib/utils";

export function BoothWandForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothWandNote;
}) {
  const wandPath = stallWandPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallWandWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={wandPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-wand-note">I don&apos;t have a wand?</Label>
          <Textarea
            id="booth-wand-note"
            name="note"
            rows={3}
            maxLength={BOOTH_WAND_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a wand. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the wand note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_WAND_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallWandWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={wandPath} />
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
