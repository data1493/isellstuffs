import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PREAMP_NOTE_MAX,
  BOOTH_PREAMP_PAPER_LINE,
  stallPreampPath,
  stallPreampWritePath,
  type BoothPreampNote,
} from "@/lib/booth-preamp";
import { cn } from "@/lib/utils";

export function BoothPreampForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPreampNote;
}) {
  const preampPath = stallPreampPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPreampWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={preampPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-preamp-note">I don&apos;t have a preamp?</Label>
          <Textarea
            id="booth-preamp-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PREAMP_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a preamp. Still a crate. Still a table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the preamp note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PREAMP_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPreampWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={preampPath} />
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
