import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FLYWHEEL_NOTE_MAX,
  BOOTH_FLYWHEEL_PAPER_LINE,
  stallFlywheelPath,
  stallFlywheelWritePath,
  type BoothFlywheelNote,
} from "@/lib/booth-flywheel";
import { cn } from "@/lib/utils";

export function BoothFlywheelForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFlywheelNote;
}) {
  const flywheelPath = stallFlywheelPath(slug);

  return (
    <div className="space-y-4">
      <form
        method="post"
        action={stallFlywheelWritePath()}
        className="space-y-4"
      >
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={flywheelPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-flywheel-note">
            I don&apos;t have a flywheel?
          </Label>
          <Textarea
            id="booth-flywheel-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FLYWHEEL_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a flywheel. Still a crate."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the flywheel note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FLYWHEEL_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFlywheelWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={flywheelPath} />
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
