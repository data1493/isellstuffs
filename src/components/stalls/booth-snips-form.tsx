import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SNIPS_NOTE_MAX,
  BOOTH_SNIPS_PAPER_LINE,
  stallSnipsPath,
  stallSnipsWritePath,
  type BoothSnipsNote,
} from "@/lib/booth-snips";
import { cn } from "@/lib/utils";

export function BoothSnipsForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSnipsNote;
}) {
  const snipsPath = stallSnipsPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSnipsWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={snipsPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-snips-note">I don&apos;t have snips?</Label>
          <Textarea
            id="booth-snips-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SNIPS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have snips. Still a driveway. Still a tangle."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the snips note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SNIPS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSnipsWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={snipsPath} />
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
