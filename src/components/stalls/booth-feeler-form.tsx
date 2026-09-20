import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FEELER_NOTE_MAX,
  BOOTH_FEELER_PAPER_LINE,
  stallFeelerPath,
  stallFeelerWritePath,
  type BoothFeelerNote,
} from "@/lib/booth-feeler";
import { cn } from "@/lib/utils";

export function BoothFeelerForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFeelerNote;
}) {
  const feelerPath = stallFeelerPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFeelerWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={feelerPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-feeler-note">I don&apos;t have a feeler?</Label>
          <Textarea
            id="booth-feeler-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FEELER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a feeler. Still a crack. Still a stain."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the feeler note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FEELER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFeelerWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={feelerPath} />
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
