import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_MIRROR_NOTE_MAX,
  BOOTH_MIRROR_PAPER_LINE,
  stallMirrorPath,
  stallMirrorWritePath,
  type BoothMirrorNote,
} from "@/lib/booth-mirror";
import { cn } from "@/lib/utils";

export function BoothMirrorForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothMirrorNote;
}) {
  const mirrorPath = stallMirrorPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallMirrorWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={mirrorPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-mirror-note">I don&apos;t have a mirror?</Label>
          <Textarea
            id="booth-mirror-note"
            name="note"
            rows={3}
            maxLength={BOOTH_MIRROR_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a mirror. Still a rack."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the mirror note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_MIRROR_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallMirrorWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={mirrorPath} />
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
