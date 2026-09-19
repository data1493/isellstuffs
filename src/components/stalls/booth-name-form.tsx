import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_NAME_NOTE_MAX,
  BOOTH_NAME_PAPER_LINE,
  stallNamePath,
  stallNameWritePath,
  type BoothNameNote,
} from "@/lib/booth-name";
import { cn } from "@/lib/utils";

export function BoothNameForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothNameNote;
}) {
  const namePath = stallNamePath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallNameWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={namePath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-name-note">I will not name them?</Label>
          <Textarea
            id="booth-name-note"
            name="note"
            rows={3}
            maxLength={BOOTH_NAME_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I will not name them. Side A still plays."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the name note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_NAME_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallNameWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={namePath} />
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
