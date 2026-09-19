import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_SEAT_NOTE_MAX,
  BOOTH_SEAT_PAPER_LINE,
  stallSeatPath,
  stallSeatWritePath,
  type BoothSeatNote,
} from "@/lib/booth-seat";
import { cn } from "@/lib/utils";

export function BoothSeatForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothSeatNote;
}) {
  const seatPath = stallSeatPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallSeatWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={seatPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-seat-note">Don&apos;t sit on it?</Label>
          <Textarea
            id="booth-seat-note"
            name="note"
            rows={3}
            maxLength={BOOTH_SEAT_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="Don't sit on the crate."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the sit note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_SEAT_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallSeatWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={seatPath} />
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
