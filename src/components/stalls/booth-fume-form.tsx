import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FUME_NOTE_MAX,
  BOOTH_FUME_PAPER_LINE,
  stallFumePath,
  stallFumeWritePath,
  type BoothFumeNote,
} from "@/lib/booth-fume";
import { cn } from "@/lib/utils";

export function BoothFumeForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFumeNote;
}) {
  const fumePath = stallFumePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFumeWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={fumePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-fume-note">I don&apos;t have a fume?</Label>
          <Textarea
            id="booth-fume-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FUME_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a fume. Still a driveway. Still no bench."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the fume note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FUME_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFumeWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={fumePath} />
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
