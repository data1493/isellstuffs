import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_THIMBLE_NOTE_MAX,
  BOOTH_THIMBLE_PAPER_LINE,
  stallThimblePath,
  stallThimbleWritePath,
  type BoothThimbleNote,
} from "@/lib/booth-thimble";
import { cn } from "@/lib/utils";

export function BoothThimbleForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothThimbleNote;
}) {
  const thimblePath = stallThimblePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallThimbleWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={thimblePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-thimble-note">I don&apos;t have a thimble?</Label>
          <Textarea
            id="booth-thimble-note"
            name="note"
            rows={3}
            maxLength={BOOTH_THIMBLE_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a thimble. Still a closet. Still worn twice."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the thimble note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_THIMBLE_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallThimbleWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={thimblePath} />
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
