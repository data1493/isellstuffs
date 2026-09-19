import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_JIG_NOTE_MAX,
  BOOTH_JIG_PAPER_LINE,
  stallJigPath,
  stallJigWritePath,
  type BoothJigNote,
} from "@/lib/booth-jig";
import { cn } from "@/lib/utils";

export function BoothJigForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothJigNote;
}) {
  const jigPath = stallJigPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallJigWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={jigPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-jig-note">I don&apos;t have a jig?</Label>
          <Textarea
            id="booth-jig-note"
            name="note"
            rows={3}
            maxLength={BOOTH_JIG_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a jig. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the jig note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_JIG_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallJigWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={jigPath} />
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
