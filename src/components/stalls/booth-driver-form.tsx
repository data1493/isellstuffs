import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_DRIVER_NOTE_MAX,
  BOOTH_DRIVER_PAPER_LINE,
  stallDriverPath,
  stallDriverWritePath,
  type BoothDriverNote,
} from "@/lib/booth-driver";
import { cn } from "@/lib/utils";

export function BoothDriverForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothDriverNote;
}) {
  const driverPath = stallDriverPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallDriverWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={driverPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-driver-note">I don&apos;t have a driver?</Label>
          <Textarea
            id="booth-driver-note"
            name="note"
            rows={3}
            maxLength={BOOTH_DRIVER_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a driver. Blister stays closed."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the driver note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_DRIVER_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallDriverWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={driverPath} />
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
