import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOTH_MALLET_NOTE_MAX,
  BOOTH_MALLET_PAPER_LINE,
  stallMalletPath,
  stallMalletWritePath,
  type BoothMalletNote,
} from "@/lib/booth-mallet";
import { cn } from "@/lib/utils";

export function BoothMalletForm({
  stallId,
  slug,
  current,
}: {
  stallId: string;
  slug: string;
  current?: BoothMalletNote;
}) {
  const malletPath = stallMalletPath(slug);

  return (
    <div className="space-y-4">
      <form method="post" action={stallMalletWritePath()} className="space-y-4">
        <input type="hidden" name="stallId" value={stallId} />
        <input type="hidden" name="intent" value="tape" />
        <input type="hidden" name="returnTo" value={malletPath} />
        <div className="space-y-1.5">
          <Label htmlFor="booth-mallet-note">I don&apos;t have a mallet?</Label>
          <Textarea
            id="booth-mallet-note"
            name="note"
            rows={3}
            maxLength={BOOTH_MALLET_NOTE_MAX}
            autoComplete="off"
            defaultValue={current?.note}
            placeholder="I don't have a mallet. Still a driveway. Still a stain."
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full rounded-full")}
        >
          Tape the mallet note
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {BOOTH_MALLET_PAPER_LINE} One booth. One sentence.
        </p>
      </form>

      {current ? (
        <form method="post" action={stallMalletWritePath()}>
          <input type="hidden" name="stallId" value={stallId} />
          <input type="hidden" name="intent" value="clear" />
          <input type="hidden" name="note" value="" />
          <input type="hidden" name="returnTo" value={malletPath} />
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
