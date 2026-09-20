import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_PLINTH_NOTE_MAX,
  BOOTH_PLINTH_PAPER_LINE,
  stallPlinthPath,
  stallPlinthWritePath,
  type BoothPlinthNote,
} from "@/lib/booth-plinth";
import { cn } from "@/lib/utils";

export function BoothPlinthForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPlinthNote;
}) {
  const plinthPath = stallPlinthPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPlinthWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={plinthPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-plinth-note">I don&apos;t have a plinth?</Label>
          <Textarea
            id="booth-plinth-note"
            name="note"
            rows={3}
            maxLength={BOOTH_PLINTH_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a plinth. Still a crate. Still a skip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the plinth note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_PLINTH_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPlinthWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={plinthPath} />
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
