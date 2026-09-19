import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_CLAMP_NOTE_MAX,
  BOOTH_CLAMP_PAPER_LINE,
  stallClampPath,
  stallClampWritePath,
  type BoothClampNote,
} from "@/lib/booth-clamp";
import { cn } from "@/lib/utils";

export function BoothClampForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothClampNote;
}) {
  const clampPath = stallClampPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallClampWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={clampPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-clamp-note">I don&apos;t have a clamp?</Label>
          <Textarea
            id="booth-clamp-note"
            name="note"
            rows={3}
            maxLength={BOOTH_CLAMP_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a clamp. Still a folding table."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the clamp note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_CLAMP_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallClampWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={clampPath} />
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
