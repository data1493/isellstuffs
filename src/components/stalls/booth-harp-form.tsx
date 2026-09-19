import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_HARP_NOTE_MAX,
  BOOTH_HARP_PAPER_LINE,
  stallHarpPath,
  stallHarpWritePath,
  type BoothHarpNote,
} from "@/lib/booth-harp";
import { cn } from "@/lib/utils";

export function BoothHarpForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothHarpNote;
}) {
  const harpPath = stallHarpPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallHarpWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={harpPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-harp-note">I don&apos;t have a harp?</Label>
          <Textarea
            id="booth-harp-note"
            name="note"
            rows={3}
            maxLength={BOOTH_HARP_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a harp. Shade stays in the box."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the harp note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_HARP_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallHarpWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={harpPath} />
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
