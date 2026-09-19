import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_METER_NOTE_MAX,
  BOOTH_METER_PAPER_LINE,
  stallMeterPath,
  stallMeterWritePath,
  type BoothMeterNote,
} from "@/lib/booth-meter";
import { cn } from "@/lib/utils";

export function BoothMeterForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothMeterNote;
}) {
  const meterPath = stallMeterPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallMeterWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={meterPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-meter-note">I don&apos;t have a meter?</Label>
          <Textarea
            id="booth-meter-note"
            name="note"
            rows={3}
            maxLength={BOOTH_METER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a meter. Sold as a pile."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the meter note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_METER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallMeterWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={meterPath} />
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
