import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_WRAP_NOTE_MAX,
  BOOTH_WRAP_PAPER_LINE,
  type BoothWrapNote,
} from "@/lib/booth-wrap";
import { stallWrapPath, stallWrapWritePath } from "@/lib/paths";
import { cn } from "@/lib/utils";

export function BoothWrapForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothWrapNote;
}) {
  const wrapPath = stallWrapPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallWrapWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={wrapPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-wrap-note">What do you wrap?</Label>
          <Textarea
            id="booth-wrap-note"
            name="note"
            rows={3}
            maxLength={BOOTH_WRAP_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="mugs get newspaper"
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the wrap
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_WRAP_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallWrapWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={wrapPath} />
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
