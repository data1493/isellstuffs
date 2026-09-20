import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_CHALK_NOTE_MAX,
  BOOTH_CHALK_PAPER_LINE,
  stallChalkPath,
  stallChalkWritePath,
  type BoothChalkNote,
} from "@/lib/booth-chalk";
import { cn } from "@/lib/utils";

export function BoothChalkForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothChalkNote;
}) {
  const chalkPath = stallChalkPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallChalkWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={chalkPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-chalk-note">I don&apos;t have chalk?</Label>
          <Textarea
            id="booth-chalk-note"
            name="note"
            rows={3}
            maxLength={BOOTH_CHALK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have chalk. Still a season. Still no lookbook."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the chalk note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_CHALK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallChalkWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={chalkPath} />
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
