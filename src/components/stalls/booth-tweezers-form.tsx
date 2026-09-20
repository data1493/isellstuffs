import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_TWEEZERS_NOTE_MAX,
  BOOTH_TWEEZERS_PAPER_LINE,
  stallTweezersPath,
  stallTweezersWritePath,
  type BoothTweezersNote,
} from "@/lib/booth-tweezers";
import { cn } from "@/lib/utils";

export function BoothTweezersForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothTweezersNote;
}) {
  const tweezersPath = stallTweezersPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallTweezersWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={tweezersPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-tweezers-note">I don&apos;t have tweezers?</Label>
          <Textarea
            id="booth-tweezers-note"
            name="note"
            rows={3}
            maxLength={BOOTH_TWEEZERS_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have tweezers. Still a driveway. Still a crack."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the tweezers note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_TWEEZERS_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallTweezersWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={tweezersPath} />
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
