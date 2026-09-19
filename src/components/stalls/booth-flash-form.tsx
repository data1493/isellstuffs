import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_FLASH_NOTE_MAX,
  BOOTH_FLASH_PAPER_LINE,
  stallFlashPath,
  stallFlashWritePath,
  type BoothFlashNote,
} from "@/lib/booth-flash";
import { cn } from "@/lib/utils";

export function BoothFlashForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothFlashNote;
}) {
  const flashPath = stallFlashPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallFlashWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={flashPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-flash-note">I don&apos;t flash?</Label>
          <Textarea
            id="booth-flash-note"
            name="note"
            rows={3}
            maxLength={BOOTH_FLASH_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't flash. What boots is what boots."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the flash note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_FLASH_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallFlashWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={flashPath} />
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
