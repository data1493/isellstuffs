import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_STACK_NOTE_MAX,
  BOOTH_STACK_PAPER_LINE,
  stallStackPath,
  stallStackWritePath,
  type BoothStackNote,
} from "@/lib/booth-stack";
import { cn } from "@/lib/utils";

export function BoothStackForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothStackNote;
}) {
  const stackPath = stallStackPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallStackWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={stackPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-stack-note">What&apos;s on top?</Label>
          <Textarea
            id="booth-stack-note"
            name="note"
            rows={3}
            maxLength={BOOTH_STACK_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Don't unfold the pile."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the pile note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_STACK_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallStackWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={stackPath} />
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
