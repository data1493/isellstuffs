import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_POUR_NOTE_MAX,
  BOOTH_POUR_PAPER_LINE,
  stallPourPath,
  stallPourWritePath,
  type BoothPourNote,
} from "@/lib/booth-pour";
import { cn } from "@/lib/utils";

export function BoothPourForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothPourNote;
}) {
  const pourPath = stallPourPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallPourWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={pourPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-pour-note">I don&apos;t pour?</Label>
          <Textarea
            id="booth-pour-note"
            name="note"
            rows={3}
            maxLength={BOOTH_POUR_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't pour. The mug is empty."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the pour note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_POUR_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallPourWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={pourPath} />
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
