import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_LAST_NOTE_MAX,
  BOOTH_LAST_PAPER_LINE,
  stallLastPath,
  stallLastWritePath,
  type BoothLastNote,
} from "@/lib/booth-last";
import { cn } from "@/lib/utils";

export function BoothLastForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothLastNote;
}) {
  const lastPath = stallLastPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallLastWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={lastPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-last-note">I don&apos;t have a last?</Label>
          <Textarea
            id="booth-last-note"
            name="note"
            rows={3}
            maxLength={BOOTH_LAST_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a last. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the last note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_LAST_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallLastWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={lastPath} />
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
