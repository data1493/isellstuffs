import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_STATOR_NOTE_MAX,
  BOOTH_STATOR_PAPER_LINE,
  stallStatorPath,
  stallStatorWritePath,
  type BoothStatorNote,
} from "@/lib/booth-stator";
import { cn } from "@/lib/utils";

export function BoothStatorForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothStatorNote;
}) {
  const statorPath = stallStatorPath(slug);

  return (
    <div className="space-y-4">
      <form
        method="post"
        action={stallStatorWritePath()}
        className="space-y-4"
      >
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={statorPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-stator-note">
            I don&apos;t have a stator?
          </Label>
          <Textarea
            id="booth-stator-note"
            name="note"
            rows={3}
            maxLength={BOOTH_STATOR_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a stator. Still a crate."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the stator note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_STATOR_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallStatorWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={statorPath} />
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
