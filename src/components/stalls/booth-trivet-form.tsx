import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_TRIVET_NOTE_MAX,
  BOOTH_TRIVET_PAPER_LINE,
  stallTrivetPath,
  stallTrivetWritePath,
  type BoothTrivetNote,
} from "@/lib/booth-trivet";
import { cn } from "@/lib/utils";

export function BoothTrivetForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothTrivetNote;
}) {
  const trivetPath = stallTrivetPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallTrivetWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={trivetPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-trivet-note">I don&apos;t have a trivet?</Label>
          <Textarea
            id="booth-trivet-note"
            name="note"
            rows={3}
            maxLength={BOOTH_TRIVET_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a trivet. Still a drawer. Still a chip."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the trivet note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_TRIVET_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallTrivetWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={trivetPath} />
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
